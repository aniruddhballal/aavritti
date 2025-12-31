import { ChevronLeft, ChevronRight } from 'lucide-react';

interface CalendarMonthNavProps {
  monthName: string;
  year: number;
  canGoPrev: boolean;
  canGoNext: boolean;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  isDarkMode: boolean;
}

const CalendarMonthNav = ({
  monthName,
  year,
  canGoPrev,
  canGoNext,
  onPrevMonth,
  onNextMonth,
  isDarkMode
}: CalendarMonthNavProps) => {
  return (
    <div className="mb-4 flex items-center justify-between">
      <button
        onClick={onPrevMonth}
        disabled={!canGoPrev}
        className={`p-2 rounded-full transition-colors ${
          canGoPrev 
            ? isDarkMode
              ? 'hover:bg-gray-700 text-gray-300'
              : 'hover:bg-gray-100 text-gray-700'
            : isDarkMode
              ? 'text-gray-600 cursor-not-allowed'
              : 'text-gray-300 cursor-not-allowed'
        }`}
      >
        <ChevronLeft size={20} />
      </button>
      
      <h3 className={`text-lg font-semibold ${
        isDarkMode ? 'text-gray-100' : 'text-gray-800'
      }`}>
        {monthName} {year}
      </h3>
      
      <button
        onClick={onNextMonth}
        disabled={!canGoNext}
        className={`p-2 rounded-full transition-colors ${
          canGoNext 
            ? isDarkMode
              ? 'hover:bg-gray-700 text-gray-300'
              : 'hover:bg-gray-100 text-gray-700'
            : isDarkMode
              ? 'text-gray-600 cursor-not-allowed'
              : 'text-gray-300 cursor-not-allowed'
        }`}
      >
        <ChevronRight size={20} />
      </button>
    </div>
  );
};

export default CalendarMonthNav;