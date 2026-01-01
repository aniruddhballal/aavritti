import { useNavigate } from 'react-router-dom';
import { Calendar, Moon, Sun } from 'lucide-react';
import { useDarkMode } from '../../contexts/DarkModeContext';
import { useCalendarNavigator } from './useCalendarNavigator';
import { formatDateLong, formatDateForRoute, MONTHS } from './dateUtils';
import CalendarMonthNav from './CalendarMonthNav';
import CalendarGrid from './CalendarGrid';
import QuickNavButtons from './QuickNavButtons';
import ActivityTrends from './ActivityTrends';

const DateNavigator = () => {
  const navigate = useNavigate();
  const { isDarkMode, toggleDarkMode } = useDarkMode();
  const { state, actions } = useCalendarNavigator();

  const handleDateClick = (day: number) => {
    actions.selectDate(day);
    
    // Calculate route after state update
    const date = new Date(state.currentYear, state.currentMonth, day);
    date.setHours(0, 0, 0, 0);
    
    if (actions.isDateSelectable(day)) {
      const dateString = formatDateForRoute(date);
      navigate(`/daily/${dateString}`);
    }
  };

  const handleRamNavigation = () => {
    navigate('/ram');
  };

  const handleCacheNavigation = () => {
    navigate('/cache');
  };

  return (
    <div className={`min-h-screen p-4 transition-colors ${
      isDarkMode ? 'bg-gray-900' : 'bg-gray-50'
    }`}>
      <div className="w-full max-w-md mx-auto space-y-4">
        {/* Calendar Card */}
        <div className={`rounded-lg shadow-lg transition-colors ${
          isDarkMode ? 'bg-gray-800' : 'bg-white'
        }`}>
          {/* Header with integrated Dark Mode toggle */}
          <div className={`p-4 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Calendar className={isDarkMode ? 'text-blue-400' : 'text-blue-600'} size={24} />
                <span className={`text-sm font-medium ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  Activity Calendar
                </span>
              </div>
              <button
                onClick={toggleDarkMode}
                className={`p-2 rounded-lg transition-colors ${
                  isDarkMode 
                    ? 'bg-gray-700 hover:bg-gray-600 text-yellow-400' 
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                }`}
                aria-label="Toggle dark mode"
              >
                {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
              </button>
            </div>
            <h2 className={`text-lg font-semibold ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>
              {formatDateLong(state.selectedDate)}
            </h2>
          </div>

          {/* Month Navigation */}
          <div className="p-4">
            <CalendarMonthNav
              monthName={MONTHS[state.currentMonth]}
              year={state.currentYear}
              canGoPrev={state.canGoPrev}
              canGoNext={state.canGoNext}
              onPrevMonth={actions.handlePrevMonth}
              onNextMonth={actions.handleNextMonth}
              isDarkMode={isDarkMode}
            />

            {/* Calendar Grid */}
            <CalendarGrid
              calendarDays={state.calendarDays}
              isDarkMode={isDarkMode}
              isDateSelectable={actions.isDateSelectable}
              isDateSelected={actions.isDateSelected}
              isDateToday={actions.isDateToday}
              onDateClick={handleDateClick}
            />
          </div>

          {/* Quick Navigation */}
          <div className="p-4">
            <QuickNavButtons
              onRamClick={handleRamNavigation}
              onCacheClick={handleCacheNavigation}
              isDarkMode={isDarkMode}
            />
          </div>
        </div>

        {/* Activity Trends Card */}
        <div className={`rounded-lg shadow-lg transition-colors ${
          isDarkMode ? 'bg-gray-800' : 'bg-white'
        }`}>
          <ActivityTrends isDarkMode={isDarkMode} />
        </div>
      </div>
    </div>
  );
};

export default DateNavigator;