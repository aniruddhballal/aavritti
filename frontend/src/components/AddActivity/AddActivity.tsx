import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
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
  const location = useLocation();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState<string>('');
  
  // Get suggested start time from navigation state
  const suggestedStartTime = location.state?.suggestedStartTime;
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    startTime: '',
    endTime: '',
    duration: ''
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  const getTodayIST = () => {
    const now = new Date();
    return now.toLocaleDateString('en-CA', {
      timeZone: 'Asia/Kolkata',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  };

  const getCurrentISTTime = () => {
    const now = new Date();
    const istTime = now.toLocaleTimeString('en-GB', {
      timeZone: 'Asia/Kolkata',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
    return istTime;
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

  // Calculate if activity form should be shown
  const showActivityForm = selectedCategory && (!selectedCategory.subcategories || selectedSubcategory);

  // Auto-fill times when form becomes visible
  useEffect(() => {
    if (showActivityForm && !formData.startTime && !formData.endTime) {
      const currentTime = getCurrentISTTime();
      setFormData(prev => ({
        ...prev,
        startTime: suggestedStartTime || currentTime,
        endTime: currentTime
      }));
    }
  }, [showActivityForm, suggestedStartTime, formData.startTime, formData.endTime]);

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
      navigate(`/daily/${today}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add activity');
    } finally {
      setIsSubmitting(false);
    }
  };

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
    <div className={`min-h-screen p-6 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <style>{`
        @keyframes shimmer-in {
          0% {
            transform: translateX(-100%);
            opacity: 0;
          }
          50% {
            opacity: 1;
          }
          100% {
            transform: translateX(100%);
            opacity: 0;
          }
        }
        
        @keyframes shimmer-out {
          0% {
            transform: translateX(100%);
            opacity: 0;
          }
          50% {
            opacity: 1;
          }
          100% {
            transform: translateX(-100%);
            opacity: 0;
          }
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
          background: linear-gradient(
            90deg,
            transparent,
            rgba(255, 255, 255, 0.3),
            transparent
          );
          transform: translateX(-100%);
          opacity: 0;
          pointer-events: none;
        }
        
        .shimmer-effect:hover::before {
          animation: shimmer-in 0.6s ease-out forwards;
        }
        
        .shimmer-effect:not(:hover)::before {
          animation: shimmer-out 0.6s ease-out forwards;
        }
        
        .shimmer-effect-dark::before {
          background: linear-gradient(
            90deg,
            transparent,
            rgba(255, 255, 255, 0.15),
            transparent
          );
        }
      `}</style>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate(-1)}
            className={`mb-4 px-4 py-2 rounded-lg font-medium transition-all duration-200 hover:-translate-y-0.5 ${
              isDarkMode
                ? 'bg-gray-800 text-gray-300 hover:bg-gray-700 border border-gray-700'
                : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200 shadow-sm'
            }`}
          >
            ← Back to Daily
          </button>
          {(selectedCategory || selectedSubcategory || showActivityForm) && (
            <button
              onClick={handleBack}
              className={`mb-4 ml-3 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                isDarkMode
                  ? 'bg-gray-800 text-gray-300 hover:bg-gray-700 border border-gray-700'
                  : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200 shadow-sm'
              }`}
            >
              ← Back Step
            </button>
          )}
          <div className="flex items-center gap-3 mb-2">
            <h1 className={`text-3xl font-light tracking-wide ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              {!selectedCategory && 'Select Category'}
              {selectedCategory && !selectedSubcategory && selectedCategory.subcategories && 'Select Subcategory'}
              {showActivityForm && 'Activity Details'}
            </h1>
          </div>
          <div className={`w-16 h-0.5 ${isDarkMode ? 'bg-gradient-to-r from-gray-600 to-gray-800' : 'bg-gradient-to-r from-gray-900 to-gray-600'}`}></div>
        </div>

        {/* Category Selection */}
        {!selectedCategory && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {categories.map((category) => (
              <button
                key={category.value}
                onClick={() => handleCategorySelect(category)}
                className={`shimmer-effect group p-8 rounded-xl font-semibold text-white transition-all duration-300 hover:shadow-lg hover:-translate-y-1 hover:rotate-1 ${
                  isDarkMode ? 'hover:shadow-gray-900/50' : 'hover:shadow-gray-400/30'
                }`}
                style={{ backgroundColor: getCategoryColor(category.value) }}
              >
                <span className="block text-lg">{category.label}</span>
              </button>
            ))}
          </div>
        )}

        {/* Subcategory Selection */}
        {selectedCategory && !selectedSubcategory && selectedCategory.subcategories && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
            {selectedCategory.subcategories.map((subcategory) => (
              <button
                key={subcategory}
                onClick={() => handleSubcategorySelect(subcategory)}
                className={`shimmer-effect ${isDarkMode ? 'shimmer-effect-dark' : ''} group p-8 rounded-xl font-semibold capitalize transition-all duration-300 hover:-translate-y-1 hover:-rotate-1 ${
                  isDarkMode
                    ? 'bg-gray-800 text-gray-100 hover:bg-gray-700 border border-gray-700 shadow-sm'
                    : 'bg-white text-gray-800 hover:bg-gray-50 border border-gray-200 shadow-sm hover:shadow-md'
                }`}
              >
                {subcategory}
              </button>
            ))}
          </div>
        )}

        {/* Activity Form */}
        {showActivityForm && (
          <div className="max-w-3xl">
            <div className={`rounded-xl overflow-hidden ${
              isDarkMode 
                ? 'bg-gray-800 border border-gray-700 shadow-sm' 
                : 'bg-white border border-gray-200 shadow-sm'
            }`}>
              {/* Form Header */}
              <div className={`px-8 py-6 border-b ${
                isDarkMode ? 'bg-gray-800/50 border-gray-700' : 'bg-gray-50/50 border-gray-100'
              }`}>
                <div className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
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

              {/* Form Content */}
              <div className="px-8 py-8">
                <div className="space-y-6">
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
                      autoFocus
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
                      onClick={handleBack}
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
                      disabled={isSubmitting || !formData.title.trim() || !formData.duration}
                      className={`shimmer-effect ${isDarkMode ? 'shimmer-effect-dark' : ''} flex-1 px-6 py-3 rounded-lg font-medium transition-all duration-200 hover:-translate-y-0.5 ${
                        isSubmitting || !formData.title.trim() || !formData.duration
                          ? isDarkMode
                            ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                            : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                          : isDarkMode
                            ? 'bg-gray-100 text-gray-900 hover:bg-white'
                            : 'bg-gray-900 text-white hover:bg-black shadow-sm'
                      }`}
                    >
                      {isSubmitting ? 'Adding...' : 'Add Activity'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AddActivity;