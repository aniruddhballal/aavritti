// (List of activities)
// a component that manages the list of activities, including the "Add Activity" form (for today), the past/future date banner, and the empty state. It maps through activities and renders ActivityItem components.

import type { Activity } from '../../types/activity';
import ActivityItem from './ActivityItem';
import AddActivityForm from '../AddActivityForm';

interface ActivityListProps {
  activities: Activity[];
  isToday: boolean;
  dateString: string;
  todayIST: string;
  defaultCategory: string;
  onActivityAdded: () => void;
  onEditActivity: (activity: Activity) => void;
}

const ActivityList = ({ 
  activities, 
  isToday, 
  dateString, 
  todayIST, 
  defaultCategory,
  onActivityAdded,
  onEditActivity 
}: ActivityListProps) => {
  return (
    <div className="flex flex-col h-full overflow-hidden">
      {isToday && (
        <div className="mb-6 flex-shrink-0">
          <AddActivityForm onActivityAdded={onActivityAdded} />
        </div>
      )}
      {!isToday && (
        <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4 text-blue-700 flex-shrink-0">
          <p className="text-sm">
            📅 You're viewing a {new Date(dateString) > new Date(todayIST) ? 'future' : 'past'} date. 
            Activities can only be added for today's date (IST timezone).
          </p>
        </div>
      )}
      
      <h2 className="text-xl font-semibold text-gray-700 mb-4 flex-shrink-0">Activities</h2>
      
      <div className="flex-1 overflow-y-auto min-h-0">
        {!activities || activities.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No activities recorded for this day
          </div>
        ) : (
          <div className="space-y-3 pr-2">
            {activities.map((activity) => (
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