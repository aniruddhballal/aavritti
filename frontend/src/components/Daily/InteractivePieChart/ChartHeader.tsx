import { ArrowLeft, RotateCcw } from 'lucide-react';
import type { Activity } from '../../../types/activity';
import type { DrillLevel } from './interactivePieChart.utils';

interface ChartHeaderProps {
  drillLevel: DrillLevel;
  drilldownCategory: string | null;
  drilldownSubcategory: string | null;
  breadcrumb: string;
  hiddenCategories: Set<string>;
  activities: Activity[];
  isDarkMode: boolean;
  onBackToCategories: () => void;
  onBackToSubcategories: () => void;
}

export const ChartHeader = ({
  drillLevel,
  drilldownSubcategory,
  breadcrumb,
  hiddenCategories,
  activities,
  isDarkMode,
  onBackToCategories,
  onBackToSubcategories,
}: ChartHeaderProps) => {
  const getHiddenCategoriesText = () => {
    if (hiddenCategories.size === 0) return null;
    
    const allCategories = Array.from(new Set(activities.map(a => a.category).filter(Boolean)));  // ✅ Filter out undefined
    const visibleCategories = allCategories.filter(cat => !hiddenCategories.has(cat));
    const hiddenCategoryList = Array.from(hiddenCategories);
    
    const showHidden = hiddenCategoryList.length <= visibleCategories.length;
    const list = showHidden ? hiddenCategoryList : visibleCategories;
    const label = showHidden ? 'Hidden' : 'Active';
    
    return `${label}: ${list.map(cat => cat.charAt(0).toUpperCase() + cat.slice(1)).join(', ')}`;
  };

  return (
    <div className="mb-6 space-y-3">
      <div className="flex items-center gap-3 w-full">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-3">
            {drillLevel !== 'category' && (
              <button
                onClick={drillLevel === 'activity' && drilldownSubcategory 
                  ? onBackToSubcategories 
                  : onBackToCategories}
                className={`group p-2.5 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95 ${
                  isDarkMode
                    ? 'text-gray-400 hover:text-gray-100 hover:bg-gray-700'
                    : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'
                }`}
                title={drillLevel === 'activity' && drilldownSubcategory ? 'Back to Subcategories' : 'Back to Categories'}
              >
                <ArrowLeft size={20} className="transition-transform duration-200 group-hover:-translate-x-0.5" />
              </button>
            )}
          </div>
        </div>
        <div className="flex-1">
          <h3 className={`text-lg font-bold tracking-tight ${
            isDarkMode ? 'text-gray-100' : 'text-gray-800'
          }`}>
            {drillLevel === 'category' && 'Category Distribution'}
            {drillLevel === 'subcategory' && 'Subcategory Breakdown'}
            {drillLevel === 'activity' && 'Activity Breakdown'}
          </h3>
          <div className="min-h-[24px] mt-1">
            {drillLevel !== 'category' ? (
              <p className={`text-sm font-medium ${
                isDarkMode ? 'text-gray-400' : 'text-gray-500'
              }`}>
                {breadcrumb}
              </p>
            ) : (
              (() => {
                const text = getHiddenCategoriesText();
                return text ? (
                  <p className={`text-sm font-medium ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-500'
                  }`}>
                    {text}
                  </p>
                ) : null;
              })()
            )}
          </div>
        </div>
        <div className="ml-auto self-start">
          <button
            onClick={onBackToCategories}
            className={`group pt-0 pr-2 transition-all duration-300 hover:scale-105 active:scale-95 ${
              isDarkMode ? 'text-gray-400 hover:text-gray-100' : 'text-gray-500 hover:text-gray-900'
            }`}
            title="Reset to Categories"
          >
            <RotateCcw size={20} className="transition-transform duration-500 group-hover:rotate-[-360deg]" />
          </button>
        </div>
      </div>
    </div>
  );
};