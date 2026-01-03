import { Circle, Clock, Edit2 } from 'lucide-react';
import type { Activity } from '../../types/activity';
import { useDarkMode } from '../../contexts/DarkModeContext';

interface ActivityItemProps {
  activity: Activity;
  onEdit: (activity: Activity) => void;
}

const ActivityItem = ({ activity, onEdit }: ActivityItemProps) => {
  const { isDarkMode } = useDarkMode();

  const formatTime = (createdAt: string | Date) => {  // Better name
    const date = new Date(createdAt);
    return date.toLocaleTimeString('en-US', { 
      timeZone: 'Asia/Kolkata',
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  };

  return (
    <div className={`border rounded-lg p-4 hover:shadow-md transition-all duration-200 ${
      isDarkMode 
        ? 'border-gray-700 bg-gray-800/50 hover:bg-gray-800 hover:border-gray-600' 
        : 'border-gray-200 bg-white hover:bg-gray-50'
    }`}>
      <div className="flex items-start gap-3">
        <div className="mt-1">
          <Circle 
            className={isDarkMode ? 'text-gray-600' : 'text-gray-400'}
            size={20} 
            fill={activity.categoryColor || '#95A5A6'}
            style={{ color: activity.categoryColor || '#95A5A6' }}
          />
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <h3 className={`font-semibold ${
              isDarkMode ? 'text-gray-100' : 'text-gray-800'
            }`}>
              {activity.title}
            </h3>
            <div className="flex items-center gap-3">
              <div className="text-right">
                {activity.startTime && activity.endTime && (
                  <div className={`text-xs mb-1 ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-500'
                  }`}>
                    {activity.startTime} - {activity.endTime}
                  </div>
                )}
                <span className={`text-sm font-medium ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-600'
                }`}>
                  {activity.duration ? `${Math.floor(activity.duration / 60)}h ${activity.duration % 60}m` : ''}
                </span>
              </div>
              <button
                onClick={() => onEdit(activity)}
                className={`p-2 rounded-lg transition-colors ${
                  isDarkMode
                    ? 'text-gray-400 hover:text-blue-400 hover:bg-blue-900/30'
                    : 'text-gray-400 hover:text-blue-600 hover:bg-blue-50'
                }`}
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
                style={{ backgroundColor: activity.categoryColor || '#95A5A6' }}
              >
                {activity.category.charAt(0).toUpperCase() + activity.category.slice(1)}
              </span>
            )}
            {activity.subcategory && (
              <span 
                className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${
                  isDarkMode
                    ? 'bg-gray-700 text-gray-300'
                    : 'bg-gray-200 text-gray-700'
                }`}
              >
                {activity.subcategory.charAt(0).toUpperCase() + activity.subcategory.slice(1)}
              </span>
            )}
          </div>
          <p className={`text-sm mt-2 ${
            isDarkMode ? 'text-gray-400' : 'text-gray-600'
          }`}>
            {activity.description}
          </p>
          <div className={`flex items-center gap-1 text-xs mt-2 ${
            isDarkMode ? 'text-gray-500' : 'text-gray-500'
          }`}>
            <Clock size={14} />
            <span>{formatTime(activity.createdAt)} IST</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ActivityItem;