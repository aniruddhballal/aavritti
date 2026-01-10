interface TimeRangeFieldProps {
  startTime: string;
  endTime: string;
  onStartChange: (value: string) => void;
  onEndChange: (value: string) => void;
  isDarkMode: boolean;
  duration?: number; // Optional duration to display
}

const TimeRangeField = ({ 
  startTime, 
  endTime, 
  onStartChange, 
  onEndChange, 
  isDarkMode,
  duration 
}: TimeRangeFieldProps) => {
  return (
    <div className="grid grid-cols-3 gap-4">
      <div>
        <label className={`block text-sm font-medium mb-2 ${
          isDarkMode ? 'text-gray-300' : 'text-gray-700'
        }`}>
          Start Time
        </label>
        <input
          type="time"
          value={startTime}
          onChange={(e) => onStartChange(e.target.value)}
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
          End Time
        </label>
        <input
          type="time"
          value={endTime}
          onChange={(e) => onEndChange(e.target.value)}
          className={`input-field w-full px-4 py-2.5 border rounded-lg focus:outline-none transition-colors ${
            isDarkMode
              ? 'bg-gray-700 border-gray-600 text-gray-100'
              : 'bg-white border-gray-200 text-gray-700'
          }`}
        />
      </div>
      
      {/* Duration Display */}
      {duration !== undefined && (
        <div>
          <label className={`block text-sm font-medium mb-2 ${
            isDarkMode ? 'text-gray-300' : 'text-gray-700'
          }`}>
            Duration
          </label>
          <div className={`px-4 py-2.5 border rounded-lg flex items-center ${
            startTime && endTime && duration > 0
              ? isDarkMode 
                ? 'bg-blue-900/20 border-blue-800' 
                : 'bg-blue-50 border-blue-200'
              : isDarkMode
                ? 'bg-gray-700 border-gray-600'
                : 'bg-gray-100 border-gray-200'
          }`}>
            <div className={`text-sm font-medium ${
              startTime && endTime && duration > 0
                ? isDarkMode ? 'text-blue-300' : 'text-blue-700'
                : isDarkMode ? 'text-gray-500' : 'text-gray-400'
            }`}>
              {startTime && endTime && duration > 0
                ? `${duration}m (${Math.floor(duration / 60)}h ${duration % 60}m)`
                : '—'}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TimeRangeField;