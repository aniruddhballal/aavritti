interface SelectFieldProps {
  label: string;
  value: string;
  options: Array<{ value: string; label: string }>;
  onChange: (value: string) => void;
  isDarkMode: boolean;
  required?: boolean;
}

const SelectField = ({ 
  label, 
  value, 
  options, 
  onChange, 
  isDarkMode,
  required = false 
}: SelectFieldProps) => {
  return (
    <div>
      <label className={`block text-sm font-medium mb-2 ${
        isDarkMode ? 'text-gray-300' : 'text-gray-700'
      }`}>
        {label} {required && <span className="text-red-400">*</span>}
      </label>
      <div className="select-wrapper">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`input-field w-full px-4 py-2.5 border rounded-lg focus:outline-none transition-colors ${
            isDarkMode
              ? 'bg-gray-700 border-gray-600 text-gray-100'
              : 'bg-white border-gray-200 text-gray-700'
          }`}
        >
          {options.map(opt => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default SelectField;