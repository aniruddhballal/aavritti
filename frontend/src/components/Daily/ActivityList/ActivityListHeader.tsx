import { Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useDarkMode } from '../../../contexts/DarkModeContext';

interface ActivityListHeaderProps {
  isToday: boolean;
  latestEndTime?: string; // Add this prop
}

const ActivityListHeader = ({ isToday, latestEndTime }: ActivityListHeaderProps) => {
  const { isDarkMode } = useDarkMode();
  const navigate = useNavigate();

  const handleAddClick = () => {
    if (isToday) {
      // Pass latestEndTime as state to the add page
      navigate('/add', { state: { suggestedStartTime: latestEndTime } });
    }
  };

  return (
    <>
      <style>{`
        .add-button {
          transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .add-button:not(:disabled):hover {
          transform: translateY(-1px) rotate(90deg);
          box-shadow: 0 4px 12px rgba(16, 185, 129, ${isDarkMode ? '0.35' : '0.25'});
        }
        .add-button:not(:disabled):active {
          transform: translateY(0) rotate(90deg);
        }
        .icon-hover {
          transition: transform 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .add-button:hover .icon-hover {
          transform: scale(1.1);
        }
      `}</style>
      
      <div className="flex items-center justify-between mb-1">
        <h2 className={`text-xl font-semibold tracking-tight ${
          isDarkMode ? 'text-gray-200' : 'text-gray-700'
        }`}>
          Activities
        </h2>
        <button
          onClick={handleAddClick}
          disabled={!isToday}
          className={`add-button p-2 mr-4 mt-4 rounded-lg ${
            isToday
              ? isDarkMode
                ? 'text-green-400 hover:bg-green-900/30 hover:text-green-300'
                : 'text-green-600 hover:bg-green-50 hover:text-green-700'
              : isDarkMode
                ? 'text-gray-600 cursor-not-allowed'
                : 'text-gray-300 cursor-not-allowed'
          }`}
          title={isToday ? 'Add Activity' : 'Can only add activities for today'}
          aria-label="Add Activity"
        >
          <Plus size={24} strokeWidth={2.5} className="icon-hover" />
        </button>
      </div>
    </>
  );
};

export default ActivityListHeader;