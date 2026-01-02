import { useState, useEffect, useRef } from 'react';
import { activityService } from '../../../../services';
import type { Activity } from '../../../../types/activity';
import type { ExpandedFilter } from '../types';

interface UseActivityFiltersProps {
  activities: Activity[];
  categorySuggestions: string[];
}

export const useActivityFilters = ({ 
  activities, 
  categorySuggestions 
}: UseActivityFiltersProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedSubcategory, setSelectedSubcategory] = useState('');
  const [filterStartTime, setFilterStartTime] = useState('');
  const [filterEndTime, setFilterEndTime] = useState('');
  const [expandedFilter, setExpandedFilter] = useState<ExpandedFilter>('search');
  const [availableSubcategories, setAvailableSubcategories] = useState<string[]>([]);
  
  const filterRef = useRef<HTMLDivElement>(null);

  // Fetch subcategories when category changes
  useEffect(() => {
    const fetchSubcategories = async () => {
      if (!selectedCategory) {
        setAvailableSubcategories([]);
        return;
      }

      try {
        const subs = await activityService.getSubcategorySuggestions(selectedCategory, '');
        setAvailableSubcategories(subs);
      } catch (err) {
        console.error('Failed to fetch subcategories:', err);
        setAvailableSubcategories([]);
      }
    };

    fetchSubcategories();
  }, [selectedCategory]);

  // Click outside to collapse - but return to search as default
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (filterRef.current && !filterRef.current.contains(event.target as Node)) {
        setExpandedFilter('search');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

// Filter and sort activities
const filteredAndSortedActivities = [...activities]
  .filter(activity => {
    if (searchTerm && !activity.title?.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    if (selectedCategory && activity.category.toLowerCase() !== selectedCategory.toLowerCase()) {
      return false;
    }
    if (selectedSubcategory && activity.subcategory?.toLowerCase() !== selectedSubcategory.toLowerCase()) {
      return false;
    }
    if (filterStartTime || filterEndTime) {
      const activityStart = activity.startTime;
      const activityEnd = activity.endTime;
      
      if (!activityStart) {
        return false;
      }
      
      if (filterStartTime && activityStart < filterStartTime) {
        return false;
      }
      
      if (filterEndTime) {
        const timeToCheck = activityEnd || activityStart;
        if (timeToCheck > filterEndTime) {
          return false;
        }
      }
    }
    return true;
  })
  .sort((a, b) => {
    // Use startTime if available, otherwise fall back to createdAt
    const timeA = a.startTime 
      ? new Date(`${a.date}T${a.startTime}`).getTime()
      : new Date(a.createdAt).getTime(); // ✅ Removed || a.timestamp
    const timeB = b.startTime 
      ? new Date(`${b.date}T${b.startTime}`).getTime()
      : new Date(b.createdAt).getTime(); // ✅ Removed || b.timestamp
    return timeB - timeA; // Most recent first
  });

  const hasActiveFilters = searchTerm || selectedCategory || selectedSubcategory || filterStartTime || filterEndTime;

  const handleClearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('');
    setSelectedSubcategory('');
    setFilterStartTime('');
    setFilterEndTime('');
    setExpandedFilter('search');
  };

  const handleCategoryChange = (value: string) => {
    setSelectedCategory(value);
    setSelectedSubcategory(''); // Clear subcategory when category changes
    if (value) {
      setExpandedFilter('search');
    }
  };

  const handleSubcategoryChange = (value: string) => {
    setSelectedSubcategory(value);
    if (value) {
      setExpandedFilter('search');
    }
  };

  const handleTimeChange = (type: 'start' | 'end', value: string) => {
    if (type === 'start') {
      setFilterStartTime(value);
    } else {
      setFilterEndTime(value);
    }
  };

  const toggleFilter = (filter: ExpandedFilter) => {
    if (filter === 'search' && expandedFilter === 'search') {
      return;
    }
    setExpandedFilter(expandedFilter === filter ? 'search' : filter);
  };

  return {
    filterRef,
    searchTerm,
    selectedCategory,
    selectedSubcategory,
    filterStartTime,
    filterEndTime,
    expandedFilter,
    filteredAndSortedActivities,
    availableSubcategories,
    hasActiveFilters,
    setSearchTerm,
    handleCategoryChange,
    handleSubcategoryChange,
    handleTimeChange,
    toggleFilter,
    handleClearFilters,
  };
};