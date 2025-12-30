// (List of activities)
// a component that manages the list of activities, including the "Add Activity" form (for today), the past/future date banner, and the empty state. It maps through activities and renders ActivityItem components.

import type { Activity } from '../../types/activity';
import ActivityItem from './ActivityItem';
import AddActivityForm from '../AddActivityForm';

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
  // Sort activities by start time (earliest first)
  // If startTime is missing, fall back to timestamp
  const sortedActivities = [...activities].sort((a, b) => {
    const timeA = a.startTime 
      ? new Date(`${a.date}T${a.startTime}`).getTime()
      : new Date(a.timestamp).getTime();
    const timeB = b.startTime 
      ? new Date(`${b.date}T${b.startTime}`).getTime()
      : new Date(b.timestamp).getTime();
    return timeA - timeB;
  });

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      {isToday && (
        <div className="mb-6 flex-shrink-0">
          <AddActivityForm onActivityAdded={onActivityAdded} />
        </div>
      )}
      
      <h2 className="text-xl font-semibold text-gray-700 mb-4 flex-shrink-0">Activities</h2>
      
      <div className="flex-1 min-h-0">
        {!activities || activities.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
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
    </div>
  );
};

export default ActivityList;