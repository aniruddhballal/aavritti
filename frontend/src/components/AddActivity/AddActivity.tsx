import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { activityService } from '../../services/activityService';
import { useDarkMode } from '../../contexts/DarkModeContext';
import DarkModeToggle from '../DarkModeToggle/DarkModeToggle';
import { ArrowLeft } from 'lucide-react';
import type { CategorySuggestion } from '../../types/activity';

const AddActivity = () => {
  const { isDarkMode } = useDarkMode();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get date from navigation state, fallback to today
  const getTodayIST = () => {
    const now = new Date();
    return now.toLocaleDateString('en-CA', {
      timeZone: 'Asia/Kolkata',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  };

  const activityDate = location.state?.date || getTodayIST();
  const suggestedStartTime = location.state?.suggestedStartTime;
  
  // State for categories and selections
  const [categorySuggestions, setCategorySuggestions] = useState<CategorySuggestion[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<CategorySuggestion | null>(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState<string>('');
  const [loading, setLoading] = useState(true);
  
  const [error, setError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    startTime: '',
    endTime: '',
    duration: ''
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  const getCurrentISTTime = () => {
    const now = new Date();
    return now.toLocaleTimeString('en-GB', {
      timeZone: 'Asia/Kolkata',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  };

  // Fetch all categories on mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const suggestions = await activityService.getCategorySuggestions('');
        setCategorySuggestions(suggestions);
      } catch (err) {
        console.error('Error fetching categories:', err);
        setError('Failed to load categories');
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  // Auto-fill times when category is selected
  useEffect(() => {
    if (selectedCategory && !formData.startTime && !formData.endTime) {
      const currentTime = getCurrentISTTime();
      setFormData(prev => ({
        ...prev,
        startTime: suggestedStartTime || currentTime,
        endTime: currentTime
      }));
    }
  }, [selectedCategory, suggestedStartTime, formData.startTime, formData.endTime]);

  // Calculate duration from times
  useEffect(() => {
    if (formData.startTime && formData.endTime) {
      const start = new Date(`${activityDate}T${formData.startTime}`);
      const end = new Date(`${activityDate}T${formData.endTime}`);
      const diffMinutes = Math.round((end.getTime() - start.getTime()) / 60000);
      
      if (diffMinutes > 0) {
        setFormData(prev => ({ ...prev, duration: diffMinutes.toString() }));
      } else {
        setFormData(prev => ({ ...prev, duration: '' }));
      }
    }
  }, [formData.startTime, formData.endTime, activityDate]);

  const handleCategorySelect = (category: CategorySuggestion) => {
    setSelectedCategory(category);
    setSelectedSubcategory(''); // Reset subcategory when category changes
  };

  const handleSubcategorySelect = (subcategory: string) => {
    setSelectedSubcategory(subcategory);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async () => {
    setError(null);

    if (!selectedCategory) {
      setError('Please select a category');
      return;
    }

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
        date: activityDate, // Use the date from navigation state or today
        category: selectedCategory.name,
        subcategory: selectedSubcategory || undefined,
        title: formData.title.trim(),
        duration: durationInMinutes,
        description: formData.description.trim() || undefined,
        startTime: formData.startTime,
        endTime: formData.endTime
      };

      await activityService.createActivity(activityData);
      navigate(`/daily/${activityDate}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add activity');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className={`min-h-screen p-6 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className="max-w-3xl mx-auto flex items-center justify-center h-64">
          <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>Loading categories...</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen p-6 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <style>{`
        @keyframes shimmer-in {
          0% { transform: translateX(-100%); opacity: 0; }
          50% { opacity: 1; }
          100% { transform: translateX(100%); opacity: 0; }
        }
        
        .shimmer-effect {
          position: relative;
          overflow: hidden;
        }
        
        .shimmer-effect::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
          transform: translateX(-100%);
          opacity: 0;
          pointer-events: none;
        }
        
        .shimmer-effect:hover::before {
          animation: shimmer-in 0.6s ease-out forwards;
        }
      `}</style>

      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={() => navigate(-1)}
              className={`flex items-center gap-2 transition-colors ${
                isDarkMode
                  ? 'text-gray-400 hover:text-gray-100'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <ArrowLeft size={20} />
              <span>Back to Calendar</span>
            </button>

            <DarkModeToggle />
          </div>
          
          <div className="flex items-center gap-3 mb-2">
            <h1 className={`text-3xl font-light tracking-wide ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Add Activity
            </h1>
            <span className={`text-sm ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
              for {new Date(activityDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </span>
          </div>
          <div className={`w-16 h-0.5 ${isDarkMode ? 'bg-gradient-to-r from-gray-600 to-gray-800' : 'bg-gradient-to-r from-gray-900 to-gray-600'}`}></div>
        </div>

        {/* Main Form */}
        <div className={`rounded-xl overflow-hidden ${
          isDarkMode 
            ? 'bg-gray-800 border border-gray-700 shadow-sm' 
            : 'bg-white border border-gray-200 shadow-sm'
        }`}>
          <div className="px-8 py-8">
            <div className="space-y-6">
              {/* Category Selection */}
              <div>
                <label className={`block text-sm font-medium mb-3 tracking-wide ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  CATEGORY <span className="text-red-500">*</span>
                </label>
                <div className="flex gap-2 flex-wrap">
                  {categorySuggestions.map(cat => (
                    <button
                      key={cat.name}
                      type="button"
                      onClick={() => handleCategorySelect(cat)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all capitalize ${
                        selectedCategory?.name === cat.name
                          ? 'text-white shadow-md transform scale-105'
                          : isDarkMode
                            ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                      style={selectedCategory?.name === cat.name ? { backgroundColor: cat.color } : {}}
                    >
                      {cat.displayName}
                    </button>
                  ))}
                </div>
              </div>

              {/* Subcategory Selection (only if category has subcategories) */}
              {selectedCategory && selectedCategory.subcategories && selectedCategory.subcategories.length > 0 && (
                <div>
                  <label className={`block text-sm font-medium mb-3 tracking-wide ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    SUBCATEGORY <span className={`text-xs font-light ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>(optional)</span>
                  </label>
                  <div className="flex gap-2 flex-wrap">
                    {selectedCategory.subcategories.map(sub => (
                      <button
                        key={sub.name}
                        type="button"
                        onClick={() => handleSubcategorySelect(sub.displayName)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all capitalize ${
                          selectedSubcategory === sub.displayName
                            ? 'text-white shadow-md transform scale-105'
                            : isDarkMode
                              ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                        style={selectedSubcategory === sub.displayName ? { backgroundColor: selectedCategory.color } : {}}
                      >
                        {sub.displayName}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Selected Category Display */}
              {selectedCategory && (
                <div className={`rounded-lg p-4 border ${
                  isDarkMode ? 'bg-gray-900/50 border-gray-700' : 'bg-gray-50 border-gray-200'
                }`}>
                  <div className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    Selected: <span className="font-semibold capitalize" style={{ color: selectedCategory.color }}>
                      {selectedCategory.displayName}
                    </span>
                    {selectedSubcategory && (
                      <span className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>
                        {' → '}<span className="capitalize">{selectedSubcategory}</span>
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Activity Title */}
              <div>
                <label className={`block text-sm font-medium mb-2 tracking-wide ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  ACTIVITY TITLE <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="e.g., Morning Run"
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-0 transition-all ${
                    isDarkMode
                      ? 'bg-gray-900 border-gray-700 text-gray-100 placeholder:text-gray-500 focus:ring-gray-600 focus:border-gray-600'
                      : 'bg-white border-gray-300 text-gray-900 placeholder:text-gray-400 focus:ring-gray-400 focus:border-gray-400'
                  }`}
                />
              </div>

              {/* Description */}
              <div>
                <label className={`block text-sm font-medium mb-2 tracking-wide ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  DESCRIPTION <span className={`text-xs font-light ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>(optional)</span>
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Add details, links, or proof of activity..."
                  rows={4}
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-0 resize-y transition-all ${
                    isDarkMode
                      ? 'bg-gray-900 border-gray-700 text-gray-100 placeholder:text-gray-500 focus:ring-gray-600 focus:border-gray-600'
                      : 'bg-white border-gray-300 text-gray-900 placeholder:text-gray-400 focus:ring-gray-400 focus:border-gray-400'
                  }`}
                />
              </div>

              {/* Duration */}
              <div className="space-y-4">
                <label className={`block text-sm font-medium tracking-wide ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  DURATION <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-2 gap-5">
                  <div>
                    <label className={`block text-xs font-medium mb-2 tracking-wider ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                      START TIME
                    </label>
                    <input
                      type="time"
                      name="startTime"
                      value={formData.startTime}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-0 transition-all ${
                        isDarkMode
                          ? 'bg-gray-900 border-gray-700 text-gray-100 focus:ring-gray-600 focus:border-gray-600'
                          : 'bg-white border-gray-300 text-gray-900 focus:ring-gray-400 focus:border-gray-400'
                      }`}
                    />
                  </div>
                  <div>
                    <label className={`block text-xs font-medium mb-2 tracking-wider ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                      END TIME
                    </label>
                    <input
                      type="time"
                      name="endTime"
                      value={formData.endTime}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-0 transition-all ${
                        isDarkMode
                          ? 'bg-gray-900 border-gray-700 text-gray-100 focus:ring-gray-600 focus:border-gray-600'
                          : 'bg-white border-gray-300 text-gray-900 focus:ring-gray-400 focus:border-gray-400'
                      }`}
                    />
                  </div>
                </div>
                {formData.startTime && formData.endTime && formData.duration && (
                  <div className={`rounded-lg p-4 border ${
                    isDarkMode 
                      ? 'bg-blue-900/20 border-blue-800' 
                      : 'bg-blue-50 border-blue-200'
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
                <div className={`border rounded-lg p-4 text-sm flex items-start gap-3 ${
                  isDarkMode
                    ? 'bg-red-900/30 border-red-800 text-red-300'
                    : 'bg-red-50 border-red-200 text-red-700'
                }`}>
                  <span className="text-base">⚠️</span>
                  <span className="font-medium">{error}</span>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => navigate(-1)}
                  className={`flex-1 px-6 py-3 border rounded-lg font-medium transition-all duration-200 hover:-translate-y-0.5 ${
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
                  disabled={isSubmitting || !selectedCategory || !formData.title.trim() || !formData.duration}
                  className={`flex-1 px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                    isSubmitting || !selectedCategory || !formData.title.trim() || !formData.duration
                      ? isDarkMode
                        ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                        : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      : `shimmer-effect hover:-translate-y-0.5 ${isDarkMode
                        ? 'bg-gray-100 text-gray-900 hover:bg-white'
                        : 'bg-gray-900 text-white hover:bg-black shadow-sm'}`
                  }`}
                >
                  {isSubmitting ? 'Adding...' : 'Add Activity'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddActivity;