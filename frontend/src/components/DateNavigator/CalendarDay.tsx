interface CalendarDayProps {
  day: number;
  isAvailable: boolean;
  isSelected: boolean;
  isToday: boolean;
  onClick: () => void;
  isDarkMode: boolean;
}

const CalendarDay = ({
  day,
  isAvailable,
  isSelected,
  isToday,
  onClick,
  isDarkMode
}: CalendarDayProps) => {
  return (
    <button
      onClick={onClick}
      disabled={!isAvailable}
      className={`aspect-square rounded-lg flex items-center justify-center text-sm font-medium transition-colors
        ${isSelected 
          ? 'bg-blue-500 text-white hover:bg-blue-600' 
          : ''}
        ${!isSelected && isToday 
          ? isDarkMode
            ? 'bg-blue-900/40 text-blue-300'
            : 'bg-blue-100 text-blue-700'
          : ''}
        ${!isSelected && !isToday && isAvailable 
          ? isDarkMode
            ? 'hover:bg-gray-700 text-gray-300'
            : 'hover:bg-gray-100 text-gray-700'
          : ''}
        ${!isAvailable 
          ? isDarkMode
            ? 'text-gray-600 cursor-not-allowed'
            : 'text-gray-300 cursor-not-allowed'
          : ''}
      `}
    >
      {day}
    </button>
  );
};

export default CalendarDay;