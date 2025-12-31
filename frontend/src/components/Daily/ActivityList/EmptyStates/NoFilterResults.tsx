import { useDarkMode } from '../../../../contexts/DarkModeContext';

const NoFilterResults = () => {
  const { isDarkMode } = useDarkMode();

  return (
    <div className={`text-center py-8 ${
      isDarkMode ? 'text-gray-400' : 'text-gray-500'
    }`}>
      No activities match your filters
    </div>
  );
};

export default NoFilterResults;