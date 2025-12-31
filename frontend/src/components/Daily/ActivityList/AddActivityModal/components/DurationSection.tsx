import { useDarkMode } from '../../../../../contexts/DarkModeContext';
import type { DurationMode } from '../types';

interface DurationSectionProps {
  durationMode: DurationMode;
  duration: string;
  startTime: string;
  endTime: string;
  onModeChange: (mode: DurationMode) => void;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const DurationSection = ({
  durationMode,
  duration,
  startTime,
  endTime,
  onModeChange,
  onChange,
}: DurationSectionProps) => {
  const { isDarkMode } = useDarkMode();

  return (
    <div>
      <label className={`block text-sm font-medium mb-3 ${
        isDarkMode ? 'text-gray-300' : 'text-gray-700'
      }`}>
        Duration Input Method <span className="text-red-400">*</span>
      </label>
      <div className="flex gap-3 mb-4">
        <button
          type="button"
          onClick={() => onModeChange('manual')}
          className={`mode-btn flex-1 px-4 py-2.5 rounded-lg font-medium ${
            durationMode === 'manual'
              ? 'bg-green-500 text-white active'
              : isDarkMode
                ? 'bg-gray-700 text-gray-300'
                : 'bg-gray-200 text-gray-700'
          }`}
        >
          Enter HH:MM
        </button>
        <button
          type="button"
          onClick={() => onModeChange('calculated')}
          className={`mode-btn flex-1 px-4 py-2.5 rounded-lg font-medium ${
            durationMode === 'calculated'
              ? 'bg-green-500 text-white active'
              : isDarkMode
                ? 'bg-gray-700 text-gray-300'
                : 'bg-gray-200 text-gray-700'
          }`}
        >
          Start/End Time
        </button>
      </div>

      {durationMode === 'manual' ? (
        <div>
          <label className={`block text-sm font-medium mb-2 ${
            isDarkMode ? 'text-gray-300' : 'text-gray-700'
          }`}>
            Duration (HH:MM) <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            name="duration"
            value={duration}
            onChange={onChange}
            placeholder="01:30"
            pattern="[0-9]{1,2}:[0-5][0-9]"
            className={`input-field w-full px-4 py-2.5 border rounded-lg focus:outline-none transition-colors ${
              isDarkMode
                ? 'bg-gray-700 border-gray-600 text-gray-100 placeholder:text-gray-500'
                : 'bg-white border-gray-200 text-gray-700 placeholder:text-gray-400'
            }`}
          />
          <div className={`text-xs mt-2 pl-1 ${
            isDarkMode ? 'text-gray-400' : 'text-gray-500'
          }`}>
            Enter hours and minutes (e.g., 01:30 for 1 hour 30 minutes)
          </div>
        </div>
      ) : (
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
      )}
    </div>
  );
};

export default DurationSection;