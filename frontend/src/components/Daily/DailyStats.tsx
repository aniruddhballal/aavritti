// (Stats cards + pie chart section)
// a component that renders the interactive pie chart section

import type { Activity } from '../../types/activity';
import InteractivePieChart from '../InteractivePieChart';

interface DailyStatsProps {
  activities: Activity[];
  categories: string[];
}

const DailyStats = ({ activities, categories }: DailyStatsProps) => {
  return (
    <div className="mb-8">
      {/* Interactive Pie Chart Section - Now full width */}
      {activities && activities.length > 0 ? (
        <InteractivePieChart 
          activities={activities} 
          categories={categories}
        />
      ) : (
        <div className="bg-gray-50 rounded-lg p-6">
          <div className="flex items-center justify-center h-[400px] text-gray-500">
            No activity data to display
          </div>
        </div>
      )}
    </div>
  );
};

export default DailyStats;