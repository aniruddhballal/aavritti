
// ============================================================================
// DailyErrorState.tsx
// ============================================================================
import { ArrowLeft } from 'lucide-react';

interface DailyErrorStateProps {
  error: string;
  onBack: () => void;
  isDarkMode: boolean;
}

const DailyErrorState = ({ error, onBack, isDarkMode }: DailyErrorStateProps) => (
  <div className={`min-h-screen p-4 lg:p-6 ${
    isDarkMode ? 'bg-gray-900' : 'bg-gray-50'
  }`}>
    <div className="max-w-7xl mx-auto">
      <button
        onClick={onBack}
        className={`flex items-center gap-2 mb-6 transition-colors ${
          isDarkMode
            ? 'text-gray-400 hover:text-gray-100'
            : 'text-gray-600 hover:text-gray-900'
        }`}
      >
        <ArrowLeft size={20} />
        <span>Back to Calendar</span>
      </button>
      <div className={`border rounded-lg p-4 ${
        isDarkMode
          ? 'bg-red-900/20 border-red-800 text-red-300'
          : 'bg-red-50 border-red-200 text-red-700'
      }`}>
        Error: {error}
      </div>
    </div>
  </div>
);

export default DailyErrorState;