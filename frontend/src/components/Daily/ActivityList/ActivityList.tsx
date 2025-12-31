import { useState, useEffect } from 'react';
import type { Activity } from '../../../types/activity';
import ActivityItem from '../ActivityItem';
import AddActivityModal from '../AddActivityModal';
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
  onActivityAdded,
  onEditActivity
}: ActivityListProps) => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
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
      {/* Header */}
      <div className="mb-4 flex-shrink-0">
        <ActivityListHeader 
          isToday={isToday}
          onAddClick={handleAddClick}
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