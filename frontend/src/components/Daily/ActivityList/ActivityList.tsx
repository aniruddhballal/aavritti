import { useState, useEffect, useMemo } from 'react';
import type { Activity } from '../../../types/activity';
import ActivityItem from '../ActivityItem';
import ActivityListHeader from './ActivityListHeader';
import ActivityFilters from './ActivityFilters/ActivityFilters';
import NoActivities from './EmptyStates/NoActivities';
import NoFilterResults from './EmptyStates/NoFilterResults';
import { useActivityFilters } from './ActivityFilters/useActivityFilters';
import { activityService } from '../../../services';

interface ActivityListProps {
  activities: Activity[];
  isToday: boolean;
  onActivityAdded: () => void;
  onEditActivity: (activity: Activity) => void;
}

const ActivityList = ({ 
  activities, 
  isToday, 
  onEditActivity
}: ActivityListProps) => {
  const [categorySuggestions, setCategorySuggestions] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Fetch initial category suggestions on mount
  useEffect(() => {
    const fetchSuggestions = async () => {
      try {
        setLoading(true);
        // Get all categories (empty query returns top categories)
        const suggestions = await activityService.getCategorySuggestions('');
        setCategorySuggestions(suggestions);
      } catch (err) {
        console.error('Failed to fetch category suggestions:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchSuggestions();
  }, []);

  // Get the latest activity's end time
  const latestEndTime = useMemo(() => {
    if (!activities || activities.length === 0) return undefined;
    
    // Find the activity with the latest end time
    const latestActivity = activities.reduce((latest, current) => {
      if (!latest) return current;
      if (!current.endTime) return latest;
      if (!latest.endTime) return current;
      
      // Compare end times
      return current.endTime > latest.endTime ? current : latest;
    }, activities[0]);
    
    return latestActivity?.endTime;
  }, [activities]);

  const {
    filterRef,
    searchTerm,
    selectedCategory,
    selectedSubcategory,
    filterStartTime,
    filterEndTime,
    expandedFilter,
    filteredAndSortedActivities,
    availableSubcategories,
    setSearchTerm,
    handleCategoryChange,
    handleSubcategoryChange,
    handleTimeChange,
    toggleFilter,
    handleClearFilters,
  } = useActivityFilters({ activities, categorySuggestions });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <span className="text-gray-500">Loading filters...</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      {/* Header */}
      <div className="mb-4 flex-shrink-0">
        <ActivityListHeader 
          isToday={isToday}
          latestEndTime={latestEndTime}
        />
        {/* Filters */}
        <div ref={filterRef} className="mr-4">
          <ActivityFilters
            categories={categorySuggestions}
            subcategories={availableSubcategories}
            searchTerm={searchTerm}
            selectedCategory={selectedCategory}
            selectedSubcategory={selectedSubcategory}
            filterStartTime={filterStartTime}
            filterEndTime={filterEndTime}
            expandedFilter={expandedFilter}
            onSearchChange={setSearchTerm}
            onCategoryChange={handleCategoryChange}
            onSubcategoryChange={handleSubcategoryChange}
            onTimeChange={handleTimeChange}
            onExpandedFilterChange={toggleFilter}
            onClearFilters={handleClearFilters}
          />
        </div>
      </div>
      
      {/* Activity List */}
      <div className="flex-1 min-h-0">
        {!activities || activities.length === 0 ? (
          <NoActivities />
        ) : filteredAndSortedActivities.length === 0 ? (
          <NoFilterResults />
        ) : (
          <div className="space-y-3 pr-2">
            {filteredAndSortedActivities.map((activity) => (
              <ActivityItem
                key={activity._id}
                activity={activity}
                onEdit={onEditActivity}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ActivityList;