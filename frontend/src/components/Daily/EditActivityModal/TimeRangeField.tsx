interface TimeRangeFieldProps {
  startTime: string;
  endTime: string;
  onStartChange: (value: string) => void;
  onEndChange: (value: string) => void;
  isDarkMode: boolean;
}

const TimeRangeField = ({ 
  startTime, 
  endTime, 
  onStartChange, 
  onEndChange, 
  isDarkMode 
}: TimeRangeFieldProps) => {
  return (
    <div className="grid grid-cols-2 gap-5">
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
    </div>
  );
};

export default TimeRangeField;