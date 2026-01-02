import { useState, useEffect } from 'react';
import { activityService } from '../../services/activityService';
import { useDarkMode } from '../../contexts/DarkModeContext';

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

  if (loading) {
    return (
      <div className={`p-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
        Loading categories...
      </div>
    );
  }

  if (error) {
    return (
      <div className={`p-4 ${isDarkMode ? 'text-red-400' : 'text-red-600'}`}>
        Error: {error}
      </div>
    );
  }

  return (
    <div className={`p-4 ${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'}`}>
      <h2 className="text-xl font-bold mb-4">Add Activity</h2>
      
      <div className="space-y-2">
        <h3 className="text-lg font-semibold mb-2">Available Categories:</h3>
        {categories.map((category) => (
          <div
            key={category.value}
            className={`p-3 rounded-lg ${
              isDarkMode ? 'bg-gray-700' : 'bg-gray-100'
            }`}
          >
            <div className="font-medium">{category.label}</div>
            {category.subcategories && category.subcategories.length > 0 && (
              <div className={`text-sm mt-1 ${
                isDarkMode ? 'text-gray-400' : 'text-gray-600'
              }`}>
                Subcategories: {category.subcategories.join(', ')}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default AddActivity;