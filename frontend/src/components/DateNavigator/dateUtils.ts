export const CALENDAR_START_DATE = new Date(2025, 11, 25); // December 25, 2025

export const DAYS_OF_WEEK = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export const DAYS_OF_WEEK_FULL = [
  'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'
];

export const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000; // IST is UTC+5:30

/**
 * Get current date normalized to IST midnight
 */
export const getISTDate = (): Date => {
  const now = new Date();
  const istTime = new Date(
    now.getTime() + IST_OFFSET_MS + now.getTimezoneOffset() * 60 * 1000
  );
  istTime.setHours(0, 0, 0, 0);
  return istTime;
};

/**
 * Normalize any date to midnight
 */
export const normalizeDateToMidnight = (date: Date): Date => {
  const normalized = new Date(date);
  normalized.setHours(0, 0, 0, 0);
  return normalized;
};

/**
 * Get number of days in a given month
 */
export const getDaysInMonth = (month: number, year: number): number => {
  return new Date(year, month + 1, 0).getDate();
};

/**
 * Get the day of week (0-6) for the first day of a month
 */
export const getFirstDayOfMonth = (month: number, year: number): number => {
  return new Date(year, month, 1).getDay();
};

/**
 * Check if a date is available (between start date and today in IST)
 */
export const isDateAvailable = (date: Date, startDate: Date = CALENDAR_START_DATE): boolean => {
  const checkDate = normalizeDateToMidnight(date);
  const todayIST = getISTDate();
  return checkDate >= startDate && checkDate <= todayIST;
};

/**
 * Generate array of calendar days for a month (with null for empty cells)
 */
export const generateCalendarDays = (month: number, year: number): (number | null)[] => {
  const daysInMonth = getDaysInMonth(month, year);
  const firstDay = getFirstDayOfMonth(month, year);
  const days: (number | null)[] = [];

  // Add empty cells for days before month starts
  for (let i = 0; i < firstDay; i++) {
    days.push(null);
  }

  // Add actual days
  for (let day = 1; day <= daysInMonth; day++) {
    days.push(day);
  }

  return days;
};

/**
 * Format a date to readable string with full day name
 */
export const formatDateLong = (date: Date): string => {
  return `${DAYS_OF_WEEK_FULL[date.getDay()]}, ${MONTHS[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
};

/**
 * Format date to YYYY-MM-DD for routing
 */
export const formatDateForRoute = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * Check if navigation to previous month is allowed
 */
export const canNavigateToPrevMonth = (currentMonth: number, currentYear: number): boolean => {
  return currentYear > 2025 || (currentYear === 2025 && currentMonth > 11);
};

/**
 * Check if navigation to next month is allowed
 */
export const canNavigateToNextMonth = (currentMonth: number, currentYear: number): boolean => {
  const todayIST = getISTDate();
  return currentYear < todayIST.getFullYear() || 
         (currentYear === todayIST.getFullYear() && currentMonth < todayIST.getMonth());
};

/**
 * Get previous month/year
 */
export const getPreviousMonth = (month: number, year: number): { month: number; year: number } => {
  if (month === 0) {
    return { month: 11, year: year - 1 };
  }
  return { month: month - 1, year };
};

/**
 * Get next month/year
 */
export const getNextMonth = (month: number, year: number): { month: number; year: number } => {
  if (month === 11) {
    return { month: 0, year: year + 1 };
  }
  return { month: month + 1, year };
};

/**
 * Check if two dates represent the same day
 */
export const isSameDay = (date1: Date, date2: Date): boolean => {
  return normalizeDateToMidnight(date1).getTime() === normalizeDateToMidnight(date2).getTime();
};