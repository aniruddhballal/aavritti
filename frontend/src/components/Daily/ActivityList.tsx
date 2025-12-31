// (List of activities)
// a component that manages the list of activities, including the "Add Activity" form (for today), the past/future date banner, and the empty state. It maps through activities and renders ActivityItem components.

import { Plus, Search, X, Filter, Tag, Clock } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import type { Activity } from '../../types/activity';
import ActivityItem from './ActivityItem';
import AddActivityModal from './AddActivityModal';
import { activityService } from '../../services';
import { useDarkMode } from '../../contexts/DarkModeContext';

interface Category {
  value: string;
  label: string;
  subcategories?: string[];
}

interface ActivityListProps {
  activities: Activity[];
  isToday: boolean;
  defaultCategory: string;
  onActivityAdded: () => void;
  onEditActivity: (activity: Activity) => void;
}

type ExpandedFilter = 'search' | 'category' | 'subcategory' | 'time' | null;

const ActivityList = ({ 
  activities, 
  isToday, 
  defaultCategory,
  onActivityAdded,
  onEditActivity
}: ActivityListProps) => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const { isDarkMode } = useDarkMode();
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedSubcategory, setSelectedSubcategory] = useState('');
  const [filterStartTime, setFilterStartTime] = useState('');
  const [filterEndTime, setFilterEndTime] = useState('');
  
  // UI state for expanded filter - search is expanded by default
  const [expandedFilter, setExpandedFilter] = useState<ExpandedFilter>('search');
  const filterRef = useRef<HTMLDivElement>(null);

  // Fetch categories on mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await activityService.getCategories();
        setCategories(data.categories);
      } catch (err) {
        console.error('Failed to fetch categories:', err);
      }
    };
    fetchCategories();
  }, []);

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

  const handleClearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('');
    setSelectedSubcategory('');
    setFilterStartTime('');
    setFilterEndTime('');
    setExpandedFilter('search'); // Return to search expanded
  };

  const handleCategoryChange = (value: string) => {
    setSelectedCategory(value);
    setSelectedSubcategory('');
    if (value) {
      setExpandedFilter('search'); // Return to search after selection
    }
  };

  const handleSubcategoryChange = (value: string) => {
    setSelectedSubcategory(value);
    if (value) {
      setExpandedFilter('search'); // Return to search after selection
    }
  };

  const handleTimeChange = (type: 'start' | 'end', value: string) => {
    if (type === 'start') {
      setFilterStartTime(value);
    } else {
      setFilterEndTime(value);
    }
  };

  const handleAddClick = () => {
    if (isToday) {
      setIsAddModalOpen(true);
    }
  };

  const handleModalClose = () => {
    setIsAddModalOpen(false);
  };

  const handleActivityAdded = () => {
    setIsAddModalOpen(false);
    onActivityAdded();
  };

  const hasActiveFilters = searchTerm || selectedCategory || selectedSubcategory || filterStartTime || filterEndTime;

  const getCategoryLabel = (value: string) => {
    return categories.find(cat => cat.value === value)?.label || value;
  };

  const toggleFilter = (filter: ExpandedFilter) => {
    // If clicking on search when it's already expanded, do nothing
    if (filter === 'search' && expandedFilter === 'search') {
      return;
    }
    // Toggle other filters, or switch to them
    setExpandedFilter(expandedFilter === filter ? 'search' : filter);
  };

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      {/* Header with title and add button */}
      <div className="mb-4 flex-shrink-0">
        <div className="flex items-center justify-between mb-3">
          <h2 className={`text-xl font-semibold ${
            isDarkMode ? 'text-gray-200' : 'text-gray-700'
          }`}>
            Activities
          </h2>
          <button
            onClick={handleAddClick}
            disabled={!isToday}
            className={`p-2 mr-4 rounded-lg transition-all ${
              isToday
                ? isDarkMode
                  ? 'text-green-400 hover:bg-green-900/30 hover:text-green-300 active:scale-95'
                  : 'text-green-600 hover:bg-green-50 hover:text-green-700 active:scale-95'
                : isDarkMode
                  ? 'text-gray-600 cursor-not-allowed'
                  : 'text-gray-300 cursor-not-allowed'
            }`}
            title={isToday ? 'Add Activity' : 'Can only add activities for today'}
            aria-label="Add Activity"
          >
            <Plus size={24} strokeWidth={2.5} />
          </button>
        </div>

        {/* Collapsible Filter System */}
        <div ref={filterRef} className="mr-4">
          <div className="flex items-center gap-2 flex-wrap">
            {/* Search Filter */}
            <div className={`transition-all duration-200 ${
              expandedFilter === 'search' ? 'flex-1 min-w-[200px]' : ''
            }`}>
              {expandedFilter === 'search' ? (
                <div className="relative">
                  <Search 
                    size={18} 
                    className={`absolute left-3 top-1/2 -translate-y-1/2 ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-400'
                    }`}
                  />
                  <input
                    type="text"
                    placeholder="Search activities..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    autoFocus
                    className={`w-full pl-10 pr-4 py-2 rounded-lg border transition-colors ${
                      isDarkMode
                        ? 'bg-gray-800 border-gray-700 text-gray-200 placeholder-gray-500 focus:border-green-500 focus:outline-none'
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:border-green-500 focus:outline-none'
                    }`}
                  />
                </div>
              ) : searchTerm ? (
                <button
                  onClick={() => toggleFilter('search')}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-all ${
                    isDarkMode
                      ? 'bg-green-900/30 border-green-700 text-green-300 hover:bg-green-900/40'
                      : 'bg-green-50 border-green-300 text-green-700 hover:bg-green-100'
                  }`}
                >
                  <Search size={16} />
                  <span className="text-sm font-medium truncate max-w-[120px]">{searchTerm}</span>
                </button>
              ) : (
                <button
                  onClick={() => toggleFilter('search')}
                  className={`p-2 rounded-lg border transition-all ${
                    isDarkMode
                      ? 'border-gray-700 text-gray-400 hover:bg-gray-800 hover:text-gray-200'
                      : 'border-gray-300 text-gray-500 hover:bg-gray-50 hover:text-gray-700'
                  }`}
                  title="Search"
                >
                  <Search size={18} />
                </button>
              )}
            </div>

            {/* Category Filter */}
            <div className={`transition-all duration-200 ${
              expandedFilter === 'category' ? 'flex-1 min-w-[180px]' : ''
            }`}>
              {expandedFilter === 'category' ? (
                <select
                  value={selectedCategory}
                  onChange={(e) => handleCategoryChange(e.target.value)}
                  autoFocus
                  className={`w-full px-3 py-2 rounded-lg border transition-colors ${
                    isDarkMode
                      ? 'bg-gray-800 border-gray-700 text-gray-200 focus:border-green-500 focus:outline-none'
                      : 'bg-white border-gray-300 text-gray-900 focus:border-green-500 focus:outline-none'
                  }`}
                >
                  <option value="">All Categories</option>
                  {categories.map(cat => (
                    <option key={cat.value} value={cat.value}>
                      {cat.label}
                    </option>
                  ))}
                </select>
              ) : selectedCategory ? (
                <button
                  onClick={() => toggleFilter('category')}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-all ${
                    isDarkMode
                      ? 'bg-green-900/30 border-green-700 text-green-300 hover:bg-green-900/40'
                      : 'bg-green-50 border-green-300 text-green-700 hover:bg-green-100'
                  }`}
                >
                  <Tag size={16} />
                  <span className="text-sm font-medium truncate max-w-[120px]">
                    {getCategoryLabel(selectedCategory)}
                  </span>
                </button>
              ) : (
                <button
                  onClick={() => toggleFilter('category')}
                  className={`p-2 rounded-lg border transition-all ${
                    isDarkMode
                      ? 'border-gray-700 text-gray-400 hover:bg-gray-800 hover:text-gray-200'
                      : 'border-gray-300 text-gray-500 hover:bg-gray-50 hover:text-gray-700'
                  }`}
                  title="Category"
                >
                  <Tag size={18} />
                </button>
              )}
            </div>

            {/* Subcategory Filter - only show if category selected and has subcategories */}
            {selectedCategory && availableSubcategories.length > 0 && (
              <div className={`transition-all duration-200 ${
                expandedFilter === 'subcategory' ? 'flex-1 min-w-[180px]' : ''
              }`}>
                {expandedFilter === 'subcategory' ? (
                  <select
                    value={selectedSubcategory}
                    onChange={(e) => handleSubcategoryChange(e.target.value)}
                    autoFocus
                    className={`w-full px-3 py-2 rounded-lg border transition-colors ${
                      isDarkMode
                        ? 'bg-gray-800 border-gray-700 text-gray-200 focus:border-green-500 focus:outline-none'
                        : 'bg-white border-gray-300 text-gray-900 focus:border-green-500 focus:outline-none'
                    }`}
                  >
                    <option value="">All Subcategories</option>
                    {availableSubcategories.map(sub => (
                      <option key={sub} value={sub}>
                        {sub}
                      </option>
                    ))}
                  </select>
                ) : selectedSubcategory ? (
                  <button
                    onClick={() => toggleFilter('subcategory')}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-all ${
                      isDarkMode
                        ? 'bg-green-900/30 border-green-700 text-green-300 hover:bg-green-900/40'
                        : 'bg-green-50 border-green-300 text-green-700 hover:bg-green-100'
                    }`}
                  >
                    <Filter size={16} />
                    <span className="text-sm font-medium truncate max-w-[120px]">
                      {selectedSubcategory}
                    </span>
                  </button>
                ) : (
                  <button
                    onClick={() => toggleFilter('subcategory')}
                    className={`p-2 rounded-lg border transition-all ${
                      isDarkMode
                        ? 'border-gray-700 text-gray-400 hover:bg-gray-800 hover:text-gray-200'
                        : 'border-gray-300 text-gray-500 hover:bg-gray-50 hover:text-gray-700'
                    }`}
                    title="Subcategory"
                  >
                    <Filter size={18} />
                  </button>
                )}
              </div>
            )}

            {/* Time Range Filter */}
            <div className={`transition-all duration-200 ${
              expandedFilter === 'time' ? 'flex-1 min-w-[240px]' : ''
            }`}>
              {expandedFilter === 'time' ? (
                <div className="flex items-center gap-2">
                  <input
                    type="time"
                    value={filterStartTime}
                    onChange={(e) => handleTimeChange('start', e.target.value)}
                    className={`flex-1 px-3 py-2 rounded-lg border transition-colors ${
                      isDarkMode
                        ? 'bg-gray-800 border-gray-700 text-gray-200 focus:border-green-500 focus:outline-none'
                        : 'bg-white border-gray-300 text-gray-900 focus:border-green-500 focus:outline-none'
                    }`}
                  />
                  <span className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>—</span>
                  <input
                    type="time"
                    value={filterEndTime}
                    onChange={(e) => handleTimeChange('end', e.target.value)}
                    className={`flex-1 px-3 py-2 rounded-lg border transition-colors ${
                      isDarkMode
                        ? 'bg-gray-800 border-gray-700 text-gray-200 focus:border-green-500 focus:outline-none'
                        : 'bg-white border-gray-300 text-gray-900 focus:border-green-500 focus:outline-none'
                    }`}
                  />
                </div>
              ) : (filterStartTime || filterEndTime) ? (
                <button
                  onClick={() => toggleFilter('time')}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-all ${
                    isDarkMode
                      ? 'bg-green-900/30 border-green-700 text-green-300 hover:bg-green-900/40'
                      : 'bg-green-50 border-green-300 text-green-700 hover:bg-green-100'
                  }`}
                >
                  <Clock size={16} />
                  <span className="text-sm font-medium">
                    {filterStartTime || '—'} – {filterEndTime || '—'}
                  </span>
                </button>
              ) : (
                <button
                  onClick={() => toggleFilter('time')}
                  className={`p-2 rounded-lg border transition-all ${
                    isDarkMode
                      ? 'border-gray-700 text-gray-400 hover:bg-gray-800 hover:text-gray-200'
                      : 'border-gray-300 text-gray-500 hover:bg-gray-50 hover:text-gray-700'
                  }`}
                  title="Time Range"
                >
                  <Clock size={18} />
                </button>
              )}
            </div>

            {/* Clear All Filters */}
            {hasActiveFilters && (
              <button
                onClick={handleClearFilters}
                className={`p-2 rounded-lg transition-all ${
                  isDarkMode
                    ? 'text-red-400 hover:bg-red-900/30 hover:text-red-300'
                    : 'text-red-500 hover:bg-red-50 hover:text-red-600'
                }`}
                title="Clear all filters"
                aria-label="Clear all filters"
              >
                <X size={20} />
              </button>
            )}
          </div>
        </div>
      </div>
      
      <div className="flex-1 min-h-0">
        {!activities || activities.length === 0 ? (
          <div className={`text-center py-8 ${
            isDarkMode ? 'text-gray-400' : 'text-gray-500'
          }`}>
            No activities recorded for this day
          </div>
        ) : filteredAndSortedActivities.length === 0 ? (
          <div className={`text-center py-8 ${
            isDarkMode ? 'text-gray-400' : 'text-gray-500'
          }`}>
            No activities match your filters
          </div>
        ) : (
          <div className="space-y-3 pr-2">
            {filteredAndSortedActivities.map((activity) => (
              <ActivityItem
                key={activity._id}
                activity={activity}
                defaultCategory={defaultCategory}
                onEdit={onEditActivity}
              />
            ))}
          </div>
        )}
      </div>

      {/* Add Activity Modal */}
      <AddActivityModal
        isOpen={isAddModalOpen}
        onClose={handleModalClose}
        onActivityAdded={handleActivityAdded}
        categories={categories}
      />
    </div>
  );
};

export default ActivityList;