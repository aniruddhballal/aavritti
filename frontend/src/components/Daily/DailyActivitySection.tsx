import ActivityList from './ActivityList';

interface __DailyActivitySectionProps__ {
  activities: any[];
  date: string; // Add date prop
  leftColumnHeight: number;
  isDarkMode: boolean;
  onActivityAdded: () => void;
  onEditActivity: (activity: any) => void;
}

const DailyActivitySection = ({ 
  activities, 
  date, // Destructure the new prop
  leftColumnHeight,
  isDarkMode,
  onActivityAdded, 
  onEditActivity
}: __DailyActivitySectionProps__) => (
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
      date={date} // Pass date to ActivityList
      onActivityAdded={onActivityAdded}
      onEditActivity={onEditActivity}
    />
  </div>
);

export default DailyActivitySection;