import { useState, useEffect } from 'react';
import { ArrowLeft, Circle, Clock } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { getActivities} from '../api/api';
import type { DailyData } from '../api/api';
import AddActivityForm from './AddActivityForm';

const Daily = ({ selectedDate, dateString, onBack }: { selectedDate: Date; dateString: string; onBack: () => void }) => {
  const [data, setData] = useState<DailyData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Category colors mapping
  const CATEGORY_COLORS: Record<string, string> = {
    work: '#3b82f6',
    exercise: '#22c55e',
    learning: '#a855f7',
    social: '#f59e0b',
    hobbies: '#ec4899',
    health: '#14b8a6',
    chores: '#6366f1',
    entertainment: '#ef4444',
    other: '#64748b'
  };

  const formatDate = (date: Date) => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 
                    'July', 'August', 'September', 'October', 'November', 'December'];
    return `${days[date.getDay()]}, ${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { 
      timeZone: 'Asia/Kolkata',
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const getTodayIST = () => {
    const now = new Date();
    return now.toLocaleDateString('en-CA', { 
      timeZone: 'Asia/Kolkata',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  };

  const isToday = () => {
    return dateString === getTodayIST();
  };

  // Calculate category data for pie chart
  const getCategoryData = () => {
    if (!data?.activities || data.activities.length === 0) return [];

    const categoryTotals: Record<string, number> = {};
    
    data.activities.forEach(activity => {
      const category = activity.category || 'other';
      const duration = activity.duration || 0;
      categoryTotals[category] = (categoryTotals[category] || 0) + duration;
    });

    return Object.entries(categoryTotals).map(([category, minutes]) => ({
      name: category.charAt(0).toUpperCase() + category.slice(1),
      value: minutes,
      hours: (minutes / 60).toFixed(1),
      color: CATEGORY_COLORS[category] || CATEGORY_COLORS.other
    }));
  };

  const getTotalTime = () => {
    if (!data?.activities) return '0h 0m';
    const totalMinutes = data.activities.reduce((sum, activity) => sum + (activity.duration || 0), 0);
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return `${hours}h ${minutes}m`;
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

  const categoryData = getCategoryData();

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

          <div className="mb-8 grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Stats Section */}
            <div className="space-y-4">
              <div className="bg-blue-50 rounded-lg p-6">
                <div className="text-3xl font-bold text-blue-600">{data?.totalActivities || 0}</div>
                <div className="text-sm text-blue-700">Total Activities</div>
              </div>
              <div className="bg-green-50 rounded-lg p-6">
                <div className="text-3xl font-bold text-green-600">{getTotalTime()}</div>
                <div className="text-sm text-green-700">Total Time Recorded</div>
              </div>
            </div>

            {/* Pie Chart Section */}
            <div className="bg-gray-50 rounded-lg p-6">
              {categoryData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="45%"
                      labelLine={false}
                      label={({ name, percent }: any) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={70}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value: any) => `${(value / 60).toFixed(1)} hours`}
                    />
                    <Legend 
                      verticalAlign="bottom" 
                      height={50}
                      formatter={(value, entry: any) => `${value} (${entry.payload.hours}h)`}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-[300px] text-gray-500">
                  No activity data to display
                </div>
              )}
            </div>
          </div>

          {isToday() && (
            <div className="mb-6">
              <AddActivityForm onActivityAdded={fetchActivities} />
            </div>
          )}

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
                        <Circle 
                          className="text-gray-400" 
                          size={20} 
                          fill={CATEGORY_COLORS[activity.category || 'other']}
                          style={{ color: CATEGORY_COLORS[activity.category || 'other'] }}
                        />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h3 className="font-semibold text-gray-800">
                            {activity.title}
                          </h3>
                          <span className="text-sm font-medium text-gray-600">
                            {activity.duration ? `${Math.floor(activity.duration / 60)}h ${activity.duration % 60}m` : ''}
                          </span>
                        </div>
                        {activity.category && (
                          <span 
                            className="inline-block mt-1 px-2 py-1 text-xs font-medium rounded-full text-white"
                            style={{ backgroundColor: CATEGORY_COLORS[activity.category] || CATEGORY_COLORS.other }}
                          >
                            {activity.category.charAt(0).toUpperCase() + activity.category.slice(1)}
                          </span>
                        )}
                        <p className="text-sm text-gray-600 mt-2">{activity.description}</p>
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