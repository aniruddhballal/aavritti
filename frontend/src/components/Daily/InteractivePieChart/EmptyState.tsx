import { Sparkles } from 'lucide-react';

interface EmptyStateProps {
  isDarkMode: boolean;
  message: string;
}

export const EmptyState = ({ isDarkMode, message }: EmptyStateProps) => {
  return (
    <div className={`flex items-center justify-center h-[400px] ${
      isDarkMode ? 'text-gray-500' : 'text-gray-400'
    }`}>
      <div className="text-center">
        <Sparkles className="w-12 h-12 mx-auto mb-3 opacity-30" />
        <p className="text-sm">{message}</p>
      </div>
    </div>
  );
};