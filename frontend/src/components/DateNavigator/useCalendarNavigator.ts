import { useState } from 'react';
import {
  getISTDate,
  normalizeDateToMidnight,
  isDateAvailable,
  generateCalendarDays,
  canNavigateToPrevMonth,
  canNavigateToNextMonth,
  getPreviousMonth,
  getNextMonth,
  CALENDAR_START_DATE
} from './dateUtils';

export interface CalendarState {
  selectedDate: Date;
  currentMonth: number;
  currentYear: number;
  calendarDays: (number | null)[];
  canGoPrev: boolean;
  canGoNext: boolean;
  todayIST: Date;
}

export interface CalendarActions {
  handlePrevMonth: () => void;
  handleNextMonth: () => void;
  selectDate: (day: number) => void;
  isDateSelectable: (day: number) => boolean;
  isDateSelected: (day: number) => boolean;
  isDateToday: (day: number) => boolean;
}

export const useCalendarNavigator = () => {
  const todayIST = getISTDate();
  
  const [selectedDate, setSelectedDate] = useState(todayIST);
  const [currentMonth, setCurrentMonth] = useState(todayIST.getMonth());
  const [currentYear, setCurrentYear] = useState(todayIST.getFullYear());

  const calendarDays = generateCalendarDays(currentMonth, currentYear);
  const canGoPrev = canNavigateToPrevMonth(currentMonth, currentYear);
  const canGoNext = canNavigateToNextMonth(currentMonth, currentYear);

  const handlePrevMonth = () => {
    const { month, year } = getPreviousMonth(currentMonth, currentYear);
    setCurrentMonth(month);
    setCurrentYear(year);
  };

  const handleNextMonth = () => {
    const { month, year } = getNextMonth(currentMonth, currentYear);
    setCurrentMonth(month);
    setCurrentYear(year);
  };

  const createDateFromDay = (day: number): Date => {
    const date = new Date(currentYear, currentMonth, day);
    return normalizeDateToMidnight(date);
  };

  const isDateSelectable = (day: number): boolean => {
    const date = createDateFromDay(day);
    return isDateAvailable(date, CALENDAR_START_DATE);
  };

  const isDateSelected = (day: number): boolean => {
    const date = createDateFromDay(day);
    return date.getTime() === selectedDate.getTime();
  };

  const isDateToday = (day: number): boolean => {
    const date = createDateFromDay(day);
    return date.getTime() === todayIST.getTime();
  };

  const selectDate = (day: number) => {
    const date = createDateFromDay(day);
    if (isDateAvailable(date, CALENDAR_START_DATE)) {
      setSelectedDate(date);
    }
  };

  const state: CalendarState = {
    selectedDate,
    currentMonth,
    currentYear,
    calendarDays,
    canGoPrev,
    canGoNext,
    todayIST
  };

  const actions: CalendarActions = {
    handlePrevMonth,
    handleNextMonth,
    selectDate,
    isDateSelectable,
    isDateSelected,
    isDateToday
  };

  return { state, actions };
};