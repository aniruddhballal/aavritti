import TextInputField from './TextInputField';
import TextAreaField from './TextAreaField';
import TimeRangeField from './TimeRangeField';
import { useState, useEffect } from 'react';
import { activityService } from '../../../services';
import type { CategorySuggestion } from '../../../types/activity';

interface ModalBodyProps {
  editForm: {
    title: string;
    description: string;
    category: string;
    subcategory: string;
    duration: number;
    startTime: string;
    endTime: string;
  };
  validationError: string;
  editSubcategories: string[];
  onEditChange: (field: string, value: any) => void;
  isDarkMode: boolean;
}

const ModalBody = ({
  editForm,
  validationError,
  editSubcategories,
  onEditChange,
  isDarkMode
}: ModalBodyProps) => {
  const [categorySuggestions, setCategorySuggestions] = useState<CategorySuggestion[]>([]);

  // Fetch category suggestions
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const suggestions = await activityService.getCategorySuggestions('');
        setCategorySuggestions(suggestions);
      } catch (err) {
        console.error('Failed to fetch categories:', err);
      }
    };
    fetchCategories();
  }, []);

  // Helper function to convert hex to RGB
  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : { r: 0, g: 0, b: 0 };
  };

  // Find the selected category object for color
  const selectedCategoryObj = categorySuggestions.find(
    cat => cat.name.toLowerCase() === editForm.category.toLowerCase()
  );

  return (
    <div className="overflow-y-auto flex-1">
      <div className="p-8 space-y-6">
        {/* Category Selection */}
        <div>
          <label className={`block text-sm font-medium mb-3 tracking-wide ${
            isDarkMode ? 'text-gray-300' : 'text-gray-700'
          }`}>
            CATEGORY <span className="text-red-500">*</span>
          </label>
          
          <div className="flex gap-2 flex-wrap">
            {editForm.category ? (
              // Show only selected category with clear button
              <>
                <button
                  type="button"
                  className="px-4 py-2 rounded-lg text-sm font-medium text-white shadow-md transform scale-105 transition-all capitalize"
                  style={{ backgroundColor: selectedCategoryObj?.color || '#95A5A6' }}
                >
                  {editForm.category}
                </button>
                <button
                  type="button"
                  onClick={() => onEditChange('category', '')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    isDarkMode
                      ? 'bg-red-900/30 text-red-400 hover:bg-red-900/50'
                      : 'bg-red-50 text-red-600 hover:bg-red-100'
                  }`}
                >
                  Clear
                </button>
              </>
            ) : (
              // Show all categories with colored text and subtle background tint
              <>
                {categorySuggestions.map(cat => {
                  const rgb = hexToRgb(cat.color);
                  const bgColor = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.15)`;
                  
                  return (
                    <button
                      key={cat.name}
                      type="button"
                      onClick={() => onEditChange('category', cat.name)}
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
              </>
            )}
          </div>
        </div>

        {/* Subcategory Selection (only if editSubcategories exist) */}
        {editSubcategories.length > 0 && (
          <div>
            <label className={`block text-sm font-medium mb-3 tracking-wide ${
              isDarkMode ? 'text-gray-300' : 'text-gray-700'
            }`}>
              SUBCATEGORY <span className={`text-xs font-light ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>(optional)</span>
            </label>
            
            <div className="flex gap-2 flex-wrap">
              {editForm.subcategory ? (
                // Show only selected subcategory with clear button
                <>
                  <button
                    type="button"
                    className="px-4 py-2 rounded-lg text-sm font-medium text-white shadow-md transform scale-105 transition-all capitalize"
                    style={{ backgroundColor: selectedCategoryObj?.color || '#95A5A6' }}
                  >
                    {editForm.subcategory.charAt(0).toUpperCase() + editForm.subcategory.slice(1)}
                  </button>
                  <button
                    type="button"
                    onClick={() => onEditChange('subcategory', '')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      isDarkMode
                        ? 'bg-red-900/30 text-red-400 hover:bg-red-900/50'
                        : 'bg-red-50 text-red-600 hover:bg-red-100'
                    }`}
                  >
                    Clear
                  </button>
                </>
              ) : (
                // Show all subcategories with colored text and subtle background
                <>
                  {editSubcategories.map(sub => {
                    const rgb = hexToRgb(selectedCategoryObj?.color || '#95A5A6');
                    const bgColor = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.15)`;
                    
                    return (
                      <button
                        key={sub}
                        type="button"
                        onClick={() => onEditChange('subcategory', sub)}
                        className="px-4 py-2 rounded-lg text-sm font-medium transition-all capitalize hover:shadow-md hover:scale-105"
                        style={{ color: selectedCategoryObj?.color || '#95A5A6', backgroundColor: bgColor }}
                      >
                        {sub.charAt(0).toUpperCase() + sub.slice(1)}
                      </button>
                    );
                  })}
                </>
              )}
            </div>
          </div>
        )}

        <TextInputField
          label="Title"
          value={editForm.title}
          onChange={(value) => onEditChange('title', value)}
          isDarkMode={isDarkMode}
          required
          placeholder="Enter activity title"
        />

        <TextAreaField
          label="Description"
          value={editForm.description}
          onChange={(value) => onEditChange('description', value)}
          isDarkMode={isDarkMode}
          rows={1}
          placeholder="Add details about this activity"
        />

        <TimeRangeField
          startTime={editForm.startTime}
          endTime={editForm.endTime}
          onStartChange={(value) => onEditChange('startTime', value)}
          onEndChange={(value) => onEditChange('endTime', value)}
          isDarkMode={isDarkMode}
          duration={editForm.duration}
        />

        {validationError && (
          <div className={`error-alert border rounded-lg p-4 text-sm flex items-start gap-2 ${
            isDarkMode
              ? 'bg-red-900/30 border-red-800 text-red-300'
              : 'bg-red-50 border-red-200 text-red-700'
          }`}>
            <span className="text-base">⚠️</span>
            <span>{validationError}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default ModalBody;