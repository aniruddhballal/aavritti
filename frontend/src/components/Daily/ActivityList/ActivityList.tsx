import { useState, useEffect, useMemo } from 'react';
import type { Activity } from '../../../types/activity';
import ActivityItem from '../ActivityItem';
import ActivityListHeader from './ActivityListHeader';
import ActivityFilters from './ActivityFilters/ActivityFilters';
import NoActivities from './EmptyStates/NoActivities';
import NoFilterResults from './EmptyStates/NoFilterResults';
import { useActivityFilters } from './ActivityFilters/useActivityFilters';
import { activityService } from '../../../services';
import type { Category } from './types';

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
  onEditActivity
}: ActivityListProps) => {
  const [categories, setCategories] = useState<Category[]>([]);
  
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
    setSearchTerm,
    handleCategoryChange,
    handleSubcategoryChange,
    handleTimeChange,
    toggleFilter,
    handleClearFilters,
  } = useActivityFilters({ activities, categories });

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
            categories={categories}
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
                defaultCategory={defaultCategory}
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