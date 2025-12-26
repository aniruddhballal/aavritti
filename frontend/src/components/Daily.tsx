import { useState, useEffect } from 'react';
import { ArrowLeft, Circle, Clock, Edit2, X, Save } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { getActivities, updateActivity } from '../api/api';
import type { DailyData, Activity } from '../api/api';
import AddActivityForm from './AddActivityForm';

const Daily = ({ selectedDate, dateString, onBack }: { selectedDate: Date; dateString: string; onBack: () => void }) => {
  const [data, setData] = useState<DailyData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingActivity, setEditingActivity] = useState<Activity | null>(null);
  const [editForm, setEditForm] = useState({
    title: '',
    description: '',
    category: '',
    duration: 0,
    startTime: '',
    endTime: ''
  });
  const [validationError, setValidationError] = useState<string>('');

  // Category colors mapping
  const CATEGORY_COLORS: Record<string, string> = {
    physical: '#3b82f6',
    spiritual: '#22c55e',
    academic: '#a855f7',
    project: '#f59e0b',
    entertainment: '#ec4899'
  };

  const CATEGORIES = ['physical', 'spiritual', 'academic', 'project', 'entertainment'];

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
      const category = activity.category || 'physical';
      const duration = activity.duration || 0;
      categoryTotals[category] = (categoryTotals[category] || 0) + duration;
    });

    return Object.entries(categoryTotals).map(([category, minutes]) => ({
      name: category.charAt(0).toUpperCase() + category.slice(1),
      value: minutes,
      hours: (minutes / 60).toFixed(1),
      color: CATEGORY_COLORS[category] || CATEGORY_COLORS.physical
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

  const handleEditClick = (activity: Activity) => {
    setEditingActivity(activity);
    setEditForm({
      title: activity.title || '',
      description: activity.description || '',
      category: activity.category || 'physical',
      duration: activity.duration || 0,
      startTime: activity.startTime || '',
      endTime: activity.endTime || ''
    });
    setValidationError(''); // Clear any previous validation errors
  };

  const handleEditChange = (field: string, value: any) => {
    const updatedForm = { ...editForm, [field]: value };
    setEditForm(updatedForm);
    
    // Validate after update
    const error = validateDuration(updatedForm);
    setValidationError(error);
  };

  const validateDuration = (form: typeof editForm): string => {
    // Only validate if both start and end times are provided
    if (form.startTime && form.endTime) {
      const today = getTodayIST();
      const start = new Date(`${today}T${form.startTime}`);
      const end = new Date(`${today}T${form.endTime}`);
      const calculatedMinutes = Math.round((end.getTime() - start.getTime()) / 60000);
      
      if (calculatedMinutes <= 0) {
        return 'End time must be after start time';
      }
      
      if (calculatedMinutes !== form.duration) {
        return `Duration mismatch: Start/End times = ${calculatedMinutes} mins, but Duration field = ${form.duration} mins. Please fix one of them.`;
      }
    }
    return '';
  };

  const handleSaveEdit = async () => {
    if (!editingActivity) return;

    try {
      await updateActivity(editingActivity._id, {
        ...editForm,
        date: dateString
      });

      setEditingActivity(null);
      await fetchActivities();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update activity');
    }
  };

  const handleCancelEdit = () => {
    setEditingActivity(null);
    setEditForm({
      title: '',
      description: '',
      category: '',
      duration: 0,
      startTime: '',
      endTime: ''
    });
    setValidationError(''); // Clear validation error
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
                    key={activity._id}
                    className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start gap-3">
                      <div className="mt-1">
                        <Circle 
                          className="text-gray-400" 
                          size={20} 
                          fill={CATEGORY_COLORS[activity.category || 'physical']}
                          style={{ color: CATEGORY_COLORS[activity.category || 'physical'] }}
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
                              onClick={() => handleEditClick(activity)}
                              className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              title="Edit activity"
                            >
                              <Edit2 size={16} />
                            </button>
                          </div>
                        </div>
                        {activity.category && (
                          <span 
                            className="inline-block mt-1 px-2 py-1 text-xs font-medium rounded-full text-white"
                            style={{ backgroundColor: CATEGORY_COLORS[activity.category] || CATEGORY_COLORS.physical }}
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

      {/* ADD THIS EDIT MODAL HERE - right before the final two closing </div> tags */}
      {editingActivity && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-800">Edit Activity</h2>
              <button
                onClick={handleCancelEdit}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category *
                </label>
                <select
                  value={editForm.category}
                  onChange={(e) => handleEditChange('category', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>
                      {cat.charAt(0).toUpperCase() + cat.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title *
                </label>
                <input
                  type="text"
                  value={editForm.title}
                  onChange={(e) => handleEditChange('title', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={editForm.description}
                  onChange={(e) => handleEditChange('description', e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Duration (minutes) *
                </label>
                <input
                  type="number"
                  value={editForm.duration}
                  onChange={(e) => handleEditChange('duration', parseInt(e.target.value) || 0)}
                  min="1"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <small className="text-gray-500 mt-1 block">
                  {editForm.duration} minutes = {Math.floor(editForm.duration / 60)}h {editForm.duration % 60}m
                </small>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Start Time
                  </label>
                  <input
                    type="time"
                    value={editForm.startTime}
                    onChange={(e) => handleEditChange('startTime', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    End Time
                  </label>
                  <input
                    type="time"
                    value={editForm.endTime}
                    onChange={(e) => handleEditChange('endTime', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

            {validationError && (
              <div className="bg-red-50 border border-red-200 rounded-md p-3 text-red-700 text-sm">
                ⚠️ {validationError}
              </div>
            )}

              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleCancelEdit}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveEdit}
                  disabled={!!validationError}
                  className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors flex items-center justify-center gap-2"
                >
                  <Save size={18} />
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Daily;