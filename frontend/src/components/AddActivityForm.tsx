import React, { useState, useEffect } from 'react';
import { createActivity, getCategories } from '../api/api';
import type { CreateActivityData } from '../api/api';

interface Category {
  value: string;
  label: string;
}

interface AddActivityFormProps {
  onActivityAdded: () => void;
}

const AddActivityForm: React.FC<AddActivityFormProps> = ({ onActivityAdded }) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [formData, setFormData] = useState({
    category: '',
    title: '',
    duration: '',
    startTime: '',
    endTime: '',
    description: ''
  });
  const [durationMode, setDurationMode] = useState<'manual' | 'calculated'>('manual');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    if (durationMode === 'calculated' && formData.startTime && formData.endTime) {
      const start = new Date(`${today}T${formData.startTime}`);
      const end = new Date(`${today}T${formData.endTime}`);
      const diffMinutes = Math.round((end.getTime() - start.getTime()) / 60000);
      
      if (diffMinutes > 0) {
        setFormData(prev => ({ ...prev, duration: diffMinutes.toString() }));
      }
    }
  }, [formData.startTime, formData.endTime, durationMode, today]);

  const fetchCategories = async () => {
    try {
      const data = await getCategories();
      setCategories(data.categories);
    } catch (err) {
      console.error('Failed to fetch categories:', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validate duration
    const duration = parseInt(formData.duration);
    if (!duration || duration <= 0) {
      setError('Please provide a valid duration');
      return;
    }

    setIsSubmitting(true);

    try {
      const activityData: CreateActivityData = {
        date: today,
        category: formData.category,
        title: formData.title,
        duration: duration,
        description: formData.description
      };

      await createActivity(activityData);

      setFormData({
        category: '',
        title: '',
        duration: '',
        startTime: '',
        endTime: '',
        description: ''
      });
      
      onActivityAdded();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add activity');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleDurationModeChange = (mode: 'manual' | 'calculated') => {
    setDurationMode(mode);
    // Clear duration and time fields when switching modes
    setFormData(prev => ({
      ...prev,
      duration: '',
      startTime: '',
      endTime: ''
    }));
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 max-w-2xl mx-auto mb-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-5">Add Today's Activity</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
            Category *
          </label>
          <select
            id="category"
            name="category"
            value={formData.category}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
          >
            <option value="">Select a category</option>
            {categories.map(cat => (
              <option key={cat.value} value={cat.value}>
                {cat.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
            Activity Title *
          </label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="e.g., Morning Run"
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Duration Input Method *
          </label>
          <div className="flex gap-4 mb-4">
            <button
              type="button"
              onClick={() => handleDurationModeChange('manual')}
              className={`flex-1 px-4 py-2 rounded-md font-medium transition-colors ${
                durationMode === 'manual'
                  ? 'bg-green-500 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Enter Minutes
            </button>
            <button
              type="button"
              onClick={() => handleDurationModeChange('calculated')}
              className={`flex-1 px-4 py-2 rounded-md font-medium transition-colors ${
                durationMode === 'calculated'
                  ? 'bg-green-500 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Start/End Time
            </button>
          </div>

          {durationMode === 'manual' ? (
            <div>
              <label htmlFor="duration" className="block text-sm font-medium text-gray-700 mb-1">
                Duration (minutes) *
              </label>
              <input
                type="number"
                id="duration"
                name="duration"
                value={formData.duration}
                onChange={handleChange}
                placeholder="e.g., 30"
                min="1"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="startTime" className="block text-sm font-medium text-gray-700 mb-1">
                  Start Time *
                </label>
                <input
                  type="time"
                  id="startTime"
                  name="startTime"
                  value={formData.startTime}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
              <div>
                <label htmlFor="endTime" className="block text-sm font-medium text-gray-700 mb-1">
                  End Time *
                </label>
                <input
                  type="time"
                  id="endTime"
                  name="endTime"
                  value={formData.endTime}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
              {formData.startTime && formData.endTime && formData.duration && (
                <div className="col-span-2 bg-blue-50 rounded-md p-3">
                  <small className="text-blue-700 font-medium">
                    Calculated Duration: {formData.duration} minutes ({Math.floor(parseInt(formData.duration) / 60)}h {parseInt(formData.duration) % 60}m)
                  </small>
                </div>
              )}
            </div>
          )}
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
            Description (optional)
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Add details, links, or proof of activity..."
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent resize-y"
          />
        </div>

        <div className="bg-gray-50 rounded-md p-3">
          <small className="text-gray-600">
            📅 Date: {new Date(today).toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </small>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 px-4 py-3 rounded-md text-sm">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-green-500 hover:bg-green-600 text-white font-medium py-3 px-4 rounded-md transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Adding...' : 'Add Activity'}
        </button>
      </form>
    </div>
  );
};

export default AddActivityForm;