import type { ChartData, DrillLevel } from './interactivePieChart.utils';

interface ChartLegendProps {
  data: ChartData[];
  drillLevel: DrillLevel;
  selectedIndex: number | null;
  activeIndex: number | null;
  isDarkMode: boolean;
  onMouseEnter: (index: number) => void;
  onMouseLeave: () => void;
}

export const ChartLegend = ({
  data,
  drillLevel,
  selectedIndex,
  activeIndex,
  isDarkMode,
  onMouseEnter,
  onMouseLeave,
}: ChartLegendProps) => {
  const totalValue = data.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className="w-full">
      <div className="grid grid-cols-2 gap-x-8 gap-y-2.5">
        {data.map((entry, index) => {
          const displayName = drillLevel === 'activity' 
            ? entry.name.split(' ').slice(0, 3).join(' ')
            : entry.name;
          
          const percentage = ((entry.value / totalValue) * 100).toFixed(1);
          const isActive = selectedIndex === index || activeIndex === index;
          
          return (
            <div 
              key={index} 
              className={`flex items-center gap-3 text-sm p-2.5 rounded-lg transition-all duration-200 cursor-default ${
                isActive 
                  ? isDarkMode
                    ? 'bg-gray-700 scale-105 shadow-sm'
                    : 'bg-gray-100 scale-105 shadow-sm'
                  : isDarkMode
                    ? 'hover:bg-gray-700/50'
                    : 'hover:bg-gray-50'
              }`}
              onMouseEnter={() => onMouseEnter(index)}
              onMouseLeave={() => selectedIndex === null && onMouseLeave()}
            >
              <div 
                className={`w-3.5 h-3.5 rounded flex-shrink-0 transition-all duration-200 ${
                  isActive ? 'scale-125 shadow-md' : ''
                }`}
                style={{ backgroundColor: entry.color }}
              />
              <span className={`truncate font-medium transition-all duration-200 ${
                isActive 
                  ? isDarkMode ? 'font-semibold text-gray-100' : 'font-semibold text-gray-700'
                  : isDarkMode ? 'text-gray-300' : 'text-gray-700'
              }`}>
                {displayName}
              </span>
              <span className={`ml-auto text-xs font-semibold ${
                isDarkMode ? 'text-gray-400' : 'text-gray-500'
              }`}>
                {percentage}%
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};