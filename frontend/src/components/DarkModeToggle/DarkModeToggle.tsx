import { Moon, Sun } from 'lucide-react';
import { useDarkMode } from '../../contexts/DarkModeContext';

const DarkModeToggle = () => {
  const { isDarkMode, toggleDarkMode } = useDarkMode();

  return (
    <button
      onClick={toggleDarkMode}
      className={`p-2 rounded-lg transition-all ${
        isDarkMode
          ? 'bg-gray-700 text-yellow-400 hover:bg-gray-600'
          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
      }`}
      title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
      aria-label="Toggle Dark Mode"
    >
      {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
    </button>
  );
};

export default DarkModeToggle;