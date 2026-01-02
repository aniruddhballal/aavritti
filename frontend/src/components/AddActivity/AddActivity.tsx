import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { activityService } from '../../services/activityService';
import { useDarkMode } from '../../contexts/DarkModeContext';
import { getCategoryColor } from '../../utils/categoryColors';

interface Category {
  value: string;
  label: string;
  subcategories?: string[];
}

const AddActivity = () => {
  const { isDarkMode } = useDarkMode();
  const navigate = useNavigate();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Step tracking
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState<string>('');
  
  // Form data
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    startTime: '',
    endTime: '',
    duration: ''
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Get today's date in IST timezone (YYYY-MM-DD)
  const getTodayIST = () => {
    const now = new Date();
    return now.toLocaleDateString('en-CA', {
      timeZone: 'Asia/Kolkata',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  };

  const today = getTodayIST();

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const response = await activityService.getCategories();
        setCategories(response.categories);
      } catch (err) {
        console.error('Error fetching categories:', err);
        setError(err instanceof Error ? err.message : 'Failed to load categories');
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  // Calculate duration from start/end times
  useEffect(() => {
    if (formData.startTime && formData.endTime) {
      const start = new Date(`${today}T${formData.startTime}`);
      const end = new Date(`${today}T${formData.endTime}`);
      const diffMinutes = Math.round((end.getTime() - start.getTime()) / 60000);
      
      if (diffMinutes > 0) {
        setFormData(prev => ({ ...prev, duration: diffMinutes.toString() }));
      } else {
        setFormData(prev => ({ ...prev, duration: '' }));
      }
    }
  }, [formData.startTime, formData.endTime, today]);

  const handleCategorySelect = (category: Category) => {
    setSelectedCategory(category);
    setSelectedSubcategory('');
    setFormData({
      title: '',
      description: '',
      startTime: '',
      endTime: '',
      duration: ''
    });
  };

  const handleSubcategorySelect = (subcategory: string) => {
    setSelectedSubcategory(subcategory);
    setFormData({
      title: '',
      description: '',
      startTime: '',
      endTime: '',
      duration: ''
    });
  };

  const handleBack = () => {
    if (showActivityForm) {
      if (selectedSubcategory) {
        setSelectedSubcategory('');
      } else if (selectedCategory?.subcategories) {
        setSelectedCategory(null);
      } else {
        setSelectedCategory(null);
      }
      setFormData({
        title: '',
        description: '',
        startTime: '',
        endTime: '',
        duration: ''
      });
    } else if (selectedSubcategory) {
      setSelectedSubcategory('');
    } else if (selectedCategory) {
      setSelectedCategory(null);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async () => {
    setError(null);

    const durationInMinutes = parseInt(formData.duration);

    if (!durationInMinutes || durationInMinutes <= 0) {
      setError('Please provide valid start and end times');
      return;
    }

    if (!formData.title.trim()) {
      setError('Please provide an activity title');
      return;
    }

    setIsSubmitting(true);

    try {
      const activityData = {
        date: today,
        category: selectedCategory!.value,
        title: formData.title,
        duration: durationInMinutes,
        description: formData.description,
        startTime: formData.startTime,
        endTime: formData.endTime,
        ...(selectedSubcategory && { subcategory: selectedSubcategory })
      };

      await activityService.createActivity(activityData);

      // Redirect to daily page
      navigate(`/daily/${today}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add activity');
    } finally {
      setIsSubmitting(false);
    }
  };

  const showActivityForm = selectedCategory && (!selectedCategory.subcategories || selectedSubcategory);

  if (loading) {
    return (
      <div className={`flex items-center justify-center h-64 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
        Loading categories...
      </div>
    );
  }

  if (error && !selectedCategory) {
    return (
      <div className={`flex items-center justify-center h-64 ${isDarkMode ? 'text-red-400' : 'text-red-600'}`}>
        Error: {error}
      </div>
    );
  }

  return (
    <div className={`p-6 min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      {/* Header with back button */}
      <div className="mb-6">
        {(selectedCategory || selectedSubcategory || showActivityForm) && (
          <button
            onClick={handleBack}
            className={`mb-4 px-4 py-2 rounded-lg font-medium transition-colors ${
              isDarkMode
                ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            ← Back
          </button>
        )}
        <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          {!selectedCategory && 'Select Category'}
          {selectedCategory && !selectedSubcategory && selectedCategory.subcategories && 'Select Subcategory'}
          {showActivityForm && 'Activity Details'}
        </h2>
      </div>

      {/* Step 1: Category Selection */}
      {!selectedCategory && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {categories.map((category) => (
            <button
              key={category.value}
              onClick={() => handleCategorySelect(category)}
              className={`p-6 rounded-xl font-semibold text-lg transition-all transform hover:scale-105 shadow-md hover:shadow-lg ${
                isDarkMode ? 'text-white' : 'text-white'
              }`}
              style={{ backgroundColor: getCategoryColor(category.value) }}
            >
              {category.label}
            </button>
          ))}
        </div>
      )}

      {/* Step 2: Subcategory Selection */}
      {selectedCategory && !selectedSubcategory && selectedCategory.subcategories && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {selectedCategory.subcategories.map((subcategory) => (
            <button
              key={subcategory}
              onClick={() => handleSubcategorySelect(subcategory)}
              className={`p-6 rounded-xl font-semibold capitalize transition-all transform hover:scale-105 shadow-md hover:shadow-lg ${
                isDarkMode
                  ? 'bg-gray-700 text-gray-100 hover:bg-gray-600'
                  : 'bg-white text-gray-800 hover:bg-gray-100'
              }`}
            >
              {subcategory}
            </button>
          ))}
        </div>
      )}

      {/* Step 3: Activity Form */}
      {showActivityForm && (
        <div className="max-w-2xl">
          <div className={`p-6 rounded-xl shadow-lg ${
            isDarkMode ? 'bg-gray-800' : 'bg-white'
          }`}>
            {/* Category/Subcategory Display */}
            <div className="mb-6">
              <div className={`text-sm font-medium ${
                isDarkMode ? 'text-gray-400' : 'text-gray-600'
              }`}>
                Category: <span className="font-semibold" style={{ color: getCategoryColor(selectedCategory.value) }}>
                  {selectedCategory.label}
                </span>
                {selectedSubcategory && (
                  <span className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>
                    {' → '}{selectedSubcategory}
                  </span>
                )}
              </div>
            </div>

            <div className="space-y-5">
              {/* Activity Title */}
              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Activity Title <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="e.g., Morning Run"
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${
                    isDarkMode
                      ? 'bg-gray-700 border-gray-600 text-gray-100 placeholder:text-gray-500 focus:ring-blue-500'
                      : 'bg-white border-gray-300 text-gray-900 placeholder:text-gray-400 focus:ring-blue-500'
                  }`}
                  autoFocus
                />
              </div>

              {/* Description */}
              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Description <span className="text-gray-400">(optional)</span>
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Add details, links, or proof of activity..."
                  rows={4}
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 resize-y transition-colors ${
                    isDarkMode
                      ? 'bg-gray-700 border-gray-600 text-gray-100 placeholder:text-gray-500 focus:ring-blue-500'
                      : 'bg-white border-gray-300 text-gray-900 placeholder:text-gray-400 focus:ring-blue-500'
                  }`}
                />
              </div>

              {/* Start and End Time */}
              <div className="space-y-4">
                <label className={`block text-sm font-medium ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Duration <span className="text-red-400">*</span>
                </label>
                <div className="grid grid-cols-2 gap-5">
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      Start Time
                    </label>
                    <input
                      type="time"
                      name="startTime"
                      value={formData.startTime}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${
                        isDarkMode
                          ? 'bg-gray-700 border-gray-600 text-gray-100 focus:ring-blue-500'
                          : 'bg-white border-gray-300 text-gray-900 focus:ring-blue-500'
                      }`}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      End Time
                    </label>
                    <input
                      type="time"
                      name="endTime"
                      value={formData.endTime}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${
                        isDarkMode
                          ? 'bg-gray-700 border-gray-600 text-gray-100 focus:ring-blue-500'
                          : 'bg-white border-gray-300 text-gray-900 focus:ring-blue-500'
                      }`}
                    />
                  </div>
                </div>
                {formData.startTime && formData.endTime && formData.duration && (
                  <div className={`rounded-lg p-3 ${
                    isDarkMode ? 'bg-blue-900/30' : 'bg-blue-50'
                  }`}>
                    <div className={`text-sm font-medium ${
                      isDarkMode ? 'text-blue-300' : 'text-blue-700'
                    }`}>
                      Calculated Duration: {formData.duration} minutes ({Math.floor(parseInt(formData.duration) / 60)}h {parseInt(formData.duration) % 60}m)
                    </div>
                  </div>
                )}
              </div>

              {/* Error Alert */}
              {error && (
                <div className={`border rounded-lg p-4 text-sm flex items-start gap-2 ${
                  isDarkMode
                    ? 'bg-red-900/30 border-red-800 text-red-300'
                    : 'bg-red-50 border-red-200 text-red-700'
                }`}>
                  <span className="text-base">⚠️</span>
                  <span>{error}</span>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleBack}
                  className={`flex-1 px-6 py-3 border rounded-lg font-medium transition-colors ${
                    isDarkMode
                      ? 'border-gray-600 text-gray-300 hover:bg-gray-700'
                      : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={isSubmitting || !formData.title.trim() || !formData.duration}
                  className={`flex-1 px-6 py-3 rounded-lg font-semibold transition-all ${
                    isSubmitting || !formData.title.trim() || !formData.duration
                      ? isDarkMode
                        ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                        : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      : 'bg-green-500 text-white hover:bg-green-600 transform hover:scale-105'
                  }`}
                >
                  {isSubmitting ? 'Adding...' : 'Add Activity'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddActivity;