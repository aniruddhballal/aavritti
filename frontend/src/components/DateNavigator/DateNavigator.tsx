import { useNavigate } from 'react-router-dom';
import { useDarkMode } from '../../contexts/DarkModeContext';
import { useCalendarNavigator } from './useCalendarNavigator';
import { formatDateLong, formatDateForRoute, MONTHS } from './dateUtils';
import DarkModeToggle from '../DarkModeToggle/DarkModeToggle';
import CalendarHeader from './CalendarHeader';
import CalendarMonthNav from './CalendarMonthNav';
import CalendarGrid from './CalendarGrid';
import QuickNavButtons from './QuickNavButtons';

const DateNavigator = () => {
  const navigate = useNavigate();
  const { isDarkMode } = useDarkMode();
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
    <>
      <DarkModeToggle />
      <div className={`w-full max-w-md mx-auto p-6 rounded-lg shadow-lg transition-colors ${
        isDarkMode ? 'bg-gray-800' : 'bg-white'
      }`}>
        <CalendarHeader
          formattedDate={formatDateLong(state.selectedDate)}
          isDarkMode={isDarkMode}
        />

        <CalendarMonthNav
          monthName={MONTHS[state.currentMonth]}
          year={state.currentYear}
          canGoPrev={state.canGoPrev}
          canGoNext={state.canGoNext}
          onPrevMonth={actions.handlePrevMonth}
          onNextMonth={actions.handleNextMonth}
          isDarkMode={isDarkMode}
        />

        <CalendarGrid
          calendarDays={state.calendarDays}
          isDarkMode={isDarkMode}
          isDateSelectable={actions.isDateSelectable}
          isDateSelected={actions.isDateSelected}
          isDateToday={actions.isDateToday}
          onDateClick={handleDateClick}
        />

        <QuickNavButtons
          onRamClick={handleRamNavigation}
          onCacheClick={handleCacheNavigation}
          isDarkMode={isDarkMode}
        />
      </div>
    </>
  );
};

export default DateNavigator;