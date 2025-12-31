import { X } from 'lucide-react';

interface ModalHeaderProps {
  isDarkMode: boolean;
  onCancel: () => void;
}

const ModalHeader = ({ isDarkMode, onCancel }: ModalHeaderProps) => {
  return (
    <div className={`sticky top-0 border-b px-8 py-5 flex items-center justify-between transition-colors ${
      isDarkMode 
        ? 'bg-gradient-to-b from-gray-800 to-gray-800/95 border-gray-700' 
        : 'bg-gradient-to-b from-white to-gray-50 border-gray-100'
    }`}>
      <h2 className={`text-2xl font-semibold tracking-tight ${
        isDarkMode ? 'text-gray-100' : 'text-gray-800'
      }`}>
        Edit Activity
      </h2>
      <button
        onClick={onCancel}
        className={`close-btn p-2 rounded-lg ${
          isDarkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-400 hover:text-gray-600'
        }`}
        aria-label="Close modal"
      >
        <X size={20} strokeWidth={2} />
      </button>
    </div>
  );
};

export default ModalHeader;