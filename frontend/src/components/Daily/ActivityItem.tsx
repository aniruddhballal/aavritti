// (Individual activity card)
// a component that renders an individual activity card with all its details (title, description, category, subcategory, time, duration) and an edit button.

import { Circle, Clock, Edit2 } from 'lucide-react';
import type { Activity } from '../../types/activity';
import { getCategoryColor } from '../../utils/categoryColors';

interface ActivityItemProps {
  activity: Activity;
  defaultCategory: string;
  onEdit: (activity: Activity) => void;
}

const ActivityItem = ({ activity, defaultCategory, onEdit }: ActivityItemProps) => {
  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { 
      timeZone: 'Asia/Kolkata',
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  };

  return (
    <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start gap-3">
        <div className="mt-1">
          <Circle 
            className="text-gray-400" 
            size={20} 
            fill={getCategoryColor(activity.category || defaultCategory)}
            style={{ color: getCategoryColor(activity.category || defaultCategory) }}
          />
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-gray-800">
              {activity.title}
            </h3>
            <div className="flex items-center gap-3">
              <div className="text-right">
                {activity.startTime && activity.endTime && (
                  <div className="text-xs text-gray-500 mb-1">
                    {activity.startTime} - {activity.endTime}
                  </div>
                )}
                <span className="text-sm font-medium text-gray-600">
                  {activity.duration ? `${Math.floor(activity.duration / 60)}h ${activity.duration % 60}m` : ''}
                </span>
              </div>
              <button
                onClick={() => onEdit(activity)}
                className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                title="Edit activity"
              >
                <Edit2 size={16} />
              </button>
            </div>
          </div>
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            {activity.category && (
              <span 
                className="inline-block px-2 py-1 text-xs font-medium rounded-full text-white"
                style={{ backgroundColor: getCategoryColor(activity.category) }}
              >
                {activity.category.charAt(0).toUpperCase() + activity.category.slice(1)}
              </span>
            )}
            {activity.subcategory && (
              <span 
                className="inline-block px-2 py-1 text-xs font-medium rounded-full bg-gray-200 text-gray-700"
              >
                {activity.subcategory.charAt(0).toUpperCase() + activity.subcategory.slice(1)}
              </span>
            )}
          </div>
          <p className="text-sm text-gray-600 mt-2">{activity.description}</p>
          <div className="flex items-center gap-1 text-xs text-gray-500 mt-2">
            <Clock size={14} />
            <span>{formatTime(activity.timestamp)} IST</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ActivityItem;