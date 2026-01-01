import { useState, useEffect } from 'react';
import { TrendingUp } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, Cell } from 'recharts';
import { api } from '../../services/api';
import { formatDateForRoute } from './dateUtils';
import { getCategoryColor } from '../../utils/categoryColors';

interface ActivityTrendsProps {
  isDarkMode: boolean;
}

interface DayData {
  date: string;
  day: string;
  hours: number;
  fullDate: string;
}

interface Activity {
  category: string;
  duration: number;
}

interface ActivityResponse {
  date: string;
  activities: Activity[];
  totalActivities: number;
  totalDuration: number;
}

const CATEGORIES = [
  { value: 'meals', label: 'Meals' },
  { value: 'sleep', label: 'Sleep' },
  { value: 'japa', label: 'Japa' },
  { value: 'exercise', label: 'Exercise' },
  { value: 'commute', label: 'Commute' },
  { value: 'cinema', label: 'Cinema' },
  { value: 'reading', label: 'Reading' },
  { value: 'research', label: 'Research' },
  { value: 'writing', label: 'Writing' },
  { value: 'project', label: 'Project' },
  { value: 'recreation', label: 'Recreation' },
  { value: 'chores', label: 'Chores' },
  { value: 'art', label: 'Art' },
  { value: 'work', label: 'Work' }
];

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const ActivityTrends = ({ isDarkMode }: ActivityTrendsProps) => {
  const [selectedCategory, setSelectedCategory] = useState('project');
  const [chartData, setChartData] = useState<DayData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchActivityData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const data: DayData[] = [];
        const today = new Date();
        
        // Fetch data for last 7 days
        for (let i = 6; i >= 0; i--) {
          const date = new Date(today);
          date.setDate(date.getDate() - i);
          const dateString = formatDateForRoute(date);
          const dayName = DAYS[date.getDay()].substring(0, 2);
          
          try {
            const response = await api.get<ActivityResponse>(`/activities/${dateString}`);
            
            // Calculate total hours for selected category
            const categoryMinutes = response.data.activities
              .filter(activity => activity.category === selectedCategory)
              .reduce((sum, activity) => sum + activity.duration, 0);
            
            const hours = categoryMinutes / 60;
            
            data.push({
              date: `${date.getMonth() + 1}/${date.getDate()}`,
              day: dayName,
              hours: Math.round(hours * 100) / 100, // Round to 2 decimals
              fullDate: dateString
            });
          } catch (error: any) {
            // If date has no activities or API error, add 0 hours
            data.push({
              date: `${date.getMonth() + 1}/${date.getDate()}`,
              day: dayName,
              hours: 0,
              fullDate: dateString
            });
          }
        }
        
        setChartData(data);
      } catch (error: any) {
        console.error('Error fetching activity trends:', error);
        setError(error?.message || 'Failed to load activity data');
      } finally {
        setLoading(false);
      }
    };

    fetchActivityData();
  }, [selectedCategory]);

  const categoryColor = getCategoryColor(selectedCategory);
  const totalHours = chartData.reduce((sum, d) => sum + d.hours, 0);
  const avgHours = chartData.length > 0 ? totalHours / chartData.length : 0;

  return (
    <div className={`p-4 border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
      <div className="flex items-center gap-2 mb-3">
        <TrendingUp className={isDarkMode ? 'text-blue-400' : 'text-blue-600'} size={20} />
        <h3 className={`text-sm font-semibold ${
          isDarkMode ? 'text-white' : 'text-gray-900'
        }`}>
          Activity Trends (Last 7 Days)
        </h3>
      </div>

      {/* Category Selector */}
      <div className="mb-4 flex gap-2 flex-wrap">
        {CATEGORIES.map(cat => (
          <button
            key={cat.value}
            onClick={() => setSelectedCategory(cat.value)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
              selectedCategory === cat.value
                ? 'text-white shadow-md'
                : isDarkMode
                  ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
            style={selectedCategory === cat.value ? { backgroundColor: getCategoryColor(cat.value) } : {}}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Stats */}
      <div className="flex gap-4 mb-4">
        <div className={`flex-1 p-3 rounded-lg ${
          isDarkMode ? 'bg-gray-700' : 'bg-gray-50'
        }`}>
          <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Total Hours
          </div>
          <div className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            {loading ? '...' : `${totalHours.toFixed(1)}h`}
          </div>
        </div>
        <div className={`flex-1 p-3 rounded-lg ${
          isDarkMode ? 'bg-gray-700' : 'bg-gray-50'
        }`}>
          <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Daily Average
          </div>
          <div className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            {loading ? '...' : `${avgHours.toFixed(1)}h`}
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="h-48 w-full">
        {loading ? (
          <div className={`h-full flex items-center justify-center ${
            isDarkMode ? 'text-gray-400' : 'text-gray-600'
          }`}>
            Loading chart data...
          </div>
        ) : error ? (
          <div className={`h-full flex items-center justify-center ${
            isDarkMode ? 'text-red-400' : 'text-red-600'
          }`}>
            {error}
          </div>
        ) : chartData.length === 0 ? (
          <div className={`h-full flex items-center justify-center ${
            isDarkMode ? 'text-gray-400' : 'text-gray-600'
          }`}>
            No data available
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart 
              data={chartData} 
              margin={{ top: 10, right: 10, left: 0, bottom: 5 }}
            >
              <XAxis 
                dataKey="day" 
                tick={{ fill: isDarkMode ? '#9ca3af' : '#6b7280', fontSize: 12 }}
                stroke={isDarkMode ? '#374151' : '#e5e7eb'}
              />
              <YAxis 
                tick={{ fill: isDarkMode ? '#9ca3af' : '#6b7280', fontSize: 12 }}
                stroke={isDarkMode ? '#374151' : '#e5e7eb'}
                width={40}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: isDarkMode ? '#1f2937' : '#ffffff',
                  border: `1px solid ${isDarkMode ? '#374151' : '#e5e7eb'}`,
                  borderRadius: '8px',
                  fontSize: '12px',
                  padding: '8px'
                }}
                labelStyle={{ 
                  color: isDarkMode ? '#f3f4f6' : '#111827',
                  fontWeight: 'bold',
                  marginBottom: '4px'
                }}
                formatter={(value: number | undefined) => {
                  if (value === undefined || value === null) return ['0.00h', 'Duration'];
                  return [`${value.toFixed(2)}h`, 'Duration'];
                }}
                labelFormatter={(label: string) => {
                  const dataPoint = chartData.find(d => d.day === label);
                  return dataPoint ? dataPoint.date : label;
                }}
              />
              <Bar 
                dataKey="hours" 
                fill={categoryColor}
                radius={[6, 6, 0, 0]}
                maxBarSize={50}
              >
                {chartData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={categoryColor}
                    opacity={entry.hours === 0 ? 0.3 : 1}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};

export default ActivityTrends;