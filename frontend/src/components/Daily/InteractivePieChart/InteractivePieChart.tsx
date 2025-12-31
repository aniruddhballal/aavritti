import { RotateCcw } from 'lucide-react';
import type { Activity } from '../../../types/activity';
import { useDarkMode } from '../../../contexts/DarkModeContext';
import { usePieDrillDown } from './usePieDrillDown';
import { getDisplayData, getBreadcrumb } from './interactivePieChart.utils';
import { ChartHeader } from './ChartHeader';
import { PieRenderer } from './PieRenderer';
import { ChartPopover } from './ChartPopover';
import { ChartLegend } from './ChartLegend';
import { EmptyState } from './EmptyState';
import { ChartInstructions } from './ChartInstructions';

interface InteractivePieChartProps {
  activities: Activity[];
  categories: string[];
}

const InteractivePieChart = ({ activities, categories }: InteractivePieChartProps) => {
  const { isDarkMode } = useDarkMode();
  
  const {
    drillLevel,
    drilldownCategory,
    drilldownSubcategory,
    hiddenCategories,
    hiddenSubcategories,
    activeIndex,
    selectedIndex,
    popoverPosition,
    isAnimating,
    setActiveIndex,
    handleZoomIn,
    handleHideItem,
    handleTouchStart,
    handleTouchEnd,
    handlePieClick,
    handleBackToCategories,
    handleBackToSubcategories,
    closePopover,
  } = usePieDrillDown(activities);

  const displayData = getDisplayData(
    activities,
    categories,
    drillLevel,
    drilldownCategory,
    drilldownSubcategory,
    hiddenCategories,
    hiddenSubcategories
  );

  const breadcrumb = getBreadcrumb(drillLevel, drilldownCategory, drilldownSubcategory);

  // Empty state for no activities
  if (displayData.length === 0 && drillLevel === 'category') {
    return (
      <div className={`rounded-2xl pt-6 pb-6 px-6 relative border shadow-lg transition-colors ${
        isDarkMode
          ? 'bg-gradient-to-br from-gray-800 to-gray-800/90 border-gray-700'
          : 'bg-gradient-to-br from-white to-gray-50/50 border-gray-200/50'
      }`}>
        <div className="mb-6 flex items-center justify-between">
          <h3 className={`text-lg font-bold tracking-tight ${
            isDarkMode ? 'text-gray-100' : 'text-gray-800'
          }`}>
            Category Distribution
          </h3>
          <button
            onClick={handleBackToCategories}
            className={`group p-2 transition-all duration-300 hover:scale-105 active:scale-95 ${
              isDarkMode ? 'text-gray-400 hover:text-gray-100' : 'text-gray-500 hover:text-gray-900'
            }`}
            title="Reset to Categories"
          >
            <RotateCcw size={20} className="transition-transform duration-500 group-hover:rotate-[-360deg]" />
          </button>
        </div>
        
        <div className={`rounded-2xl p-8 border shadow-sm ${
          isDarkMode
            ? 'bg-gradient-to-br from-gray-700 to-gray-800 border-gray-600/50'
            : 'bg-gradient-to-br from-gray-50 to-gray-100 border-gray-200/50'
        }`}>
          <EmptyState isDarkMode={isDarkMode} message="No activity data to display" />
        </div>
      </div>
    );
  }

  return (
    <div className={`rounded-2xl pt-6 pb-6 px-6 relative border shadow-lg transition-all duration-300 hover:shadow-xl ${
      isDarkMode
        ? 'bg-gradient-to-br from-gray-800 to-gray-800/90 border-gray-700'
        : 'bg-gradient-to-br from-white to-gray-50/50 border-gray-200/50'
    }`}>
      <ChartHeader
        drillLevel={drillLevel}
        drilldownCategory={drilldownCategory}
        drilldownSubcategory={drilldownSubcategory}
        breadcrumb={breadcrumb}
        hiddenCategories={hiddenCategories}
        activities={activities}
        categories={categories}
        isDarkMode={isDarkMode}
        onBackToCategories={handleBackToCategories}
        onBackToSubcategories={handleBackToSubcategories}
      />

      {displayData.length > 0 ? (
        <div className={`flex flex-col gap-6 items-start transition-all duration-500 ${isAnimating ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}>
          <PieRenderer
            data={displayData}
            drillLevel={drillLevel}
            selectedIndex={selectedIndex}
            activeIndex={activeIndex}
            isDarkMode={isDarkMode}
            onPieClick={handlePieClick}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
            onMouseEnter={(index) => setActiveIndex(index)}
            onMouseLeave={() => {
              if (selectedIndex === null) {
                setActiveIndex(null);
              }
            }}
          />

          {selectedIndex !== null && popoverPosition && drillLevel !== 'activity' && (
            <ChartPopover
              position={popoverPosition}
              entry={displayData[selectedIndex]}
              canHide={displayData.length > 1}
              isDarkMode={isDarkMode}
              onZoomIn={() => handleZoomIn(displayData[selectedIndex])}
              onHide={() => handleHideItem(displayData[selectedIndex], displayData.length)}
              onClose={closePopover}
            />
          )}

          <ChartLegend
            data={displayData}
            drillLevel={drillLevel}
            selectedIndex={selectedIndex}
            activeIndex={activeIndex}
            isDarkMode={isDarkMode}
            onMouseEnter={(index) => setActiveIndex(index)}
            onMouseLeave={() => selectedIndex === null && setActiveIndex(null)}
          />
        </div>
      ) : (
        <EmptyState isDarkMode={isDarkMode} message="No data to display at this level" />
      )}

      {drillLevel !== 'activity' && <ChartInstructions isDarkMode={isDarkMode} />}
    </div>
  );
};

export default InteractivePieChart;