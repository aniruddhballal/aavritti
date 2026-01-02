import { useEffect, useRef } from 'react';
import InteractivePieChart from './InteractivePieChart/InteractivePieChart';

interface DailyPieSectionProps {
  activities: any[] | undefined;
  isDarkMode: boolean;
  onHeightChange: (height: number) => void;
}

const DailyPieSection = ({ 
  activities, 
  isDarkMode, 
  onHeightChange 
}: DailyPieSectionProps) => {
  const leftColumnRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const updateHeight = () => {
      if (leftColumnRef.current) {
        const height = leftColumnRef.current.offsetHeight;
        onHeightChange(height);
      }
    };

    updateHeight();
    
    const resizeObserver = new ResizeObserver(updateHeight);
    if (leftColumnRef.current) {
      resizeObserver.observe(leftColumnRef.current);
    }

    window.addEventListener('resize', updateHeight);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener('resize', updateHeight);
    };
  }, [activities, onHeightChange]);

  return (
    <div>
      {activities && activities.length > 0 ? (
        <div ref={leftColumnRef}>
          <InteractivePieChart 
            activities={activities} 
          />
        </div>
      ) : (
        <div 
          ref={leftColumnRef} 
          className={`rounded-lg p-6 ${
            isDarkMode ? 'bg-gray-800' : 'bg-gray-50'
          }`}
        >
          <div className={`flex items-center justify-center h-[400px] ${
            isDarkMode ? 'text-gray-400' : 'text-gray-500'
          }`}>
            No activity data to display
          </div>
        </div>
      )}
    </div>
  );
};

export default DailyPieSection;