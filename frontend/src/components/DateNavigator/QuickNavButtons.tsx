import { Cpu, HardDrive } from 'lucide-react';

interface QuickNavButtonsProps {
  onRamClick: () => void;
  onCacheClick: () => void;
  isDarkMode: boolean;
}

const QuickNavButtons = ({ onRamClick, onCacheClick, isDarkMode }: QuickNavButtonsProps) => {
  return (
    <div className="mt-6 grid grid-cols-2 gap-4">
      <button
        onClick={onRamClick}
        className={`py-3 px-4 font-medium rounded-lg transition-colors flex items-center justify-center gap-2 ${
          isDarkMode
            ? 'bg-blue-600 hover:bg-blue-700 text-white'
            : 'bg-blue-500 hover:bg-blue-600 text-white'
        }`}
      >
        <HardDrive size={20} />
        RAM
      </button>
      <button
        onClick={onCacheClick}
        className={`py-3 px-4 font-medium rounded-lg transition-colors flex items-center justify-center gap-2 ${
          isDarkMode
            ? 'bg-green-600 hover:bg-green-700 text-white'
            : 'bg-green-500 hover:bg-green-600 text-white'
        }`}
      >
        <Cpu size={20} />
        Cache
      </button>
    </div>
  );
};

export default QuickNavButtons;