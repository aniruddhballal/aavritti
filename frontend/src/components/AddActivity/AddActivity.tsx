import { useState, useEffect } from 'react';
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
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Step tracking
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState<string>('');
  const [activityName, setActivityName] = useState('');

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

  const handleCategorySelect = (category: Category) => {
    setSelectedCategory(category);
    setSelectedSubcategory('');
    setActivityName('');
  };

  const handleSubcategorySelect = (subcategory: string) => {
    setSelectedSubcategory(subcategory);
    setActivityName('');
  };

  const handleBack = () => {
    if (activityName) {
      setActivityName('');
    } else if (selectedSubcategory) {
      setSelectedSubcategory('');
    } else if (selectedCategory) {
      setSelectedCategory(null);
    }
  };

  const showActivityInput = selectedCategory && (!selectedCategory.subcategories || selectedSubcategory);

  if (loading) {
    return (
      <div className={`flex items-center justify-center h-64 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
        Loading categories...
      </div>
    );
  }

  if (error) {
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
        {(selectedCategory || selectedSubcategory || activityName) && (
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
          {showActivityInput && 'Activity Details'}
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

      {/* Step 3: Activity Name Input */}
      {showActivityInput && (
        <div className="max-w-2xl">
          <div className={`p-6 rounded-xl shadow-lg ${
            isDarkMode ? 'bg-gray-800' : 'bg-white'
          }`}>
            <div className="mb-4">
              <div className={`text-sm font-medium mb-2 ${
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

            <div className="space-y-4">
              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Activity Name <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={activityName}
                  onChange={(e) => setActivityName(e.target.value)}
                  placeholder="Enter activity name..."
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${
                    isDarkMode
                      ? 'bg-gray-700 border-gray-600 text-gray-100 placeholder:text-gray-500 focus:ring-blue-500'
                      : 'bg-white border-gray-300 text-gray-900 placeholder:text-gray-400 focus:ring-blue-500'
                  }`}
                  autoFocus
                />
              </div>

              <button
                onClick={() => console.log({ 
                  category: selectedCategory.value, 
                  subcategory: selectedSubcategory || undefined, 
                  name: activityName 
                })}
                disabled={!activityName.trim()}
                className={`w-full px-6 py-3 rounded-lg font-semibold transition-all ${
                  activityName.trim()
                    ? 'bg-green-500 text-white hover:bg-green-600'
                    : isDarkMode
                      ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                      : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
              >
                Continue
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddActivity;