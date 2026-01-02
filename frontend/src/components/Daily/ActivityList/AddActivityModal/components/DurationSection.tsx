import { useDarkMode } from '../../../../../contexts/DarkModeContext';

interface DurationSectionProps {
  duration: string;
  startTime: string;
  endTime: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const DurationSection = ({
  duration,
  startTime,
  endTime,
  onChange,
}: DurationSectionProps) => {
  const { isDarkMode } = useDarkMode();

  return (
    <div>
      <label className={`block text-sm font-medium mb-3 ${
        isDarkMode ? 'text-gray-300' : 'text-gray-700'
      }`}>
        Duration <span className="text-red-400">*</span>
      </label>

      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-5">
          <div>
            <label className={`block text-sm font-medium mb-2 ${
              isDarkMode ? 'text-gray-300' : 'text-gray-700'
            }`}>
              Start Time <span className="text-red-400">*</span>
            </label>
            <input
              type="time"
              name="startTime"
              value={startTime}
              onChange={onChange}
              className={`input-field w-full px-4 py-2.5 border rounded-lg focus:outline-none transition-colors ${
                isDarkMode
                  ? 'bg-gray-700 border-gray-600 text-gray-100'
                  : 'bg-white border-gray-200 text-gray-700'
              }`}
            />
          </div>
          <div>
            <label className={`block text-sm font-medium mb-2 ${
              isDarkMode ? 'text-gray-300' : 'text-gray-700'
            }`}>
              End Time <span className="text-red-400">*</span>
            </label>
            <input
              type="time"
              name="endTime"
              value={endTime}
              onChange={onChange}
              className={`input-field w-full px-4 py-2.5 border rounded-lg focus:outline-none transition-colors ${
                isDarkMode
                  ? 'bg-gray-700 border-gray-600 text-gray-100'
                  : 'bg-white border-gray-200 text-gray-700'
              }`}
            />
          </div>
        </div>
        {startTime && endTime && duration && (
          <div className={`rounded-lg p-3 ${
            isDarkMode ? 'bg-blue-900/30' : 'bg-blue-50'
          }`}>
            <div className={`text-sm font-medium ${
              isDarkMode ? 'text-blue-300' : 'text-blue-700'
            }`}>
              Calculated Duration: {duration} minutes ({Math.floor(parseInt(duration) / 60)}h {parseInt(duration) % 60}m)
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DurationSection;