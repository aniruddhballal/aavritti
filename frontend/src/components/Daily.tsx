import { useState, useEffect } from 'react';
import { ArrowLeft, CheckCircle, Circle, Clock } from 'lucide-react';
import { getActivities} from '../api/api';
import type { DailyData } from '../api/api';
import AddActivityForm from './AddActivityForm';

const Daily = ({ selectedDate, dateString, onBack }: { selectedDate: Date; dateString: string; onBack: () => void }) => {
  const [data, setData] = useState<DailyData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const formatDate = (date: Date) => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 
                    'July', 'August', 'September', 'October', 'November', 'December'];
    return `${days[date.getDay()]}, ${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    // Format time in IST
    return date.toLocaleTimeString('en-US', { 
      timeZone: 'Asia/Kolkata',
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  };

  // Get today's date in IST timezone
  const getTodayIST = () => {
    const now = new Date();
    return now.toLocaleDateString('en-CA', { 
      timeZone: 'Asia/Kolkata',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }); // Returns YYYY-MM-DD format in IST
  };

  // Check if the selected date is today in IST
  const isToday = () => {
    return dateString === getTodayIST();
  };

  const fetchActivities = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await getActivities(dateString);
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActivities();
  }, [dateString]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
        <div className="text-gray-600">Loading activities...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
          >
            <ArrowLeft size={20} />
            <span>Back to Calendar</span>
          </button>
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
            Error: {error}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
        >
          <ArrowLeft size={20} />
          <span>Back to Calendar</span>
        </button>

        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            {formatDate(selectedDate)}
          </h1>
          <p className="text-gray-500 mb-8">View your activities and progress for this day</p>

          <div className="mb-8 flex gap-6">
            <div className="bg-blue-50 rounded-lg p-4 flex-1">
              <div className="text-2xl font-bold text-blue-600">{data?.totalActivities || 0}</div>
              <div className="text-sm text-blue-700">Total Activities</div>
            </div>
            <div className="bg-green-50 rounded-lg p-4 flex-1">
              <div className="text-2xl font-bold text-green-600">{data?.completedActivities || 0}</div>
              <div className="text-sm text-green-700">Completed</div>
            </div>
            <div className="bg-purple-50 rounded-lg p-4 flex-1">
              <div className="text-2xl font-bold text-purple-600">
                {data?.totalActivities ? Math.round((data.completedActivities / data.totalActivities) * 100) : 0}%
              </div>
              <div className="text-sm text-purple-700">Completion Rate</div>
            </div>
          </div>

          {/* Only show Add Activity form if viewing today's date (IST) */}
          {isToday() && (
            <div className="mb-6">
              <AddActivityForm onActivityAdded={fetchActivities} />
            </div>
          )}

          {/* Show info message if not today */}
          {!isToday() && (
            <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4 text-blue-700">
              <p className="text-sm">
                📅 You're viewing a {new Date(dateString) > new Date(getTodayIST()) ? 'future' : 'past'} date. 
                Activities can only be added for today's date (IST timezone).
              </p>
            </div>
          )}

          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-700 mb-4">Activities</h2>
            
            {!data?.activities || data.activities.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No activities recorded for this day
              </div>
            ) : (
              <div className="space-y-3">
                {data.activities.map((activity) => (
                  <div
                    key={activity.id}
                    className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start gap-3">
                      <div className="mt-1">
                        {activity.completed ? (
                          <CheckCircle className="text-green-500" size={20} />
                        ) : (
                          <Circle className="text-gray-400" size={20} />
                        )}
                      </div>
                      <div className="flex-1">
                        <h3 className={`font-semibold text-gray-800 ${activity.completed ? 'line-through' : ''}`}>
                          {activity.title}
                        </h3>
                        <p className="text-sm text-gray-600 mt-1">{activity.description}</p>
                        <div className="flex items-center gap-1 text-xs text-gray-500 mt-2">
                          <Clock size={14} />
                          <span>{formatTime(activity.timestamp)} IST</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Daily;