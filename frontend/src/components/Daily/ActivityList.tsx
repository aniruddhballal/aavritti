// (List of activities)
// a component that manages the list of activities, including the "Add Activity" form (for today), the past/future date banner, and the empty state. It maps through activities and renders ActivityItem components.

import { Plus } from 'lucide-react';
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

  // Sort activities by start time (latest first)
  const sortedActivities = [...activities].sort((a, b) => {
    const timeA = a.startTime 
      ? new Date(`${a.date}T${a.startTime}`).getTime()
      : new Date(a.timestamp).getTime();
    const timeB = b.startTime 
      ? new Date(`${b.date}T${b.startTime}`).getTime()
      : new Date(b.timestamp).getTime();
    return timeB - timeA;
  });

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
      <div className="mb-4 flex-shrink-0 flex items-center justify-between">
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
      
      <div className="flex-1 min-h-0">
        {!activities || activities.length === 0 ? (
          <div className={`text-center py-8 ${
            isDarkMode ? 'text-gray-400' : 'text-gray-500'
          }`}>
            No activities recorded for this day
          </div>
        ) : (
          <div className="space-y-3 pr-2">
            {sortedActivities.map((activity) => (
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