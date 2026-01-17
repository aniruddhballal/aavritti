import { useState, useEffect } from 'react';
import { TrendingUp, ChevronLeft, ChevronRight } from 'lucide-react';
import ReactECharts from 'echarts-for-react';
import { activityService } from '../../services/activityService';
import { formatDateForRoute, CALENDAR_START_DATE, getISTDate, normalizeDateToMidnight } from './dateUtils';
import type { DailyData } from '../../types/activity';
import type { CategorySuggestion } from '../../types/activity';
import { getTheme } from '../../theme';

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
  const theme = getTheme(isDarkMode);
  const [categories, setCategories] = useState<CategorySuggestion[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('project');
  const [chartData, setChartData] = useState<DayData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedDayIndex, setSelectedDayIndex] = useState<number | null>(null);
  
  // Week navigation state
  const [weekOffset, setWeekOffset] = useState(0); // 0 = current week, -1 = previous week, +1 = next week (not used)
  const [canGoPrevWeek, setCanGoPrevWeek] = useState(true);
  const [canGoNextWeek, setCanGoNextWeek] = useState(false);
  const [pendingCategory, setPendingCategory] = useState<string | null>(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const suggestions = await activityService.getCategorySuggestions('');
        setCategories(suggestions);
        
        if (suggestions.length > 0 && !selectedCategory) {
          setSelectedCategory(suggestions[0].name);
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };
    fetchCategories();
  }, []);

  // Helper function to check if a date is available based on CALENDAR_START_DATE
  const isDateAvailable = (date: Date): boolean => {
    const checkDate = normalizeDateToMidnight(date);
    const todayIST = getISTDate();
    const startDate = normalizeDateToMidnight(CALENDAR_START_DATE);
    return checkDate >= startDate && checkDate <= todayIST;
  };

  // Get the start date for the current week view
  const getWeekStartDate = (): Date => {
    const today = getISTDate();
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - 6 + (weekOffset * 7));
    return weekStart;
  };

  // Check if we can navigate to previous/next week
  const updateWeekNavigationState = (weekStart: Date) => {
    // Check if we can go to previous week (7 days before current week start)
    const prevWeekStart = new Date(weekStart);
    prevWeekStart.setDate(weekStart.getDate() - 7);
    setCanGoPrevWeek(isDateAvailable(prevWeekStart));

    // Check if we can go to next week (current week is not the most recent)
    const nextWeekEnd = new Date(weekStart);
    nextWeekEnd.setDate(weekStart.getDate() + 6 + 7); // End of next week
    const todayIST = getISTDate();
    setCanGoNextWeek(weekOffset < 0 && nextWeekEnd <= todayIST);
  };

  useEffect(() => {
    const fetchActivityData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const data: DayData[] = [];
        const weekStart = getWeekStartDate();
        
        // Fetch data for 7 days starting from weekStart
        for (let i = 0; i < 7; i++) {
          const date = new Date(weekStart);
          date.setDate(weekStart.getDate() + i);
          const dateString = formatDateForRoute(date);
          const dayName = DAYS[date.getDay()];
          
          // Only fetch if date is available
          if (isDateAvailable(date)) {
            try {
              const response: DailyData = await activityService.getActivities(dateString);
              
              // Calculate total hours for selected category
              const categoryMinutes = response.activities
                .filter(activity => activity.category.toLowerCase() === selectedCategory.toLowerCase())
                .reduce((sum, activity) => sum + (activity.duration || 0), 0);
              
              const hours = categoryMinutes / 60;
              
              data.push({
                date: `${date.getDate()}/${date.getMonth() + 1}`,
                day: dayName,
                hours: Math.round(hours * 100) / 100,
                fullDate: dateString
              });
            } catch (error: any) {
              // If date has no activities or API error, add 0 hours
              data.push({
                date: `${date.getDate()}/${date.getMonth() + 1}`,
                day: dayName,
                hours: 0,
                fullDate: dateString
              });
            }
          } else {
            // Date not available, add 0 hours
            data.push({
              date: `${date.getDate()}/${date.getMonth() + 1}`,
              day: dayName,
              hours: 0,
              fullDate: dateString
            });
          }
        }
        
        // Only update chart data after all data is fetched
        setChartData(data);
        updateWeekNavigationState(weekStart);
        
        // If there's a pending category, apply it now
        if (pendingCategory) {
          setSelectedCategory(pendingCategory);
          setPendingCategory(null);
        }
        
        setLoading(false);
      } catch (error: any) {
        console.error('Error fetching activity trends:', error);
        setError(error?.message || 'Failed to load activity data');
        setLoading(false);
      }
    };

    fetchActivityData();
  }, [selectedCategory, weekOffset]);

  const handlePrevWeek = () => {
    if (canGoPrevWeek && !loading) {
      setWeekOffset(prev => prev - 1);
    }
  };

  const handleNextWeek = () => {
    if (canGoNextWeek && !loading) {
      setWeekOffset(prev => prev + 1);
    }
  };

  const handleCategoryChange = (category: string) => {
    if (!loading) {
      setPendingCategory(category);
      // Trigger refetch by updating selectedCategory
      setSelectedCategory(category);
    }
  };

  const categoryColor = categories.find(c => c.name.toLowerCase() === selectedCategory.toLowerCase())?.color || '#95A5A6';
  const totalHours = chartData.reduce((sum, d) => sum + d.hours, 0);
  const avgHours = chartData.length > 0 ? totalHours / chartData.length : 0;

  // Helper function to format hours to Xh Ym format
  const formatDuration = (hours: number): string => {
    let h = Math.floor(hours);
    let m = Math.round((hours - h) * 60);
    
    if (m === 60) {
      h += 1;
      m = 0;
    }
    
    if (h === 0) return `${m}m`;
    if (m === 0) return `${h}h`;
    return `${h}h ${m}m`;
  };

  // Get week date range for display
  const getWeekRangeText = (): string => {
    if (chartData.length === 0) return '';
    return `${chartData[0].date} - ${chartData[chartData.length - 1].date}`;
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
            color: isDarkMode ? '#1f2937' : '#ffffff',
            borderColor: categoryColor,
            borderWidth: 2
          },
          symbol: 'circle',
          symbolSize: 8,
          emphasis: {
            focus: 'series',
            itemStyle: {
              color: categoryColor,
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
          z: -1
        },
        formatter: (params: any) => {
          if (params && params.length > 0 && params[0].dataIndex !== undefined) {
            setSelectedDayIndex(params[0].dataIndex);
          }
          return '';
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
    <div className="p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <TrendingUp className={isDarkMode ? 'text-blue-400' : 'text-blue-600'} size={20} />
          <h3 className={`text-sm font-semibold ${theme.textPrimary}`}>
            Activity Trends
          </h3>
        </div>
        
        {/* Week Navigation */}
        <div className="flex items-center gap-2">
          <button
            onClick={handlePrevWeek}
            disabled={!canGoPrevWeek || loading}
            className={`p-1.5 rounded-lg transition-colors relative ${
              canGoPrevWeek && !loading
                ? `${theme.bgSecondary} hover:${theme.bgHover} ${theme.textPrimary}`
                : `${isDarkMode ? 'bg-gray-800' : 'bg-gray-50'} ${isDarkMode ? 'text-gray-600' : 'text-gray-300'} cursor-not-allowed`
            }`}
            aria-label="Previous week"
          >
            <ChevronLeft size={18} className={loading && canGoPrevWeek ? 'animate-pulse' : ''} />
          </button>
          
          <span className={`text-xs ${theme.textTertiary} min-w-[80px] text-center`}>
            {getWeekRangeText()}
          </span>
          
          <button
            onClick={handleNextWeek}
            disabled={!canGoNextWeek || loading}
            className={`p-1.5 rounded-lg transition-colors relative ${
              canGoNextWeek && !loading
                ? `${theme.bgSecondary} hover:${theme.bgHover} ${theme.textPrimary}`
                : `${isDarkMode ? 'bg-gray-800' : 'bg-gray-50'} ${isDarkMode ? 'text-gray-600' : 'text-gray-300'} cursor-not-allowed`
            }`}
            aria-label="Next week"
          >
            <ChevronRight size={18} className={loading && canGoNextWeek ? 'animate-pulse' : ''} />
          </button>
        </div>
      </div>

      {/* Category Selector */}
      <div className="mb-4 flex gap-2 flex-wrap">
        {categories.map(cat => (
          <button
            key={cat.name}
            onClick={() => handleCategoryChange(cat.name)}
            disabled={loading}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all capitalize ${
              selectedCategory === cat.name && !pendingCategory
                ? 'text-white shadow-md'
                : `${theme.bgSecondary} ${theme.textSecondary} hover:${theme.bgHover}`
            } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
            style={selectedCategory === cat.name && !pendingCategory ? { backgroundColor: cat.color } : {}}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Stats */}
      <div className="flex gap-4 mb-4">
        <div className={`flex-1 p-3 rounded-lg ${theme.bgSecondary}`}>
          <div className={`text-xs ${theme.textTertiary}`}>
            Total Hours
          </div>
          <div className={`text-xl font-bold ${theme.textPrimary}`}>
            {formatDuration(totalHours)}
          </div>
        </div>
        <div className={`flex-1 p-3 rounded-lg ${theme.bgSecondary}`}>
          <div className={`text-xs ${theme.textTertiary}`}>
            Daily Average
          </div>
          <div className={`text-xl font-bold ${theme.textPrimary}`}>
            {formatDuration(avgHours)}
          </div>
        </div>
        <div className={`flex-1 p-3 rounded-lg ${theme.bgSecondary}`}>
          <div className={`text-xs ${theme.textTertiary}`}>
            {selectedDayIndex !== null && selectedDayIndex !== chartData.length - 1
              ? chartData[selectedDayIndex]?.date
              : (() => {
                  // Check if the last day of the displayed week is actually today
                  const lastDayData = chartData[chartData.length - 1];
                  if (!lastDayData) return 'Today';
                  
                  const todayIST = getISTDate();
                  const todayFormatted = formatDateForRoute(todayIST);
                  
                  return lastDayData.fullDate === todayFormatted ? 'Today' : lastDayData.date;
                })()}
          </div>
          <div className={`text-xl font-bold ${theme.textPrimary}`}>
            {formatDuration(
              selectedDayIndex !== null ? chartData[selectedDayIndex]?.hours || 0 : chartData[chartData.length - 1]?.hours || 0
            )}
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="h-48 w-full">
        {error ? (
          <div className={`h-full flex items-center justify-center ${
            isDarkMode ? 'text-red-400' : 'text-red-600'
          }`}>
            {error}
          </div>
        ) : chartData.length === 0 ? (
          <div className={`h-full flex items-center justify-center ${theme.textTertiary}`}>
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