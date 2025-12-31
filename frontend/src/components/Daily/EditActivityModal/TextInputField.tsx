interface TextInputFieldProps {
  label: string;
  value: string | number;
  onChange: (value: string) => void;
  isDarkMode: boolean;
  type?: 'text' | 'number' | 'time';
  required?: boolean;
  placeholder?: string;
  min?: string;
  helperText?: string;
}

const TextInputField = ({ 
  label, 
  value, 
  onChange, 
  isDarkMode,
  type = 'text',
  required = false,
  placeholder,
  min,
  helperText
}: TextInputFieldProps) => {
  return (
    <div>
      <label className={`block text-sm font-medium mb-2 ${
        isDarkMode ? 'text-gray-300' : 'text-gray-700'
      }`}>
        {label} {required && <span className="text-red-400">*</span>}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        min={min}
        className={`input-field w-full px-4 py-2.5 border rounded-lg focus:outline-none transition-colors ${
          isDarkMode
            ? 'bg-gray-700 border-gray-600 text-gray-100 placeholder:text-gray-500'
            : 'bg-white border-gray-200 text-gray-700 placeholder:text-gray-400'
        }`}
        placeholder={placeholder}
      />
      {helperText && (
        <div className={`text-xs mt-2 pl-1 ${
          isDarkMode ? 'text-gray-400' : 'text-gray-500'
        }`}>
          {helperText}
        </div>
      )}
    </div>
  );
};

export default TextInputField;