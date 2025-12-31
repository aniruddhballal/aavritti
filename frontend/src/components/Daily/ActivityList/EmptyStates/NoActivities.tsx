import { useDarkMode } from '../../../../contexts/DarkModeContext';

const NoActivities = () => {
  const { isDarkMode } = useDarkMode();

  return (
    <div className={`text-center py-8 ${
      isDarkMode ? 'text-gray-400' : 'text-gray-500'
    }`}>
      No activities recorded for this day
    </div>
  );
};

export default NoActivities;