import CalendarDay from './CalendarDay';
import { DAYS_OF_WEEK } from './dateUtils';

interface CalendarGridProps {
  calendarDays: (number | null)[];
  isDarkMode: boolean;
  isDateSelectable: (day: number) => boolean;
  isDateSelected: (day: number) => boolean;
  isDateToday: (day: number) => boolean;
  onDateClick: (day: number) => void;
}

const CalendarGrid = ({
  calendarDays,
  isDarkMode,
  isDateSelectable,
  isDateSelected,
  isDateToday,
  onDateClick
}: CalendarGridProps) => {
  return (
    <div className="grid grid-cols-7 gap-2">
      {DAYS_OF_WEEK.map(day => (
        <div 
          key={day} 
          className={`text-center text-sm font-semibold py-2 ${
            isDarkMode ? 'text-gray-400' : 'text-gray-600'
          }`}
        >
          {day}
        </div>
      ))}
      
      {calendarDays.map((day, index) => {
        if (day === null) {
          return <div key={`empty-${index}`} className="aspect-square" />;
        }

        return (
          <CalendarDay
            key={day}
            day={day}
            isAvailable={isDateSelectable(day)}
            isSelected={isDateSelected(day)}
            isToday={isDateToday(day)}
            onClick={() => onDateClick(day)}
            isDarkMode={isDarkMode}
          />
        );
      })}
    </div>
  );
};

export default CalendarGrid;