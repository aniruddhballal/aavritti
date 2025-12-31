// ============================================================================
// DailyLoadingState.tsx
// ============================================================================
interface DailyLoadingStateProps {
  isDarkMode: boolean;
}

const DailyLoadingState = ({ isDarkMode }: DailyLoadingStateProps) => (
  <div className={`min-h-screen p-6 flex items-center justify-center ${
    isDarkMode ? 'bg-gray-900' : 'bg-gray-50'
  }`}>
    <div className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>
      Loading activities...
    </div>
  </div>
);

export default DailyLoadingState;