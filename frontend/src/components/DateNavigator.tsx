import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const DateNavigator = () => {
  const startDate = new Date(2025, 11, 25); // December 25, 2025
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const [selectedDate, setSelectedDate] = useState(today);
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());

  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 
                  'July', 'August', 'September', 'October', 'November', 'December'];

  const getDaysInMonth = (month: number, year: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (month: number, year: number) => {
    return new Date(year, month, 1).getDay();
  };

  const isDateAvailable = (date: Date) => {
    return date >= startDate && date <= today;
  };

  const generateCalendarDays = () => {
    const daysInMonth = getDaysInMonth(currentMonth, currentYear);
    const firstDay = getFirstDayOfMonth(currentMonth, currentYear);
    const days = [];

    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      days.push(day);
    }

    return days;
  };

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  const handleDateClick = (day: number) => {
    const clickedDate = new Date(currentYear, currentMonth, day);
    clickedDate.setHours(0, 0, 0, 0);
    
    if (isDateAvailable(clickedDate)) {
      setSelectedDate(clickedDate);
    }
  };

  const formatSelectedDate = () => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return `${days[selectedDate.getDay()]}, ${months[selectedDate.getMonth()]} ${selectedDate.getDate()}, ${selectedDate.getFullYear()}`;
  };

  const calendarDays = generateCalendarDays();

  const canGoPrev = currentYear > 2025 || (currentYear === 2025 && currentMonth > 11);
  const canGoNext = currentYear < today.getFullYear() || (currentYear === today.getFullYear() && currentMonth < today.getMonth());

  return (
    <div className="w-full max-w-md mx-auto p-6 bg-white rounded-lg shadow-lg">
      <div className="mb-6 text-center">
        <h2 className="text-2xl font-bold text-gray-800">{formatSelectedDate()}</h2>
      </div>

      <div className="mb-4 flex items-center justify-between">
        <button
          onClick={handlePrevMonth}
          disabled={!canGoPrev}
          className={`p-2 rounded-full ${canGoPrev ? 'hover:bg-gray-100 text-gray-700' : 'text-gray-300 cursor-not-allowed'}`}
        >
          <ChevronLeft size={20} />
        </button>
        <h3 className="text-lg font-semibold text-gray-800">
          {months[currentMonth]} {currentYear}
        </h3>
        <button
          onClick={handleNextMonth}
          disabled={!canGoNext}
          className={`p-2 rounded-full ${canGoNext ? 'hover:bg-gray-100 text-gray-700' : 'text-gray-300 cursor-not-allowed'}`}
        >
          <ChevronRight size={20} />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-2">
        {daysOfWeek.map(day => (
          <div key={day} className="text-center text-sm font-semibold text-gray-600 py-2">
            {day}
          </div>
        ))}
        
        {calendarDays.map((day, index) => {
          if (day === null) {
            return <div key={`empty-${index}`} className="aspect-square" />;
          }

          const date = new Date(currentYear, currentMonth, day);
          date.setHours(0, 0, 0, 0);
          const isAvailable = isDateAvailable(date);
          const isSelected = selectedDate.getTime() === date.getTime();
          const isToday = today.getTime() === date.getTime();

          return (
            <button
              key={day}
              onClick={() => handleDateClick(day)}
              disabled={!isAvailable}
              className={`aspect-square rounded-lg flex items-center justify-center text-sm font-medium transition-colors
                ${isSelected ? 'bg-blue-500 text-white' : ''}
                ${!isSelected && isToday ? 'bg-blue-100 text-blue-700' : ''}
                ${!isSelected && !isToday && isAvailable ? 'hover:bg-gray-100 text-gray-700' : ''}
                ${!isAvailable ? 'text-gray-300 cursor-not-allowed' : ''}
              `}
            >
              {day}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default DateNavigator;