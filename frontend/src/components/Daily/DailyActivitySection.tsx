import ActivityList from './ActivityList';

interface DailyActivitySectionProps {
  activities: any[];
  isToday: boolean;
  leftColumnHeight: number;
  isDarkMode: boolean;
  onActivityAdded: () => void;
  onEditActivity: (activity: any) => void;
}

const DailyActivitySection = ({ 
  activities, 
  isToday, 
  leftColumnHeight,
  isDarkMode,
  onActivityAdded, 
  onEditActivity
}: DailyActivitySectionProps) => (
  <div 
    className={`rounded-lg shadow-lg p-6 lg:p-8 flex flex-col overflow-hidden transition-colors ${
      isDarkMode ? 'bg-gray-800' : 'bg-white'
    }`}
    style={{
      maxHeight: leftColumnHeight > 0 ? `${leftColumnHeight}px` : 'calc(100vh + 100px)'
    }}
  >
    <ActivityList
      activities={activities}
      isToday={isToday}
      onActivityAdded={onActivityAdded}
      onEditActivity={onEditActivity}
    />
  </div>
);

export default DailyActivitySection;
