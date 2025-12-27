import { useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, Sector } from 'recharts';
import { Eye, EyeOff } from 'lucide-react';
import type { Activity } from '../types/activity';
import { getCategoryColor } from '../utils/categoryColors';

interface InteractivePieChartProps {
  activities: Activity[];
  categories: string[];
}

interface ChartData {
  name: string;
  value: number;
  hours: string;
  color: string;
  category?: string;
  subcategory?: string;
  [key: string]: any; // Add index signature for Recharts compatibility
}

const InteractivePieChart = ({ activities, categories }: InteractivePieChartProps) => {
  const [hiddenCategories, setHiddenCategories] = useState<Set<string>>(new Set());
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [showingSubcategories, setShowingSubcategories] = useState(false);
  const [drilldownCategory, setDrilldownCategory] = useState<string | null>(null);

  // Get category data excluding hidden categories
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

    return Object.entries(categoryTotals).map(([category, minutes]) => ({
      name: category.charAt(0).toUpperCase() + category.slice(1),
      value: minutes,
      hours: (minutes / 60).toFixed(1),
      color: getCategoryColor(category),
      category: category
    }));
  };

  // Get subcategory data for a specific category
  const getSubcategoryData = (category: string): ChartData[] => {
    if (!activities || activities.length === 0) return [];

    const subcategoryTotals: Record<string, number> = {};
    
    activities
      .filter(activity => activity.category === category)
      .forEach(activity => {
        // Use title as subcategory if no explicit subcategory field exists
        const subcategory = activity.title || 'Untitled';
        const duration = activity.duration || 0;
        subcategoryTotals[subcategory] = (subcategoryTotals[subcategory] || 0) + duration;
      });

    // Generate colors for subcategories (variations of the main category color)
    const baseColor = getCategoryColor(category);
    const entries = Object.entries(subcategoryTotals);
    
    return entries.map(([subcategory, minutes], index) => {
      // Create color variations
      const hue = parseInt(baseColor.slice(1, 3), 16);
      const sat = parseInt(baseColor.slice(3, 5), 16);
      const light = parseInt(baseColor.slice(5, 7), 16);
      
      // Vary the lightness for different subcategories
      const variation = Math.floor((index * 30) % 100) - 30;
      const newLight = Math.max(50, Math.min(200, light + variation));
      const variedColor = `#${hue.toString(16).padStart(2, '0')}${sat.toString(16).padStart(2, '0')}${newLight.toString(16).padStart(2, '0')}`;

      return {
        name: subcategory,
        value: minutes,
        hours: (minutes / 60).toFixed(1),
        color: variedColor,
        subcategory: subcategory
      };
    });
  };

  const categoryData = getCategoryData();
  const visibleCategories = categoryData.filter(cat => !hiddenCategories.has(cat.category || ''));

  // Check if we should show subcategories (only one category left)
  const shouldShowSubcategories = visibleCategories.length === 1;
  
  // Get the data to display (either categories or subcategories)
  const displayData: ChartData[] = shouldShowSubcategories && visibleCategories.length > 0
    ? getSubcategoryData(visibleCategories[0].category || '')
    : visibleCategories;

  // Update drill-down state when switching to subcategories
  if (shouldShowSubcategories && !showingSubcategories && visibleCategories.length > 0) {
    setShowingSubcategories(true);
    setDrilldownCategory(visibleCategories[0].category || null);
  } else if (!shouldShowSubcategories && showingSubcategories) {
    setShowingSubcategories(false);
    setDrilldownCategory(null);
  }

  const handlePieClick = (entry: any) => {
    if (showingSubcategories) {
      // If showing subcategories, don't do anything on click
      return;
    }

    // Show confirmation dialog
    const categoryName = entry.name;
    const shouldHide = window.confirm(
      `Do you want to hide "${categoryName}" from the pie chart?\n\nThis will exclude all ${categoryName} activities from the visualization.`
    );

    if (shouldHide) {
      setHiddenCategories(prev => new Set([...prev, entry.category]));
      setActiveIndex(null);
    }
  };

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

  const handleResetAll = () => {
    setHiddenCategories(new Set());
    setShowingSubcategories(false);
    setDrilldownCategory(null);
    setActiveIndex(null);
  };

  // Custom label for pie slices
  const renderLabel = ({ percent }: any) => {
    if (percent < 0.05) return ''; // Don't show label for very small slices
    return `${(percent * 100).toFixed(0)}%`;
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

  if (displayData.length === 0) {
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
      {/* Header with mode indicator */}
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-700">
            {showingSubcategories ? 'Activity Breakdown' : 'Category Distribution'}
          </h3>
          {showingSubcategories && drilldownCategory && (
            <p className="text-sm text-gray-600 mt-1">
              Showing activities in: {drilldownCategory.charAt(0).toUpperCase() + drilldownCategory.slice(1)}
            </p>
          )}
        </div>
        {hiddenCategories.size > 0 && (
          <button
            onClick={handleResetAll}
            className="px-3 py-1.5 text-sm bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors"
          >
            Reset All
          </button>
        )}
      </div>

      {/* Pie Chart */}
      <ResponsiveContainer width="100%" height={350}>
        <PieChart>
          <Pie
            data={displayData}
            cx="50%"
            cy="45%"
            labelLine={false}
            label={renderLabel}
            outerRadius={90}
            fill="#8884d8"
            dataKey="value"
            onClick={handlePieClick}
            onMouseEnter={(_, index) => setActiveIndex(index)}
            onMouseLeave={() => setActiveIndex(null)}
            {...(activeIndex !== null && { activeShape: renderActiveShape })}
            style={{ cursor: showingSubcategories ? 'default' : 'pointer' }}
          >
            {displayData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip 
            formatter={(value: any) => `${(value / 60).toFixed(1)} hours`}
          />
          <Legend 
            verticalAlign="bottom" 
            height={60}
            formatter={(value, entry: any) => `${value} (${entry.payload.hours}h)`}
          />
        </PieChart>
      </ResponsiveContainer>

      {/* Click instruction */}
      {!showingSubcategories && categoryData.length > 1 && (
        <div className="mt-4 text-center text-sm text-gray-600">
          💡 Click on any category slice to hide it from the chart
        </div>
      )}

      {/* Category toggle controls */}
      {!showingSubcategories && categoryData.length > 0 && (
        <div className="mt-6 pt-4 border-t border-gray-200">
          <h4 className="text-sm font-medium text-gray-700 mb-3">Category Visibility</h4>
          <div className="flex flex-wrap gap-2">
            {categoryData.map((cat) => {
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

      {/* Subcategory info */}
      {showingSubcategories && (
        <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-700">
          📊 Showing individual activities within this category. Hide more categories to drill down further.
        </div>
      )}
    </div>
  );
};

export default InteractivePieChart;