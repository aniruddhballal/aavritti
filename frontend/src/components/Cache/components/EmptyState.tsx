import { Plus } from 'lucide-react';

interface EmptyStateProps {
  isDarkMode: boolean;
}

export const EmptyState = ({ isDarkMode }: EmptyStateProps) => (
  <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
    <div className="text-center animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className={`w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg ${
        isDarkMode
          ? 'bg-gradient-to-br from-blue-900/40 to-indigo-900/40'
          : 'bg-gradient-to-br from-blue-100 to-indigo-100'
      }`}>
        <Plus className={`w-12 h-12 ${
          isDarkMode ? 'text-blue-400' : 'text-blue-500'
        }`} />
      </div>
      <p className={`text-2xl font-bold mb-2 ${
        isDarkMode ? 'text-gray-200' : 'text-gray-700'
      }`}>
        No Cache Entries Yet
      </p>
      <p className={`text-lg ${
        isDarkMode ? 'text-gray-400' : 'text-gray-500'
      }`}>
        Click "New Cache Entry" to create your first one
      </p>
    </div>
  </div>
);