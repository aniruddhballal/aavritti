import { ArrowLeft, Plus } from 'lucide-react';

interface CacheHeaderProps {
  isDarkMode: boolean;
  entriesCount: number;
  isCreating: boolean;
  onBack: () => void;
  onCreate: (e: React.MouseEvent<HTMLButtonElement>) => void;
}

export const CacheHeader = ({ isDarkMode, entriesCount, isCreating, onBack, onCreate }: CacheHeaderProps) => (
  <div className="absolute top-6 left-6 flex items-center gap-3 z-20">
    <button
      onClick={(e) => {
        e.stopPropagation();
        onBack();
      }}
      className={`group flex items-center gap-2 transition-all duration-200 px-4 py-2.5 rounded-xl shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 ${
        isDarkMode
          ? 'text-gray-300 hover:text-gray-100 bg-gray-800/90 backdrop-blur-sm border border-gray-700/50'
          : 'text-gray-700 hover:text-gray-900 bg-white/90 backdrop-blur-sm border border-gray-200/50'
      }`}
    >
      <ArrowLeft size={20} className="transition-transform duration-200 group-hover:-translate-x-0.5" />
      <span className="font-semibold">Back to Calendar</span>
    </button>

    <button
      onClick={onCreate}
      disabled={isCreating}
      className="group flex items-center gap-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 disabled:from-blue-300 disabled:to-blue-400 text-white px-4 py-2.5 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 font-semibold hover:scale-105 active:scale-95 disabled:cursor-not-allowed disabled:hover:scale-100"
    >
      <Plus size={20} className={`transition-transform duration-300 ${isCreating ? 'rotate-90' : 'group-hover:rotate-90'}`} />
      <span>{isCreating ? 'Creating...' : 'New Cache Entry'}</span>
    </button>

    {entriesCount > 0 && (
      <div className={`ml-2 px-4 py-2.5 rounded-xl shadow-lg border ${
        isDarkMode
          ? 'bg-gray-800/90 backdrop-blur-sm border-gray-700/50'
          : 'bg-white/90 backdrop-blur-sm border-gray-200/50'
      }`}>
        <span className={`text-sm font-semibold ${
          isDarkMode ? 'text-gray-300' : 'text-gray-600'
        }`}>
          {entriesCount} {entriesCount === 1 ? 'Entry' : 'Entries'}
        </span>
      </div>
    )}
  </div>
);