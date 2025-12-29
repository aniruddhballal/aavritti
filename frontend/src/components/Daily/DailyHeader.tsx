// (Date navigation + title)
// a presentational component that renders the back button, date display with navigation arrows, and subtitle.

import { ArrowLeft, ChevronLeft, ChevronRight } from 'lucide-react';

interface DailyHeaderProps {
  selectedDate: Date;
  formatDate: (date: Date) => string;
  canNavigatePrev: () => boolean;
  canNavigateNext: () => boolean;
  navigateToDate: (direction: 'prev' | 'next') => void;
  onBack: () => void;
}

const DailyHeader = ({
  selectedDate,
  formatDate,
  canNavigatePrev,
  canNavigateNext,
  navigateToDate,
  onBack
}: DailyHeaderProps) => {
  return (
    <>
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
      >
        <ArrowLeft size={20} />
        <span>Back to Calendar</span>
      </button>

      <div className="bg-white rounded-lg shadow-lg p-8">
        <div className="flex items-center justify-between mb-2">
          <button
            onClick={() => navigateToDate('prev')}
            disabled={!canNavigatePrev()}
            className={`p-2 rounded-full ${canNavigatePrev() ? 'hover:bg-gray-100 text-gray-700' : 'text-gray-300 cursor-not-allowed'}`}
            title="Previous day"
          >
            <ChevronLeft size={24} />
          </button>
          
          <h1 className="text-3xl font-bold text-gray-800">
            {formatDate(selectedDate)}
          </h1>
          
          <button
            onClick={() => navigateToDate('next')}
            disabled={!canNavigateNext()}
            className={`p-2 rounded-full ${canNavigateNext() ? 'hover:bg-gray-100 text-gray-700' : 'text-gray-300 cursor-not-allowed'}`}
            title="Next day"
          >
            <ChevronRight size={24} />
          </button>
        </div>
        <p className="text-gray-500 mb-8 text-center">
          View your activities and progress for this day
        </p>
      </div>
    </>
  );
};

export default DailyHeader;