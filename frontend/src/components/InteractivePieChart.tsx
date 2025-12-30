import { useState, useRef } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Sector } from 'recharts';
import { Eye, EyeOff, ArrowLeft, ZoomIn, EyeOff as HideIcon, RotateCcw, Sparkles } from 'lucide-react';
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
  
  // Selection and popover state
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [popoverPosition, setPopoverPosition] = useState<{ x: number; y: number } | null>(null);
  
  // Touch tracking
  const touchStartTime = useRef<number>(0);
  const longPressTimeout = useRef<number | null>(null);
  const isTouchDevice = useRef<boolean>(false);
  const [isAnimating, setIsAnimating] = useState(false);

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
        hours: `${hours}h ${mins}m`,
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
        hours: `${hours}h ${mins}m`,
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
      const hue = parseInt(baseColor.slice(1, 3), 16);
      const sat = parseInt(baseColor.slice(3, 5), 16);
      const light = parseInt(baseColor.slice(5, 7), 16);
      
      const variation = Math.floor((index * 30) % 100) - 30;
      const newLight = Math.max(50, Math.min(200, light + variation));
      const variedColor = `#${hue.toString(16).padStart(2, '0')}${sat.toString(16).padStart(2, '0')}${newLight.toString(16).padStart(2, '0')}`;

      const minutes = activity.duration || 0;
      const hours = Math.floor(minutes / 60);

      return {
        name: activity.title,
        value: minutes,
        hours: `${hours}h ${minutes}m`,
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

  // Explicit zoom in action
  const handleZoomIn = (entry: ChartData) => {
    setIsAnimating(true);
    setTimeout(() => setIsAnimating(false), 500);
    
    if (drillLevel === 'category') {
      const category = entry.category!;
      setDrilldownCategory(category);
      
      if (hasSubcategories(category)) {
        setDrillLevel('subcategory');
      } else {
        setDrillLevel('activity');
      }
    } else if (drillLevel === 'subcategory') {
      setDrilldownSubcategory(entry.subcategory!);
      setDrillLevel('activity');
    }
    
    closePopover();
  };

  // Explicit hide action
  const handleHideItem = (entry: ChartData) => {
    // Prevent hiding if it's the only visible slice
    if (displayData.length === 1) {
      closePopover();
      return;
    }
    
    if (drillLevel === 'category') {
      setHiddenCategories(prev => new Set([...prev, entry.category!]));
    } else if (drillLevel === 'subcategory') {
      setHiddenSubcategories(prev => new Set([...prev, entry.subcategory!]));
    }
    
    closePopover();
  };

  // Close popover
  const closePopover = () => {
    setSelectedIndex(null);
    setPopoverPosition(null);
  };

  // Handle touch start
  const handleTouchStart = (entry: ChartData) => {
    isTouchDevice.current = true;
    touchStartTime.current = Date.now();
    
    // Set up long press detection
    longPressTimeout.current = setTimeout(() => {
      // Long press detected - hide item
      if (drillLevel !== 'activity') {
        handleHideItem(entry);
      }
    }, 500); // 500ms for long press
  };

  // Handle touch end
  const handleTouchEnd = (entry: ChartData) => {
    if (longPressTimeout.current) {
      clearTimeout(longPressTimeout.current);
      longPressTimeout.current = null;
    }
    
    const touchDuration = Date.now() - touchStartTime.current;
    
    // Short tap - zoom in
    if (touchDuration < 500 && drillLevel !== 'activity') {
      handleZoomIn(entry);
    }
  };

  // Handle mouse click (desktop)
  const handlePieClick = (_entry: any, index: number, event: any) => {
    // If it's a touch device, ignore mouse events (they fire after touch events)
    if (isTouchDevice.current) {
      return;
    }
    
    if (drillLevel === 'activity') {
      return;
    }

    // Get the click position for popover
    const svg = event.currentTarget.closest('svg');
    const rect = svg.getBoundingClientRect();
    
    // If clicking the same slice, close popover
    if (selectedIndex === index) {
      closePopover();
      return;
    }
    
    // Set selected and show popover
    setSelectedIndex(index);
    setPopoverPosition({
      x: event.clientX - rect.left,
      y: event.clientY - rect.top
    });
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
    setIsAnimating(true);
    setTimeout(() => setIsAnimating(false), 500);
    
    setDrillLevel('category');
    setDrilldownCategory(null);
    setDrilldownSubcategory(null);
    setHiddenCategories(new Set());
    setHiddenSubcategories(new Set());
    setActiveIndex(null);
    closePopover();
  };

  const handleBackToSubcategories = () => {
    setIsAnimating(true);
    setTimeout(() => setIsAnimating(false), 500);
    
    setDrillLevel('subcategory');
    setDrilldownSubcategory(null);
    setHiddenSubcategories(new Set());
    closePopover();
  };

  // Custom label for pie slices
  const renderLabel = (props: any) => {
    const { percent, value } = props;
    if (percent < 0.05) return null;
    const totalMinutes = value;
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return `${hours}h ${minutes}m`;
  };

  // Active shape for hover effect with enhanced styling
  const renderActiveShape = (props: any) => {
    const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill } = props;
    
    return (
      <g>
        <Sector
          cx={cx}
          cy={cy}
          innerRadius={innerRadius}
          outerRadius={outerRadius + 12}
          startAngle={startAngle}
          endAngle={endAngle}
          fill={fill}
          style={{ 
            filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.15))',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
          }}
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
      <div className="bg-gradient-to-br from-white to-gray-50/50 rounded-2xl pt-6 pb-6 px-6 relative border border-gray-200/50 shadow-lg">
        {/* Header with reset button */}
        <div className="mb-6 flex items-center justify-between">
          <h3 className="text-lg font-bold text-gray-800 tracking-tight">
            Category Distribution
          </h3>
          <button
            onClick={handleBackToCategories}
            className="group p-2 text-gray-500 hover:text-gray-900 transition-all duration-300 hover:scale-105 active:scale-95"
            title="Reset to Categories"
          >
            <RotateCcw size={20} className="transition-transform duration-500 group-hover:rotate-[-360deg]" />
          </button>
        </div>
        
        <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-8 border border-gray-200/50 shadow-sm">
          <div className="flex items-center justify-center h-[400px] text-gray-400">
            <div className="text-center">
              <Sparkles className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p className="text-sm">No activity data to display</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-white to-gray-50/50 rounded-2xl pt-6 pb-6 px-6 relative border border-gray-200/50 shadow-lg transition-all duration-300 hover:shadow-xl">
      {/* Header with navigation */}
      <div className="mb-6 space-y-3">
        <div className="flex items-center gap-3 w-full">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-3">
              {drillLevel !== 'category' && (
                <button
                  onClick={drillLevel === 'activity' && drilldownSubcategory 
                    ? handleBackToSubcategories 
                    : handleBackToCategories}
                  className="group p-2.5 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
                  title={drillLevel === 'activity' && drilldownSubcategory ? 'Back to Subcategories' : 'Back to Categories'}
                >
                  <ArrowLeft size={20} className="transition-transform duration-200 group-hover:-translate-x-0.5" />
                </button>
              )}
            </div>
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-gray-800 tracking-tight">
              {drillLevel === 'category' && 'Category Distribution'}
              {drillLevel === 'subcategory' && 'Subcategory Breakdown'}
              {drillLevel === 'activity' && 'Activity Breakdown'}
            </h3>
            <div className="min-h-[24px] mt-1">
              {drillLevel !== 'category' ? (
                <p className="text-sm text-gray-500 font-medium">
                  {getBreadcrumb()}
                </p>
              ) : (
                (() => {
                  if (hiddenCategories.size === 0) return null;
                  
                  const allCategories = Array.from(new Set(activities.map(a => a.category || categories[0])));
                  const visibleCategories = allCategories.filter(cat => !hiddenCategories.has(cat));
                  const hiddenCategoryList = Array.from(hiddenCategories);
                  
                  const showHidden = hiddenCategoryList.length <= visibleCategories.length;
                  const list = showHidden ? hiddenCategoryList : visibleCategories;
                  const label = showHidden ? 'Hidden' : 'Active';
                  
                  return (
                    <p className="text-sm text-gray-500 font-medium">
                      {label}: {list.map(cat => cat.charAt(0).toUpperCase() + cat.slice(1)).join(', ')}
                    </p>
                  );
                })()
              )}
            </div>
          </div>
          <div className="ml-auto self-start">
            <button
              onClick={handleBackToCategories}
              className="group pt-0 pr-2 text-gray-500 hover:text-gray-900 transition-all duration-300 hover:scale-105 active:scale-95"
              title="Reset to Categories"
            >
              <RotateCcw size={20} className="transition-transform duration-500 group-hover:rotate-[-360deg]" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content: Pie Chart + Legend Side by Side on Desktop */}
      {displayData.length > 0 ? (
        <div className={`flex flex-col gap-6 items-start transition-all duration-500 ${isAnimating ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}>
          {/* Pie Chart */}
          <div className="relative w-full h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={displayData}
                  cx="50%"
                  cy="50%"
                  label={renderLabel}
                  labelLine={false}
                  outerRadius={120}
                  fill="#8884d8"
                  dataKey="value"
                  onClick={(entry, index, event) => handlePieClick(entry, index, event)}
                  onTouchStart={handleTouchStart}
                  onTouchEnd={handleTouchEnd}
                  onMouseEnter={(_, index) => {
                    if (selectedIndex !== index) {
                      setActiveIndex(index);
                    }
                  }}
                  onMouseLeave={() => {
                    if (selectedIndex === null) {
                      setActiveIndex(null);
                    }
                  }}
                  {...(selectedIndex !== null ? { activeIndex: selectedIndex, activeShape: renderActiveShape } : activeIndex !== null ? { activeIndex: activeIndex, activeShape: renderActiveShape } : {})}
                  style={{ cursor: drillLevel === 'activity' ? 'default' : 'pointer', fontSize: '13.5px' }}
                  animationBegin={0}
                  animationDuration={500}
                  animationEasing="ease-out"
                >
                  {displayData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.color}
                      style={{ 
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        filter: selectedIndex === index || activeIndex === index 
                          ? 'brightness(1.1)' 
                          : 'brightness(1)'
                      }}
                    />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value: any) => {
                    const totalMinutes = value;
                    const hours = Math.floor(totalMinutes / 60);
                    const minutes = totalMinutes % 60;
                    return `${hours}h ${minutes}m`;
                  }}
                  contentStyle={{
                    backgroundColor: 'rgba(255, 255, 255, 0.98)',
                    border: '1px solid rgba(229, 231, 235, 0.8)',
                    borderRadius: '12px',
                    padding: '8px 12px',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                    fontSize: '13px',
                    fontWeight: '500'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>

            {/* Contextual Popover */}
            {selectedIndex !== null && popoverPosition && drillLevel !== 'activity' && (
              <>
                {/* Backdrop to close popover */}
                <div 
                  className="fixed inset-0 z-10"
                  onClick={closePopover}
                />
                
                {/* Popover */}
                <div 
                  className="absolute z-20 bg-white/95 backdrop-blur-sm rounded-xl shadow-2xl border border-gray-200/80 py-1.5 min-w-[150px] animate-in fade-in zoom-in-95 duration-200"
                  style={{
                    left: `${popoverPosition.x}px`,
                    top: `${popoverPosition.y}px`,
                    transform: 'translate(-50%, -100%) translateY(-12px)'
                  }}
                >
                  <button
                    onClick={() => handleZoomIn(displayData[selectedIndex])}
                    className="w-full px-4 py-2.5 text-left text-sm font-medium text-gray-700 hover:bg-gray-100 flex items-center gap-2.5 transition-all duration-150 rounded-lg mx-1 hover:scale-[1.02]"
                  >
                    <ZoomIn size={16} className="text-gray-500" />
                    <span>Zoom in</span>
                  </button>
                  {displayData.length > 1 && (
                    <button
                      onClick={() => handleHideItem(displayData[selectedIndex])}
                      className="w-full px-4 py-2.5 text-left text-sm font-medium text-gray-700 hover:bg-gray-100 flex items-center gap-2.5 transition-all duration-150 rounded-lg mx-1 hover:scale-[1.02]"
                    >
                      <HideIcon size={16} className="text-gray-500" />
                      <span>Hide</span>
                    </button>
                  )}
                </div>
              </>
            )}
          </div>

          {/* Legend - Side by side on desktop, below on mobile */}
          <div className="w-full">
            <div className="grid grid-cols-2 gap-x-8 gap-y-2.5">
              {displayData.map((entry, index) => {
                const displayName = drillLevel === 'activity' 
                  ? entry.name.split(' ').slice(0, 3).join(' ')
                  : entry.name;
                
                const totalValue = displayData.reduce((sum, item) => sum + item.value, 0);
                const percentage = ((entry.value / totalValue) * 100).toFixed(1);
                const isActive = selectedIndex === index || activeIndex === index;
                
                return (
                  <div 
                    key={index} 
                    className={`flex items-center gap-3 text-sm p-2.5 rounded-lg transition-all duration-200 cursor-default ${
                      isActive ? 'bg-gray-100 scale-105 shadow-sm' : 'hover:bg-gray-50'
                    }`}
                    onMouseEnter={() => setActiveIndex(index)}
                    onMouseLeave={() => selectedIndex === null && setActiveIndex(null)}
                  >
                    <div 
                      className={`w-3.5 h-3.5 rounded flex-shrink-0 transition-all duration-200 ${
                        isActive ? 'scale-125 shadow-md' : ''
                      }`}
                      style={{ backgroundColor: entry.color }}
                    />
                    <span className={`text-gray-700 truncate font-medium transition-all duration-200 ${
                      isActive ? 'font-semibold' : ''
                    }`}>
                      {displayName}
                    </span>
                    <span className="ml-auto text-gray-500 text-xs font-semibold">
                      {percentage}%
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-center h-[400px] text-gray-400">
          <div className="text-center">
            <Sparkles className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="text-sm">No data to display at this level</p>
          </div>
        </div>
      )}

      {/* Instructions */}
      {drillLevel !== 'activity' && (
        <div className="mt-6 pt-4 border-t border-gray-200 bg-gradient-to-br from-blue-50 to-indigo-50/30 rounded-xl p-4 relative animate-in slide-in-from-bottom duration-500 border border-blue-100">
          <div className="flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="text-sm font-bold text-blue-900 mb-2">Interactive Chart</h4>
              <div className="text-sm text-blue-800/90 space-y-1.5 leading-relaxed">
                <p>
                  <strong className="font-semibold">Desktop:</strong> Click any slice to see options for zooming in or hiding
                </p>
                <p>
                  <strong className="font-semibold">Touch devices:</strong> Tap to zoom in, long-press to hide
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Category visibility controls */}
      {drillLevel === 'category' && getCategoryData().length > 0 && (
        <div className="mt-6 pt-5 border-t border-gray-200">
          <h4 className="text-sm font-bold text-gray-700 mb-3 tracking-tight">Category Visibility (click/tap to hide)</h4>
          <div className="flex flex-wrap gap-2">
            {getCategoryData().map((cat) => {
              const isHidden = hiddenCategories.has(cat.category || '');
              return (
                <button
                  key={cat.category}
                  onClick={() => handleToggleCategory(cat.category || '')}
                  className={`group flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 hover:scale-105 active:scale-95 ${
                    isHidden
                      ? 'bg-gray-200 text-gray-500 hover:bg-gray-300 shadow-sm'
                      : 'text-white hover:brightness-110 shadow-md hover:shadow-lg'
                  }`}
                  style={{
                    backgroundColor: isHidden ? undefined : cat.color
                  }}
                >
                  {isHidden ? (
                    <EyeOff size={14} className="transition-transform duration-200 group-hover:scale-110" />
                  ) : (
                    <Eye size={14} className="transition-transform duration-200 group-hover:scale-110" />
                  )}
                  <span>{cat.name}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Subcategory visibility controls */}
      {drillLevel === 'subcategory' && drilldownCategory && (
        <div className="mt-6 pt-5 border-t border-gray-200">
          <h4 className="text-sm font-bold text-gray-700 mb-3 tracking-tight">Subcategory Visibility</h4>
          <div className="flex flex-wrap gap-2">
            {getSubcategoryData(drilldownCategory).map((sub) => {
              const isHidden = hiddenSubcategories.has(sub.subcategory || '');
              return (
                <button
                  key={sub.subcategory}
                  onClick={() => handleToggleSubcategory(sub.subcategory || '')}
                  className={`group flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 hover:scale-105 active:scale-95 ${
                    isHidden
                      ? 'bg-gray-200 text-gray-500 hover:bg-gray-300 shadow-sm'
                      : 'text-white hover:brightness-110 shadow-md hover:shadow-lg'
                  }`}
                  style={{
                    backgroundColor: isHidden ? undefined : sub.color
                  }}
                >
                  {isHidden ? (
                    <EyeOff size={14} className="transition-transform duration-200 group-hover:scale-110" />
                  ) : (
                    <Eye size={14} className="transition-transform duration-200 group-hover:scale-110" />
                  )}
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