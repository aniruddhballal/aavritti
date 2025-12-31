// (List of activities)
// a component that manages the list of activities, including the "Add Activity" form (for today), the past/future date banner, and the empty state. It maps through activities and renders ActivityItem components.

import { Plus, Search, X } from 'lucide-react';
import { useState, useEffect } from 'react';
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
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedSubcategory, setSelectedSubcategory] = useState('');
  const [filterStartTime, setFilterStartTime] = useState('');
  const [filterEndTime, setFilterEndTime] = useState('');
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

  // Filter and sort activities
  const filteredAndSortedActivities = [...activities]
    .filter(activity => {
      // Search filter (searches in title)
      if (searchTerm && !activity.title?.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false;
      }
      // Category filter
      if (selectedCategory && activity.category !== selectedCategory) {
        return false;
      }
      // Subcategory filter
      if (selectedSubcategory && activity.subcategory !== selectedSubcategory) {
        return false;
      }
      // Time range filter
      if (filterStartTime || filterEndTime) {
        const activityStart = activity.startTime;
        const activityEnd = activity.endTime;
        
        // Skip activities without time data if time filters are active
        if (!activityStart) {
          return false;
        }
        
        // Check if activity starts after filter start time
        if (filterStartTime && activityStart < filterStartTime) {
          return false;
        }
        
        // Check if activity ends before filter end time (or starts before if no end time)
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

  // Get available subcategories for selected category
  const availableSubcategories = selectedCategory
    ? categories.find(cat => cat.value === selectedCategory)?.subcategories || []
    : [];

  // Clear all filters
  const handleClearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('');
    setSelectedSubcategory('');
    setFilterStartTime('');
    setFilterEndTime('');
  };

  // When category changes, clear subcategory
  const handleCategoryChange = (value: string) => {
    setSelectedCategory(value);
    setSelectedSubcategory('');
  };

  const hasActiveFilters = searchTerm || selectedCategory || selectedSubcategory || filterStartTime || filterEndTime;

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

      {/* Search and Filter Controls */}
      <div className="space-y-2 mr-4">
        {/* Search Bar */}
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
            className={`w-full pl-10 pr-4 py-2 rounded-lg border transition-colors ${
              isDarkMode
                ? 'bg-gray-800 border-gray-700 text-gray-200 placeholder-gray-500 focus:border-green-500 focus:outline-none'
                : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:border-green-500 focus:outline-none'
            }`}
          />
        </div>

        {/* Filter Dropdowns */}
        <div className="flex gap-2 items-center">
          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => handleCategoryChange(e.target.value)}
            className={`flex-1 px-3 py-2 rounded-lg border transition-colors ${
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

          {/* Subcategory Filter (only show if category is selected and has subcategories) */}
          {selectedCategory && availableSubcategories.length > 0 && (
            <select
              value={selectedSubcategory}
              onChange={(e) => setSelectedSubcategory(e.target.value)}
              className={`flex-1 px-3 py-2 rounded-lg border transition-colors ${
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
          )}

          {/* Time Range Filters */}
          <div className="flex gap-2 items-center">
            <input
              type="time"
              value={filterStartTime}
              onChange={(e) => setFilterStartTime(e.target.value)}
              placeholder="Start time"
              className={`px-3 py-2 rounded-lg border transition-colors ${
                isDarkMode
                  ? 'bg-gray-800 border-gray-700 text-gray-200 focus:border-green-500 focus:outline-none'
                  : 'bg-white border-gray-300 text-gray-900 focus:border-green-500 focus:outline-none'
              }`}
              title="Filter from time"
            />
            <span className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>—</span>
            <input
              type="time"
              value={filterEndTime}
              onChange={(e) => setFilterEndTime(e.target.value)}
              placeholder="End time"
              className={`px-3 py-2 rounded-lg border transition-colors ${
                isDarkMode
                  ? 'bg-gray-800 border-gray-700 text-gray-200 focus:border-green-500 focus:outline-none'
                  : 'bg-white border-gray-300 text-gray-900 focus:border-green-500 focus:outline-none'
              }`}
              title="Filter to time"
            />
          </div>

          {/* Clear Filters Button */}
          {hasActiveFilters && (
            <button
              onClick={handleClearFilters}
              className={`p-2 rounded-lg transition-all ${
                isDarkMode
                  ? 'text-gray-400 hover:bg-gray-800 hover:text-gray-200'
                  : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'
              }`}
              title="Clear filters"
              aria-label="Clear filters"
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