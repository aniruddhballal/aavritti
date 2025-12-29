// (Stats cards + pie chart section)
// a component that renders the statistics cards (total activities and total time) along with the interactive pie chart section.

import type { Activity } from '../../types/activity';
import InteractivePieChart from '../InteractivePieChart';

interface DailyStatsProps {
  totalActivities: number;
  totalTime: string;
  activities: Activity[];
  categories: string[];
}

const DailyStats = ({ totalActivities, totalTime, activities, categories }: DailyStatsProps) => {
  return (
    <div className="mb-8 grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Stats Section */}
      <div className="space-y-4">
        <div className="bg-blue-50 rounded-lg p-6">
          <div className="text-3xl font-bold text-blue-600">{totalActivities}</div>
          <div className="text-sm text-blue-700">Total Activities</div>
        </div>
        <div className="bg-green-50 rounded-lg p-6">
          <div className="text-3xl font-bold text-green-600">{totalTime}</div>
          <div className="text-sm text-green-700">Total Time Recorded</div>
        </div>
      </div>

      {/* Interactive Pie Chart Section */}
      <div>
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
    </div>
  );
};

export default DailyStats;