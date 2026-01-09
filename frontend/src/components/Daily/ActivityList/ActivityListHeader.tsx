import { Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useDarkMode } from '../../../contexts/DarkModeContext';

interface __ActivityListHeaderProps__ {
  latestEndTime?: string;
  date: string; // Add date prop to know which day we're adding to
}

const ActivityListHeader = ({ latestEndTime, date }: __ActivityListHeaderProps__) => {
  const { isDarkMode } = useDarkMode();
  const navigate = useNavigate();

  const handleAddClick = () => {
    // Allow adding activities for any day
    navigate('/add', { 
      state: { 
        suggestedStartTime: latestEndTime,
        date: date // Pass the date to the add page
      } 
    });
  };

  return (
    <>
      <style>{`
        .add-button {
          transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .add-button:hover {
          transform: translateY(-1px) rotate(90deg);
          box-shadow: 0 4px 12px rgba(16, 185, 129, ${isDarkMode ? '0.35' : '0.25'});
        }
        .add-button:active {
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
          className={`add-button p-2 mr-4 mt-4 rounded-lg ${
            isDarkMode
              ? 'text-green-400 hover:bg-green-900/30 hover:text-green-300'
              : 'text-green-600 hover:bg-green-50 hover:text-green-700'
          }`}
          title="Add Activity"
          aria-label="Add Activity"
        >
          <Plus size={24} strokeWidth={2.5} className="icon-hover" />
        </button>
      </div>
    </>
  );
};

export default ActivityListHeader;