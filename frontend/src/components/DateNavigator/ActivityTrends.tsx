import { useState, useEffect } from 'react';
import { TrendingUp } from 'lucide-react';
import ReactECharts from 'echarts-for-react';
import { activityService } from '../../services/activityService';
import { formatDateForRoute } from './dateUtils';
import { getCategoryColor } from '../../utils/categoryColors';
import type { DailyData } from '../../types/activity';

interface ActivityTrendsProps {
  isDarkMode: boolean;
}

interface DayData {
  date: string;
  day: string;
  hours: number;
  fullDate: string;
}

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const ActivityTrends = ({ isDarkMode }: ActivityTrendsProps) => {
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('project');
  const [chartData, setChartData] = useState<DayData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedDayIndex, setSelectedDayIndex] = useState<number | null>(null);

useEffect(() => {
  const fetchCategories = async () => {
    try {
      const suggestions = await activityService.getCategorySuggestions('');
      setCategories(suggestions);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };
  fetchCategories();
}, []);

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
            // Use activityService instead of direct api call
            const response: DailyData = await activityService.getActivities(dateString);
            
            // Calculate total hours for selected category
            const categoryMinutes = response.activities
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

  // Helper function to format hours to Xh Ym format
  const formatDuration = (hours: number): string => {
    const h = Math.floor(hours);
    const m = Math.round((hours - h) * 60);
    if (h === 0) return `${m}m`;
    if (m === 0) return `${h}h`;
    return `${h}h ${m}m`;
  };

  // ECharts configuration
  const getOption = () => {
    return {
      grid: {
        top: 20,
        right: 20,
        bottom: 30,
        left: 50
      },
      xAxis: {
        type: 'category',
        data: chartData.map(d => d.day),
        axisLine: {
          lineStyle: {
            color: isDarkMode ? '#374151' : '#e5e7eb',
            width: 2
          }
        },
        axisLabel: {
          color: isDarkMode ? '#9ca3af' : '#6b7280',
          fontSize: 12
        },
        axisTick: {
          show: false
        }
      },
      yAxis: {
        type: 'value',
        splitLine: {
          lineStyle: {
            color: isDarkMode ? '#374151' : '#e5e7eb'
          }
        },
        axisLine: {
          lineStyle: {
            color: isDarkMode ? '#374151' : '#e5e7eb',
            width: 2
          }
        },
        axisLabel: {
          color: isDarkMode ? '#9ca3af' : '#6b7280',
          fontSize: 12
        }
      },
      series: [
        {
          data: chartData.map(d => d.hours),
          type: 'line',
          smooth: false,
          lineStyle: {
            color: categoryColor,
            width: 2
          },
          itemStyle: {
            color: isDarkMode ? '#1f2937' : '#ffffff', // Hollow/empty dot background
            borderColor: categoryColor,
            borderWidth: 2
          },
          symbol: 'circle',
          symbolSize: 8,
          emphasis: {
            focus: 'series',
            itemStyle: {
              color: categoryColor, // Fill with color on hover
              borderColor: categoryColor,
              borderWidth: 2,
              shadowBlur: 0,
              shadowColor: 'transparent'
            }
          }
        }
      ],
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'line',
          lineStyle: {
            color: isDarkMode ? '#4b5563' : '#d1d5db',
            width: 1,
            type: 'solid'
          },
          z: -1 // This ensures the axis pointer is behind the dots
        },
        formatter: (params: any) => {
          // Update selected day index based on tooltip
          if (params && params.length > 0 && params[0].dataIndex !== undefined) {
            setSelectedDayIndex(params[0].dataIndex);
          }
          return ''; // Empty tooltip content
        },
        backgroundColor: 'transparent',
        borderWidth: 0,
        extraCssText: 'box-shadow: none;'
      }
    };
  };

  const onChartEvents = {
    globalout: () => {
      setSelectedDayIndex(null);
    }
  };

  return (
    <div className={`p-4 ${isDarkMode ? '' : ''}`}>
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
        {categories.map(cat => (
  <button
    key={cat}
    onClick={() => setSelectedCategory(cat)}
    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all capitalize ${
      selectedCategory === cat
        ? 'text-white shadow-md'
        : isDarkMode
          ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
    }`}
    style={selectedCategory === cat ? { backgroundColor: getCategoryColor(cat) } : {}}
  >
    {cat}
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
            {loading ? '...' : formatDuration(totalHours)}
          </div>
        </div>
        <div className={`flex-1 p-3 rounded-lg ${
          isDarkMode ? 'bg-gray-700' : 'bg-gray-50'
        }`}>
          <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Daily Average
          </div>
          <div className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            {loading ? '...' : formatDuration(avgHours)}
          </div>
        </div>
        <div className={`flex-1 p-3 rounded-lg ${
          isDarkMode ? 'bg-gray-700' : 'bg-gray-50'
        }`}>
          <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            {selectedDayIndex !== null && selectedDayIndex !== chartData.length - 1
              ? chartData[selectedDayIndex]?.date
              : 'Today'}
          </div>
          <div className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            {loading ? '...' : formatDuration(
              selectedDayIndex !== null ? chartData[selectedDayIndex]?.hours || 0 : chartData[chartData.length - 1]?.hours || 0
            )}
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
          <ReactECharts
            option={getOption()}
            style={{ height: '100%', width: '100%' }}
            onEvents={onChartEvents}
          />
        )}
      </div>
    </div>
  );
};

export default ActivityTrends;