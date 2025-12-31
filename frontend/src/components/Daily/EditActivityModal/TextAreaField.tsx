interface TextAreaFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  isDarkMode: boolean;
  rows?: number;
  placeholder?: string;
}

const TextAreaField = ({ 
  label, 
  value, 
  onChange, 
  isDarkMode,
  rows = 4,
  placeholder
}: TextAreaFieldProps) => {
  return (
    <div>
      <label className={`block text-sm font-medium mb-2 ${
        isDarkMode ? 'text-gray-300' : 'text-gray-700'
      }`}>
        {label}
      </label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={rows}
        className={`input-field w-full px-4 py-2.5 border rounded-lg focus:outline-none resize-y transition-colors ${
          isDarkMode
            ? 'bg-gray-700 border-gray-600 text-gray-100 placeholder:text-gray-500'
            : 'bg-white border-gray-200 text-gray-700 placeholder:text-gray-400'
        }`}
        placeholder={placeholder}
      />
    </div>
  );
};

export default TextAreaField;