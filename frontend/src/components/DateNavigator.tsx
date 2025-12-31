import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Cpu, HardDrive } from 'lucide-react';
import { useDarkMode } from '../contexts/DarkModeContext';
import DarkModeToggle from './DarkModeToggle';

const DateNavigator = () => {
  const navigate = useNavigate();
  const { isDarkMode } = useDarkMode();
  
  // Get current date in IST
  const getISTDate = () => {
    const now = new Date();
    const istOffset = 5.5 * 60 * 60 * 1000; // IST is UTC+5:30
    const istTime = new Date(now.getTime() + istOffset + now.getTimezoneOffset() * 60 * 1000);
    istTime.setHours(0, 0, 0, 0);
    return istTime;
  };
  
  const startDate = new Date(2025, 11, 25); // December 25, 2025
  const today = getISTDate();
  
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
    const checkDate = new Date(date);
    checkDate.setHours(0, 0, 0, 0);
    const todayIST = getISTDate();
    return checkDate >= startDate && checkDate <= todayIST;
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
      const year = clickedDate.getFullYear();
      const month = String(clickedDate.getMonth() + 1).padStart(2, '0');
      const dayStr = String(clickedDate.getDate()).padStart(2, '0');
      const dateString = `${year}-${month}-${dayStr}`;
      navigate(`/daily/${dateString}`);
    }
  };

  const formatSelectedDate = () => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return `${days[selectedDate.getDay()]}, ${months[selectedDate.getMonth()]} ${selectedDate.getDate()}, ${selectedDate.getFullYear()}`;
  };

  const calendarDays = generateCalendarDays();

  const todayIST = getISTDate();
  const canGoPrev = currentYear > 2025 || (currentYear === 2025 && currentMonth > 11);
  const canGoNext = currentYear < todayIST.getFullYear() || (currentYear === todayIST.getFullYear() && currentMonth < todayIST.getMonth());

  return (
    <>
      <DarkModeToggle/>
      <div className={`w-full max-w-md mx-auto p-6 rounded-lg shadow-lg transition-colors ${
        isDarkMode ? 'bg-gray-800' : 'bg-white'
      }`}>
        <div className="mb-6 text-center">
          <h2 className={`text-2xl font-bold ${
            isDarkMode ? 'text-gray-100' : 'text-gray-800'
          }`}>
            {formatSelectedDate()}
          </h2>
        </div>

        <div className="mb-4 flex items-center justify-between">
          <button
            onClick={handlePrevMonth}
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
            {months[currentMonth]} {currentYear}
          </h3>
          <button
            onClick={handleNextMonth}
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

        <div className="grid grid-cols-7 gap-2">
          {daysOfWeek.map(day => (
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

            const date = new Date(currentYear, currentMonth, day);
            date.setHours(0, 0, 0, 0);
            const isAvailable = isDateAvailable(date);
            const isSelected = selectedDate.getTime() === date.getTime();
            const todayIST = getISTDate();
            const isToday = todayIST.getTime() === date.getTime();

            return (
              <button
                key={day}
                onClick={() => handleDateClick(day)}
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
          })}
        </div>

        <div className="mt-6 grid grid-cols-2 gap-4">
          <button
            onClick={() => navigate('/ram')}
            className={`py-3 px-4 font-medium rounded-lg transition-colors flex items-center justify-center gap-2 ${
              isDarkMode
                ? 'bg-blue-600 hover:bg-blue-700 text-white'
                : 'bg-blue-500 hover:bg-blue-600 text-white'
            }`}
          >
            <HardDrive size={20} />
            RAM
          </button>
          <button
            onClick={() => navigate('/cache')}
            className={`py-3 px-4 font-medium rounded-lg transition-colors flex items-center justify-center gap-2 ${
              isDarkMode
                ? 'bg-green-600 hover:bg-green-700 text-white'
                : 'bg-green-500 hover:bg-green-600 text-white'
            }`}
          >
            <Cpu size={20} />
            Cache
          </button>
        </div>

      </div>
    </>

  );
};

export default DateNavigator;