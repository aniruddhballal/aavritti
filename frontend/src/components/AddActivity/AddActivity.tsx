import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { activityService } from '../../services/activityService';
import { useDarkMode } from '../../contexts/DarkModeContext';
import DarkModeToggle from '../DarkModeToggle/DarkModeToggle';
import { ArrowLeft } from 'lucide-react';
import type { CategorySuggestion } from '../../types/activity';
import { getTheme } from '../../theme';

const AddActivity = () => {
  const { isDarkMode } = useDarkMode();
  const theme = getTheme(isDarkMode);
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
  
  // State for creating new categories/subcategories
  const [isCreatingCategory, setIsCreatingCategory] = useState(false);
  const [isCreatingSubcategory, setIsCreatingSubcategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newSubcategoryName, setNewSubcategoryName] = useState('');
  
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
    setIsCreatingCategory(false);
    setNewCategoryName('');
    setIsCreatingSubcategory(false);
    setNewSubcategoryName('');
  };

  const handleSubcategorySelect = (subcategory: string) => {
    setSelectedSubcategory(subcategory);
    setIsCreatingSubcategory(false);
    setNewSubcategoryName('');
  };

  const handleCreateNewCategory = async () => {
    if (!newCategoryName.trim()) return;

    try {
      setError(null);
      setIsSubmitting(true);

      // ✅ Create category immediately via API
      const newCategory = await activityService.createCategory(newCategoryName.trim());
      
      // Set as selected category
      setSelectedCategory(newCategory);
      setIsCreatingCategory(false);
      setNewCategoryName('');
      setSelectedSubcategory('');
      
      // ✅ Refresh categories list to include the new one
      const updatedCategories = await activityService.getCategorySuggestions('');
      setCategorySuggestions(updatedCategories);
    } catch (err: any) {
      // Handle "already exists" error gracefully
      if (err.response?.status === 409 && err.response?.data?.category) {
        const existingCategory = err.response.data.category;
        setSelectedCategory(existingCategory);
        setIsCreatingCategory(false);
        setNewCategoryName('');
        setSelectedSubcategory('');
        
        // Still refresh the list
        const updatedCategories = await activityService.getCategorySuggestions('');
        setCategorySuggestions(updatedCategories);
      } else {
        setError(err.response?.data?.error || 'Failed to create category');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateNewSubcategory = async () => {
    if (!newSubcategoryName.trim() || !selectedCategory) return;

    try {
      setError(null);
      setIsSubmitting(true);

      // ✅ Create subcategory immediately via API
      const newSubcategory = await activityService.createSubcategory(
        selectedCategory.name,
        newSubcategoryName.trim()
      );
      
      // Set as selected subcategory
      setSelectedSubcategory(newSubcategory.displayName);
      setIsCreatingSubcategory(false);
      setNewSubcategoryName('');
      
      // ✅ Refresh categories list to get updated subcategories
      const updatedCategories = await activityService.getCategorySuggestions('');
      setCategorySuggestions(updatedCategories);
      
      // ✅ Update the selected category to include the new subcategory
      const updatedSelectedCategory = updatedCategories.find(
        cat => cat.name === selectedCategory.name
      );
      if (updatedSelectedCategory) {
        setSelectedCategory(updatedSelectedCategory);
      }
    } catch (err: any) {
      // Handle "already exists" error gracefully
      if (err.response?.status === 409 && err.response?.data?.subcategory) {
        const existingSubcategory = err.response.data.subcategory;
        setSelectedSubcategory(existingSubcategory.displayName);
        setIsCreatingSubcategory(false);
        setNewSubcategoryName('');
        
        // Still refresh the list
        const updatedCategories = await activityService.getCategorySuggestions('');
        setCategorySuggestions(updatedCategories);
        
        const updatedSelectedCategory = updatedCategories.find(
          cat => cat.name === selectedCategory.name
        );
        if (updatedSelectedCategory) {
          setSelectedCategory(updatedSelectedCategory);
        }
      } else {
        setError(err.response?.data?.error || 'Failed to create subcategory');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancelNewCategory = () => {
    setIsCreatingCategory(false);
    setNewCategoryName('');
  };

  const handleCancelNewSubcategory = () => {
    setIsCreatingSubcategory(false);
    setNewSubcategoryName('');
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
      setError('Please select or create a category');
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
        category: selectedCategory.displayName, // Use displayName for both new and existing
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
      <div className={`min-h-screen p-6 ${theme.bgPrimary}`}>
        <div className="max-w-3xl mx-auto flex items-center justify-center h-64">
          <span className={theme.textTertiary}>Loading categories...</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen p-6 ${theme.bgPrimary}`}>
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
              className={`flex items-center gap-2 transition-colors ${theme.textTertiary} hover:${theme.textPrimary}`}
            >
              <ArrowLeft size={20} />
              <span>Back to Calendar</span>
            </button>

            <DarkModeToggle />
          </div>
          
          <div className="flex items-center gap-3 mb-2">
            <h1 className={`text-3xl font-light tracking-wide ${theme.textPrimary}`}>
              Add Activity
            </h1>
            <span className={`text-sm ${theme.textMuted}`}>
              for {new Date(activityDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </span>
          </div>
          <div className={`w-16 h-0.5 ${theme.gradient}`}></div>
        </div>

        {/* Main Form */}
        <div className={`rounded-xl overflow-hidden ${theme.bgCard} border ${theme.borderPrimary} ${theme.shadow}`}>
          <div className="px-8 py-8">
            <div className="space-y-6">
              {/* Category Selection */}
              <div>
                <label className={`block text-sm font-medium mb-3 tracking-wide ${theme.textSecondary}`}>
                  CATEGORY <span className="text-red-500">*</span>
                </label>
                
                {!isCreatingCategory ? (
                  <div className="flex gap-2 flex-wrap">
                    {selectedCategory ? (
                      // Show only selected category with full color
                      <>
                        <button
                          type="button"
                          className="px-4 py-2 rounded-lg text-sm font-medium text-white shadow-md transform scale-105 transition-all capitalize"
                          style={{ backgroundColor: selectedCategory.color }}
                        >
                          {selectedCategory.displayName}
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedCategory(null);
                            setSelectedSubcategory('');
                          }}
                          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${theme.buttonDanger}`}
                        >
                          Clear
                        </button>
                      </>
                    ) : (
                      // Show all categories with colored text and subtle background tint
                      <>
                        {categorySuggestions.map(cat => {
                          // Convert hex color to RGB for opacity
                          const hexToRgb = (hex: string) => {
                            const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
                            return result ? {
                              r: parseInt(result[1], 16),
                              g: parseInt(result[2], 16),
                              b: parseInt(result[3], 16)
                            } : { r: 0, g: 0, b: 0 };
                          };
                          
                          const rgb = hexToRgb(cat.color);
                          const bgColor = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.15)`;
                          
                          return (
                            <button
                              key={cat.name}
                              type="button"
                              onClick={() => handleCategorySelect(cat)}
                              className="px-4 py-2 rounded-lg text-sm font-medium transition-all capitalize hover:shadow-md hover:scale-105"
                              style={{ 
                                color: cat.color,
                                backgroundColor: bgColor
                              }}
                            >
                              {cat.displayName}
                            </button>
                          );
                        })}
                        
                        {/* New Category Button */}
                        <button
                          type="button"
                          onClick={() => setIsCreatingCategory(true)}
                          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all border-2 border-dashed ${theme.borderDashed} ${theme.textTertiary} hover:${theme.bgHover}`}
                        >
                          + New Category
                        </button>
                      </>
                    )}
                  </div>
                ) : (
                  <div className={`p-4 rounded-lg border ${theme.bgTertiary} ${theme.borderPrimary}`}>
                    <div className="flex gap-3">
                      <input
                        type="text"
                        value={newCategoryName}
                        onChange={(e) => setNewCategoryName(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            handleCreateNewCategory();
                          } else if (e.key === 'Escape') {
                            handleCancelNewCategory();
                          }
                        }}
                        placeholder="Enter new category name..."
                        autoFocus
                        className={`flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-0 transition-all ${theme.bgInput} ${theme.borderSecondary} ${theme.textPrimary} ${theme.textPlaceholder} ${theme.focusRing}`}
                      />
                      <button
                        type="button"
                        onClick={handleCreateNewCategory}
                        disabled={!newCategoryName.trim() || isSubmitting}
                        className={`px-4 py-2 rounded-lg font-medium transition-all ${
                          !newCategoryName.trim()
                            ? theme.buttonDisabled + ' cursor-not-allowed'
                            : 'bg-green-600 text-white hover:bg-green-700'
                        }`}
                      >
                        Create
                      </button>
                      <button
                        type="button"
                        onClick={handleCancelNewCategory}
                        className={`px-4 py-2 rounded-lg font-medium transition-all ${theme.buttonSecondary}`}
                      >
                        Cancel
                      </button>
                    </div>
                    <p className={`text-xs mt-2 ${theme.textMuted}`}>
                      Press Enter to create, Escape to cancel
                    </p>
                  </div>
                )}
              </div>

              {/* Subcategory Selection (only if category is selected) */}
              {selectedCategory && (
                <div>
                  <label className={`block text-sm font-medium mb-3 tracking-wide ${theme.textSecondary}`}>
                    SUBCATEGORY <span className={`text-xs font-light ${theme.textMuted}`}>(optional)</span>
                  </label>
                  
                  {!isCreatingSubcategory ? (
                    <div className="flex gap-2 flex-wrap">
                      {selectedSubcategory ? (
                        // Show only selected subcategory with clear button
                        <>
                          <button
                            type="button"
                            className="px-4 py-2 rounded-lg text-sm font-medium text-white shadow-md transform scale-105 transition-all capitalize"
                            style={{ backgroundColor: selectedCategory.color }}
                          >
                            {selectedSubcategory}
                          </button>
                          <button
                            type="button"
                            onClick={() => setSelectedSubcategory('')}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${theme.buttonDanger}`}
                          >
                            Clear
                          </button>
                        </>
                      ) : (
                        // Show all subcategories with colored text and subtle background
                        <>
                          {selectedCategory.subcategories && selectedCategory.subcategories.length > 0 && 
                            selectedCategory.subcategories.map(sub => {
                              // Convert hex color to RGB for opacity
                              const hexToRgb = (hex: string) => {
                                const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
                                return result ? {
                                  r: parseInt(result[1], 16),
                                  g: parseInt(result[2], 16),
                                  b: parseInt(result[3], 16)
                                } : { r: 0, g: 0, b: 0 };
                              };
                              
                              const rgb = hexToRgb(selectedCategory.color);
                              const bgColor = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.15)`;
                              
                              return (
                                <button
                                  key={sub.name}
                                  type="button"
                                  onClick={() => handleSubcategorySelect(sub.displayName)}
                                  className="px-4 py-2 rounded-lg text-sm font-medium transition-all capitalize hover:shadow-md hover:scale-105"
                                  style={{ color: selectedCategory.color, backgroundColor: bgColor }}
                                >
                                  {sub.displayName}
                                </button>
                              );
                            })
                          }
                          
                          {/* New Subcategory Button */}
                          <button
                            type="button"
                            onClick={() => setIsCreatingSubcategory(true)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all border-2 border-dashed ${theme.borderDashed} ${theme.textTertiary} hover:${theme.bgHover}`}
                          >
                            + New Subcategory
                          </button>
                        </>
                      )}
                    </div>
                  ) : (
                    <div className={`p-4 rounded-lg border ${theme.bgTertiary} ${theme.borderPrimary}`}>
                      <div className="flex gap-3">
                        <input
                          type="text"
                          value={newSubcategoryName}
                          onChange={(e) => setNewSubcategoryName(e.target.value)}
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              handleCreateNewSubcategory();
                            } else if (e.key === 'Escape') {
                              handleCancelNewSubcategory();
                            }
                          }}
                          placeholder="Enter new subcategory name..."
                          autoFocus
                          className={`flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-0 transition-all ${theme.bgInput} ${theme.borderSecondary} ${theme.textPrimary} ${theme.textPlaceholder} ${theme.focusRing}`}
                        />
                        <button
                          type="button"
                          onClick={handleCreateNewSubcategory}
                          disabled={!newSubcategoryName.trim() || isSubmitting}
                          className={`px-4 py-2 rounded-lg font-medium transition-all ${
                            !newSubcategoryName.trim()
                              ? theme.buttonDisabled + ' cursor-not-allowed'
                              : 'bg-green-600 text-white hover:bg-green-700'
                          }`}
                        >
                          Create
                        </button>
                        <button
                          type="button"
                          onClick={handleCancelNewSubcategory}
                          className={`px-4 py-2 rounded-lg font-medium transition-all ${theme.buttonSecondary}`}
                        >
                          Cancel
                        </button>
                      </div>
                      <p className={`text-xs mt-2 ${theme.textMuted}`}>
                        Press Enter to create, Escape to cancel
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Selected Category Display */}
              {selectedCategory && (
                <div className={`rounded-lg p-4 border ${theme.bgTertiary} ${theme.borderPrimary}`}>
                  <div className={`text-sm font-medium ${theme.textTertiary}`}>
                    Selected: <span className="font-semibold capitalize" style={{ color: selectedCategory.color }}>
                      {selectedCategory.displayName}
                    </span>
                    {selectedSubcategory && (
                      <span className={theme.textSecondary}>
                        {' → '}<span className="capitalize">{selectedSubcategory}</span>
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Activity Title */}
              <div>
                <label className={`block text-sm font-medium mb-2 tracking-wide ${theme.textSecondary}`}>
                  ACTIVITY TITLE <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="e.g., Morning Run"
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-0 transition-all ${theme.bgInput} ${theme.borderPrimary} ${theme.textPrimary} ${theme.textPlaceholder} ${theme.focusRing}`}
                />
              </div>

              {/* Description */}
              <div>
                <label className={`block text-sm font-medium mb-2 tracking-wide ${theme.textSecondary}`}>
                  DESCRIPTION <span className={`text-xs font-light ${theme.textMuted}`}>(optional)</span>
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Add details, links, or proof of activity..."
                  rows={4}
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-0 resize-y transition-all ${theme.bgInput} ${theme.borderPrimary} ${theme.textPrimary} ${theme.textPlaceholder} ${theme.focusRing}`}
                />
              </div>

              {/* Duration */}
              <div className="space-y-4">
                <label className={`block text-sm font-medium tracking-wide ${theme.textSecondary}`}>
                  DURATION <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-2 gap-5">
                  <div>
                    <label className={`block text-xs font-medium mb-2 tracking-wider ${theme.textTertiary}`}>
                      START TIME
                    </label>
                    <input
                      type="time"
                      name="startTime"
                      value={formData.startTime}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-0 transition-all ${theme.bgInput} ${theme.borderPrimary} ${theme.textPrimary} ${theme.focusRing}`}
                    />
                  </div>
                  <div>
                    <label className={`block text-xs font-medium mb-2 tracking-wider ${theme.textTertiary}`}>
                      END TIME
                    </label>
                    <input
                      type="time"
                      name="endTime"
                      value={formData.endTime}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-0 transition-all ${theme.bgInput} ${theme.borderPrimary} ${theme.textPrimary} ${theme.focusRing}`}
                    />
                  </div>
                </div>
                {formData.startTime && formData.endTime && formData.duration && (
                  <div className={`rounded-lg p-4 border ${theme.bgInfo}`}>
                    <div className={`text-sm font-medium ${theme.textInfo}`}>
                      Calculated Duration: {formData.duration} minutes ({Math.floor(parseInt(formData.duration) / 60)}h {parseInt(formData.duration) % 60}m)
                    </div>
                  </div>
                )}
              </div>

              {/* Error Alert */}
              {error && (
                <div className={`border rounded-lg p-4 text-sm flex items-start gap-3 ${theme.bgError} ${theme.textError}`}>
                  <span className="text-base">⚠️</span>
                  <span className="font-medium">{error}</span>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => navigate(-1)}
                  className={`flex-1 px-6 py-3 border rounded-lg font-medium transition-all duration-200 hover:-translate-y-0.5 ${theme.buttonSecondary} border ${theme.borderSecondary}`}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={isSubmitting || !selectedCategory || !formData.title.trim() || !formData.duration}
                  className={`flex-1 px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                    isSubmitting || !selectedCategory || !formData.title.trim() || !formData.duration
                      ? theme.buttonDisabled + ' cursor-not-allowed'
                      : `shimmer-effect hover:-translate-y-0.5 ${theme.buttonPrimary} ${theme.shadow}`
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