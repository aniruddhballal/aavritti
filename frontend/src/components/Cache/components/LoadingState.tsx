import { Sparkles } from 'lucide-react';

interface LoadingStateProps {
  isDarkMode: boolean;
}

export const LoadingState = ({ isDarkMode }: LoadingStateProps) => (
  <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
    <div className="text-center animate-in fade-in zoom-in duration-500">
      <Sparkles className={`w-12 h-12 mx-auto mb-3 animate-pulse ${
        isDarkMode ? 'text-blue-400' : 'text-blue-500'
      }`} />
      <p className={`text-xl font-semibold ${
        isDarkMode ? 'text-gray-300' : 'text-gray-600'
      }`}>
        Loading entries...
      </p>
    </div>
  </div>
);