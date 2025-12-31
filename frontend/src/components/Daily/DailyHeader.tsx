// (Date navigation + title)
// a presentational component that renders the back button, date display with navigation arrows, and subtitle.

import { ArrowLeft, ChevronLeft, ChevronRight } from 'lucide-react';
import { useDarkMode } from '../../contexts/DarkModeContext';
import DarkModeToggle from '../DarkModeToggle/DarkModeToggle';

interface DailyHeaderProps {
  selectedDate: Date;
  formatDate: (date: Date) => string;
  canNavigatePrev: () => boolean;
  canNavigateNext: () => boolean;
  navigateToDate: (direction: 'prev' | 'next') => void;
  onBack: () => void;
  totalActivities: number;
  totalTime: string;
}

const DailyHeader = ({
  selectedDate,
  formatDate,
  canNavigatePrev,
  canNavigateNext,
  navigateToDate,
  onBack,
  totalActivities,
  totalTime
}: DailyHeaderProps) => {
  const { isDarkMode } = useDarkMode();

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={onBack}
          className={`flex items-center gap-2 transition-colors ${
            isDarkMode
              ? 'text-gray-400 hover:text-gray-100'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <ArrowLeft size={20} />
          <span>Back to Calendar</span>
        </button>
        <DarkModeToggle />
      </div>

      <div className={`rounded-lg shadow-lg p-8 transition-colors ${
        isDarkMode ? 'bg-gray-800' : 'bg-white'
      }`}>
        <div className="flex items-center justify-between mb-2">
          <button
            onClick={() => navigateToDate('prev')}
            disabled={!canNavigatePrev()}
            className={`p-2 rounded-full transition-colors ${
              canNavigatePrev()
                ? isDarkMode
                  ? 'hover:bg-gray-700 text-gray-300'
                  : 'hover:bg-gray-100 text-gray-700'
                : isDarkMode
                  ? 'text-gray-600 cursor-not-allowed'
                  : 'text-gray-300 cursor-not-allowed'
            }`}
            title="Previous day"
          >
            <ChevronLeft size={24} />
          </button>
          
          <h1 className={`text-3xl font-bold ${
            isDarkMode ? 'text-gray-100' : 'text-gray-800'
          }`}>
            {formatDate(selectedDate)}
          </h1>
          
          <button
            onClick={() => navigateToDate('next')}
            disabled={!canNavigateNext()}
            className={`p-2 rounded-full transition-colors ${
              canNavigateNext()
                ? isDarkMode
                  ? 'hover:bg-gray-700 text-gray-300'
                  : 'hover:bg-gray-100 text-gray-700'
                : isDarkMode
                  ? 'text-gray-600 cursor-not-allowed'
                  : 'text-gray-300 cursor-not-allowed'
            }`}
            title="Next day"
          >
            <ChevronRight size={24} />
          </button>
        </div>
        
        <p className={`mb-6 text-center ${
          isDarkMode ? 'text-gray-400' : 'text-gray-500'
        }`}>
          View your activities and progress for this day
        </p>
        
        {/* Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className={`rounded-lg p-6 transition-colors ${
            isDarkMode ? 'bg-blue-900/30' : 'bg-blue-50'
          }`}>
            <div className={`text-3xl font-bold ${
              isDarkMode ? 'text-blue-400' : 'text-blue-600'
            }`}>
              {totalActivities}
            </div>
            <div className={`text-sm ${
              isDarkMode ? 'text-blue-300' : 'text-blue-700'
            }`}>
              Total Activities
            </div>
          </div>
          <div className={`rounded-lg p-6 transition-colors ${
            isDarkMode ? 'bg-green-900/30' : 'bg-green-50'
          }`}>
            <div className={`text-3xl font-bold ${
              isDarkMode ? 'text-green-400' : 'text-green-600'
            }`}>
              {totalTime}
            </div>
            <div className={`text-sm ${
              isDarkMode ? 'text-green-300' : 'text-green-700'
            }`}>
              Total Time Recorded
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default DailyHeader;