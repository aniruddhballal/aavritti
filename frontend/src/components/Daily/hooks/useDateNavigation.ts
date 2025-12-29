// (Date navigation logic)
// a custom hook that handles all date navigation logic including IST timezone utilities, date availability checking, and navigation between dates.

import { useNavigate } from 'react-router-dom';

export const useDateNavigation = (selectedDate: Date, dateString: string) => {
  const navigate = useNavigate();

  const getTodayIST = () => {
    const now = new Date();
    return now.toLocaleDateString('en-CA', { 
      timeZone: 'Asia/Kolkata',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  };

  const getISTDate = () => {
    const now = new Date();
    const istOffset = 5.5 * 60 * 60 * 1000; // IST is UTC+5:30
    const istTime = new Date(now.getTime() + istOffset + now.getTimezoneOffset() * 60 * 1000);
    istTime.setHours(0, 0, 0, 0);
    return istTime;
  };

  const isDateAvailable = (date: Date) => {
    const startDate = new Date(2025, 11, 25); // December 25, 2025
    const checkDate = new Date(date);
    checkDate.setHours(0, 0, 0, 0);
    const todayIST = getISTDate();
    return checkDate >= startDate && checkDate <= todayIST;
  };

  const navigateToDate = (direction: 'prev' | 'next') => {
    const currentDate = new Date(selectedDate);
    const newDate = new Date(currentDate);
    
    if (direction === 'prev') {
      newDate.setDate(newDate.getDate() - 1);
    } else {
      newDate.setDate(newDate.getDate() + 1);
    }
    
    if (isDateAvailable(newDate)) {
      const year = newDate.getFullYear();
      const month = String(newDate.getMonth() + 1).padStart(2, '0');
      const day = String(newDate.getDate()).padStart(2, '0');
      const dateString = `${year}-${month}-${day}`;
      navigate(`/daily/${dateString}`);
    }
  };

  const canNavigatePrev = () => {
    const prevDate = new Date(selectedDate);
    prevDate.setDate(prevDate.getDate() - 1);
    return isDateAvailable(prevDate);
  };

  const canNavigateNext = () => {
    const nextDate = new Date(selectedDate);
    nextDate.setDate(nextDate.getDate() + 1);
    return isDateAvailable(nextDate);
  };

  const isToday = () => {
    return dateString === getTodayIST();
  };

  const formatDate = (date: Date) => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 
                    'July', 'August', 'September', 'October', 'November', 'December'];
    return `${days[date.getDay()]}, ${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
  };

  return {
    navigateToDate,
    canNavigatePrev,
    canNavigateNext,
    isToday,
    formatDate,
    getTodayIST,
    getISTDate
  };
};