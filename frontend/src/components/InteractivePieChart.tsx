import { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Sector } from 'recharts';
import { Eye, EyeOff, ArrowLeft } from 'lucide-react';
import type { Activity } from '../types/activity';
import { getCategoryColor } from '../utils/categoryColors';

interface ChartData {
  name: string;
  value: number;
  hours: string;
  color: string;
  category?: string;
  subcategory?: string;
  activityId?: string;
  [key: string]: any;
}

type DrillLevel = 'category' | 'subcategory' | 'activity';

interface InteractivePieChartProps {
  activities: Activity[];
  categories: string[];
}

const InteractivePieChart = ({ activities, categories }: InteractivePieChartProps) => {
  const [drillLevel, setDrillLevel] = useState<DrillLevel>('category');
  const [drilldownCategory, setDrilldownCategory] = useState<string | null>(null);
  const [drilldownSubcategory, setDrilldownSubcategory] = useState<string | null>(null);
  
  const [hiddenCategories, setHiddenCategories] = useState<Set<string>>(new Set());
  const [hiddenSubcategories, setHiddenSubcategories] = useState<Set<string>>(new Set());
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  // Check if a category has any activities with subcategories
  const hasSubcategories = (category: string): boolean => {
    return activities.some(
      activity => activity.category === category && activity.subcategory
    );
  };

  // Get category-level data
  const getCategoryData = (): ChartData[] => {
    if (!activities || activities.length === 0) return [];

    const categoryTotals: Record<string, number> = {};
    
    activities.forEach(activity => {
      const category = activity.category || categories[0];
      if (!hiddenCategories.has(category)) {
        const duration = activity.duration || 0;
        categoryTotals[category] = (categoryTotals[category] || 0) + duration;
      }
    });

    return Object.entries(categoryTotals).map(([category, minutes]) => {
      const hours = Math.floor(minutes / 60);
      const mins = minutes % 60;
      return {
        name: category.charAt(0).toUpperCase() + category.slice(1),
        value: minutes,
        hours: `${hours}:${mins.toString().padStart(2, '0')}`,
        color: getCategoryColor(category),
        category: category
      };
    });
  };

  // Get subcategory-level data for a specific category
  const getSubcategoryData = (category: string): ChartData[] => {
    if (!activities || activities.length === 0) return [];

    const subcategoryTotals: Record<string, number> = {};
    
    activities
      .filter(activity => activity.category === category && activity.subcategory)
      .forEach(activity => {
        const subcategory = activity.subcategory!;
        if (!hiddenSubcategories.has(subcategory)) {
          const duration = activity.duration || 0;
          subcategoryTotals[subcategory] = (subcategoryTotals[subcategory] || 0) + duration;
        }
      });

    const baseColor = getCategoryColor(category);
    const entries = Object.entries(subcategoryTotals);
    
    return entries.map(([subcategory, minutes], index) => {
      // Create color variations for subcategories
      const hue = parseInt(baseColor.slice(1, 3), 16);
      const sat = parseInt(baseColor.slice(3, 5), 16);
      const light = parseInt(baseColor.slice(5, 7), 16);
      
      const variation = Math.floor((index * 40) % 80) - 40;
      const newLight = Math.max(50, Math.min(200, light + variation));
      const variedColor = `#${hue.toString(16).padStart(2, '0')}${sat.toString(16).padStart(2, '0')}${newLight.toString(16).padStart(2, '0')}`;

      const hours = Math.floor(minutes / 60);
      const mins = minutes % 60;

      return {
        name: subcategory.charAt(0).toUpperCase() + subcategory.slice(1),
        value: minutes,
        hours: `${hours}:${mins.toString().padStart(2, '0')}`,
        color: variedColor,
        subcategory: subcategory
      };
    });
  };

  // Get activity-level data (individual activities)
  const getActivityData = (category: string, subcategory?: string): ChartData[] => {
    if (!activities || activities.length === 0) return [];

    const filteredActivities = activities.filter(activity => {
      if (activity.category !== category) return false;
      if (subcategory && activity.subcategory !== subcategory) return false;
      return true;
    });

    const baseColor = getCategoryColor(category);
    
    return filteredActivities.map((activity, index) => {
      // Create color variations for activities
      const hue = parseInt(baseColor.slice(1, 3), 16);
      const sat = parseInt(baseColor.slice(3, 5), 16);
      const light = parseInt(baseColor.slice(5, 7), 16);
      
      const variation = Math.floor((index * 30) % 100) - 30;
      const newLight = Math.max(50, Math.min(200, light + variation));
      const variedColor = `#${hue.toString(16).padStart(2, '0')}${sat.toString(16).padStart(2, '0')}${newLight.toString(16).padStart(2, '0')}`;

      const minutes = activity.duration || 0;
      const hours = Math.floor(minutes / 60);
      const mins = minutes % 60;

      return {
        name: activity.title,
        value: minutes,
        hours: `${hours}:${mins.toString().padStart(2, '0')}`,
        color: variedColor,
        activityId: activity._id
      };
    });
  };

  // Determine what data to display based on drill level
  const getDisplayData = (): ChartData[] => {
    if (drillLevel === 'category') {
      const categoryData = getCategoryData();
      return categoryData.filter(cat => !hiddenCategories.has(cat.category || ''));
    } else if (drillLevel === 'subcategory' && drilldownCategory) {
      return getSubcategoryData(drilldownCategory);
    } else if (drillLevel === 'activity' && drilldownCategory) {
      return getActivityData(drilldownCategory, drilldownSubcategory || undefined);
    }
    return [];
  };

  const displayData = getDisplayData();

  // Auto-drill logic
  useEffect(() => {
    if (drillLevel === 'category') {
      const categoryData = getCategoryData();
      const visibleCategories = categoryData.filter(cat => !hiddenCategories.has(cat.category || ''));
      
      if (visibleCategories.length === 1) {
        const category = visibleCategories[0].category!;
        setDrilldownCategory(category);
        
        if (hasSubcategories(category)) {
          setDrillLevel('subcategory');
        } else {
          setDrillLevel('activity');
        }
      }
    } else if (drillLevel === 'subcategory' && drilldownCategory) {
      const subcategoryData = getSubcategoryData(drilldownCategory);
      const visibleSubcategories = subcategoryData.filter(sub => !hiddenSubcategories.has(sub.subcategory || ''));
      
      if (visibleSubcategories.length === 1) {
        setDrilldownSubcategory(visibleSubcategories[0].subcategory!);
        setDrillLevel('activity');
      }
    }
  }, [hiddenCategories, hiddenSubcategories, drillLevel, drilldownCategory]);

  // Handle pie slice click
  const handlePieClick = (entry: any) => {
    if (drillLevel === 'activity') {
      // At activity level, don't do anything on click
      return;
    }

    const itemName = entry.name;
    const shouldHide = window.confirm(
      `Do you want to hide "${itemName}" from the pie chart?`
    );

    if (shouldHide) {
      if (drillLevel === 'category') {
        setHiddenCategories(prev => new Set([...prev, entry.category]));
      } else if (drillLevel === 'subcategory') {
        setHiddenSubcategories(prev => new Set([...prev, entry.subcategory]));
      }
      setActiveIndex(null);
    }
  };

  // Toggle category visibility
  const handleToggleCategory = (category: string) => {
    setHiddenCategories(prev => {
      const newSet = new Set(prev);
      if (newSet.has(category)) {
        newSet.delete(category);
      } else {
        newSet.add(category);
      }
      return newSet;
    });
  };

  // Toggle subcategory visibility
  const handleToggleSubcategory = (subcategory: string) => {
    setHiddenSubcategories(prev => {
      const newSet = new Set(prev);
      if (newSet.has(subcategory)) {
        newSet.delete(subcategory);
      } else {
        newSet.add(subcategory);
      }
      return newSet;
    });
  };

  // Navigation handlers
  const handleBackToCategories = () => {
    setDrillLevel('category');
    setDrilldownCategory(null);
    setDrilldownSubcategory(null);
    setHiddenCategories(new Set());
    setHiddenSubcategories(new Set());
    setActiveIndex(null);
  };

  const handleBackToSubcategories = () => {
    setDrillLevel('subcategory');
    setDrilldownSubcategory(null);
  };

  const handleResetAll = () => {
    setDrillLevel('category');
    setDrilldownCategory(null);
    setDrilldownSubcategory(null);
    setHiddenCategories(new Set());
    setHiddenSubcategories(new Set());
    setActiveIndex(null);
  };

  // Custom label for pie slices
  const renderLabel = (props: any) => {
    const { percent, value } = props;
    if (percent < 0.05) return null;
    const totalMinutes = value;
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    const timeStr = `${hours}:${minutes.toString().padStart(2, '0')}`;
    return `${(percent * 100).toFixed(0)}% (${timeStr})`;
  };

  // Active shape for hover effect
  const renderActiveShape = (props: any) => {
    const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill } = props;
    
    return (
      <g>
        <Sector
          cx={cx}
          cy={cy}
          innerRadius={innerRadius}
          outerRadius={outerRadius + 8}
          startAngle={startAngle}
          endAngle={endAngle}
          fill={fill}
        />
      </g>
    );
  };

  // Get breadcrumb path
  const getBreadcrumb = () => {
    const parts = [];
    if (drillLevel !== 'category' && drilldownCategory) {
      parts.push(drilldownCategory.charAt(0).toUpperCase() + drilldownCategory.slice(1));
    }
    if (drillLevel === 'activity' && drilldownSubcategory) {
      parts.push(drilldownSubcategory.charAt(0).toUpperCase() + drilldownSubcategory.slice(1));
    }
    return parts.join(' → ');
  };

  if (displayData.length === 0 && drillLevel === 'category') {
    return (
      <div className="bg-gray-50 rounded-lg p-6">
        <div className="flex items-center justify-center h-[400px] text-gray-500">
          No activity data to display
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 rounded-lg p-6">
      {/* Header with navigation */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            {drillLevel !== 'category' && (
              <button
                onClick={drillLevel === 'activity' && drilldownSubcategory 
                  ? handleBackToSubcategories 
                  : handleBackToCategories}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded-lg transition-colors"
                title={drillLevel === 'activity' && drilldownSubcategory ? 'Back to Subcategories' : 'Back to Categories'}
              >
                <ArrowLeft size={20} />
              </button>
            )}
            <div>
              <h3 className="text-lg font-semibold text-gray-700">
                {drillLevel === 'category' && 'Category Distribution'}
                {drillLevel === 'subcategory' && 'Subcategory Breakdown'}
                {drillLevel === 'activity' && 'Activity Breakdown'}
              </h3>
              {drillLevel !== 'category' && (
                <p className="text-sm text-gray-600 mt-1">
                  {getBreadcrumb()}
                </p>
              )}
            </div>
          </div>
          {drillLevel === 'activity' && (
            <button
              onClick={handleResetAll}
              className="px-3 py-1.5 text-sm bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors"
            >
              Reset All
            </button>
          )}
        </div>
      </div>

      {/* Pie Chart */}
      {displayData.length > 0 ? (
        <>
          <ResponsiveContainer width="100%" height={350}>
            <PieChart>
              <Pie
                data={displayData}
                cx="50%"
                cy="45%"
                label={renderLabel}
                labelLine={false}
                outerRadius={90}
                fill="#8884d8"
                dataKey="value"
                onClick={handlePieClick}
                onMouseEnter={(_, index) => setActiveIndex(index)}
                onMouseLeave={() => setActiveIndex(null)}
                {...(activeIndex !== null && { activeShape: renderActiveShape })}
                style={{ cursor: drillLevel === 'activity' ? 'default' : 'pointer', fontSize: '13.5px' }}
              >
                {displayData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value: any) => {
                  const totalMinutes = value;
                  const hours = Math.floor(totalMinutes / 60);
                  const minutes = totalMinutes % 60;
                  return `${hours}:${minutes.toString().padStart(2, '0')}`;
                }}
              />
            </PieChart>
          </ResponsiveContainer>

          {/* Legend */}
          <div className="mt-4 grid grid-cols-2 gap-2">
            {displayData.map((entry, index) => {
              const displayName = drillLevel === 'activity' 
                ? entry.name.split(' ').slice(0, 3).join(' ')
                : entry.name;
              
              return (
                <div key={index} className="flex items-center gap-2 text-sm">
                  <div 
                    className="w-3 h-3 rounded-sm flex-shrink-0"
                    style={{ backgroundColor: entry.color }}
                  />
                  <span className="text-gray-700 truncate">
                    {displayName}
                  </span>
                </div>
              );
            })}
          </div>
        </>
      ) : (
        <div className="flex items-center justify-center h-[350px] text-gray-500">
          No data to display at this level
        </div>
      )}

      {/* Info messages */}
      {drillLevel === 'subcategory' && (
        <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-700">
          📊 Showing subcategories within {drilldownCategory}. Click a slice to hide it.
        </div>
      )}
      
      {drillLevel === 'activity' && (
        <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-700">
          📊 Showing individual activities. Use navigation buttons to go back.
        </div>
      )}

      {drillLevel === 'category' && displayData.length > 1 && (
        <div className="mt-4 text-center text-sm text-gray-600">
          💡 Click on any category slice to hide it from the chart
        </div>
      )}

      {/* Category visibility controls */}
      {drillLevel === 'category' && getCategoryData().length > 0 && (
        <div className="mt-6 pt-4 border-t border-gray-200">
          <h4 className="text-sm font-medium text-gray-700 mb-3">Category Visibility</h4>
          <div className="flex flex-wrap gap-2">
            {getCategoryData().map((cat) => {
              const isHidden = hiddenCategories.has(cat.category || '');
              return (
                <button
                  key={cat.category}
                  onClick={() => handleToggleCategory(cat.category || '')}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                    isHidden
                      ? 'bg-gray-200 text-gray-500 hover:bg-gray-300'
                      : 'text-white hover:opacity-90'
                  }`}
                  style={{
                    backgroundColor: isHidden ? undefined : cat.color
                  }}
                >
                  {isHidden ? <EyeOff size={14} /> : <Eye size={14} />}
                  <span>{cat.name}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Subcategory visibility controls */}
      {drillLevel === 'subcategory' && drilldownCategory && (
        <div className="mt-6 pt-4 border-t border-gray-200">
          <h4 className="text-sm font-medium text-gray-700 mb-3">Subcategory Visibility</h4>
          <div className="flex flex-wrap gap-2">
            {getSubcategoryData(drilldownCategory).map((sub) => {
              const isHidden = hiddenSubcategories.has(sub.subcategory || '');
              return (
                <button
                  key={sub.subcategory}
                  onClick={() => handleToggleSubcategory(sub.subcategory || '')}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                    isHidden
                      ? 'bg-gray-200 text-gray-500 hover:bg-gray-300'
                      : 'text-white hover:opacity-90'
                  }`}
                  style={{
                    backgroundColor: isHidden ? undefined : sub.color
                  }}
                >
                  {isHidden ? <EyeOff size={14} /> : <Eye size={14} />}
                  <span>{sub.name}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default InteractivePieChart;