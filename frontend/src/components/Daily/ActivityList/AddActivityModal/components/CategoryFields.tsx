import { useDarkMode } from '../../../../../contexts/DarkModeContext';
import type { Category } from '../types';

interface CategoryFieldsProps {
  categories: Category[];
  subcategories: string[];
  selectedCategory: string;
  selectedSubcategory: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
}

const CategoryFields = ({
  categories,
  subcategories,
  selectedCategory,
  selectedSubcategory,
  onChange,
}: CategoryFieldsProps) => {
  const { isDarkMode } = useDarkMode();

  return (
    <>
      <div>
        <label className={`block text-sm font-medium mb-2 ${
          isDarkMode ? 'text-gray-300' : 'text-gray-700'
        }`}>
          Category <span className="text-red-400">*</span>
        </label>
        <div className="select-wrapper">
          <select
            name="category"
            value={selectedCategory}
            onChange={onChange}
            className={`input-field w-full px-4 py-2.5 border rounded-lg focus:outline-none transition-colors ${
              isDarkMode
                ? 'bg-gray-700 border-gray-600 text-gray-100'
                : 'bg-white border-gray-200 text-gray-700'
            }`}
          >
            <option value="">Select a category</option>
            {categories.map(cat => (
              <option key={cat.value} value={cat.value}>
                {cat.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {subcategories.length > 0 && (
        <div>
          <label className={`block text-sm font-medium mb-2 ${
            isDarkMode ? 'text-gray-300' : 'text-gray-700'
          }`}>
            Subcategory <span className="text-red-400">*</span>
          </label>
          <div className="select-wrapper">
            <select
              name="subcategory"
              value={selectedSubcategory}
              onChange={onChange}
              className={`input-field w-full px-4 py-2.5 border rounded-lg focus:outline-none transition-colors ${
                isDarkMode
                  ? 'bg-gray-700 border-gray-600 text-gray-100'
                  : 'bg-white border-gray-200 text-gray-700'
              }`}
            >
              <option value="">Select a subcategory</option>
              {subcategories.map(sub => (
                <option key={sub} value={sub}>
                  {sub.charAt(0).toUpperCase() + sub.slice(1)}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}
    </>
  );
};

export default CategoryFields;