import { useState, useEffect, useRef } from 'react';
import type { Activity } from '../../../../types/activity';
import type { Category, ExpandedFilter } from '../types';

interface UseActivityFiltersProps {
  activities: Activity[];
  categories: Category[];
}

export const useActivityFilters = ({ activities, categories }: UseActivityFiltersProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedSubcategory, setSelectedSubcategory] = useState('');
  const [filterStartTime, setFilterStartTime] = useState('');
  const [filterEndTime, setFilterEndTime] = useState('');
  const [expandedFilter, setExpandedFilter] = useState<ExpandedFilter>('search');
  
  const filterRef = useRef<HTMLDivElement>(null);

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
      if (selectedCategory && activity.category !== selectedCategory) {
        return false;
      }
      if (selectedSubcategory && activity.subcategory !== selectedSubcategory) {
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
      const timeA = a.startTime 
        ? new Date(`${a.date}T${a.startTime}`).getTime()
        : new Date(a.timestamp).getTime();
      const timeB = b.startTime 
        ? new Date(`${b.date}T${b.startTime}`).getTime()
        : new Date(b.timestamp).getTime();
      return timeB - timeA;
    });

  const availableSubcategories = selectedCategory
    ? categories.find(cat => cat.value === selectedCategory)?.subcategories || []
    : [];

  const hasActiveFilters = searchTerm || selectedCategory || selectedSubcategory || filterStartTime || filterEndTime;

  const getCategoryLabel = (value: string) => {
    return categories.find(cat => cat.value === value)?.label || value;
  };

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
    setSelectedSubcategory('');
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
    getCategoryLabel,
    setSearchTerm,
    handleCategoryChange,
    handleSubcategoryChange,
    handleTimeChange,
    toggleFilter,
    handleClearFilters,
  };
};