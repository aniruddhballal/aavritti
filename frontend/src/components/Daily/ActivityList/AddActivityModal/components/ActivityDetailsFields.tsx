import { useDarkMode } from '../../../../../contexts/DarkModeContext';

interface ActivityDetailsFieldsProps {
  title: string;
  description: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
}

const ActivityDetailsFields = ({
  title,
  description,
  onChange,
}: ActivityDetailsFieldsProps) => {
  const { isDarkMode } = useDarkMode();

  return (
    <>
      <div>
        <label className={`block text-sm font-medium mb-2 ${
          isDarkMode ? 'text-gray-300' : 'text-gray-700'
        }`}>
          Activity Title <span className="text-red-400">*</span>
        </label>
        <input
          type="text"
          name="title"
          value={title}
          onChange={onChange}
          placeholder="e.g., Morning Run"
          className={`input-field w-full px-4 py-2.5 border rounded-lg focus:outline-none transition-colors ${
            isDarkMode
              ? 'bg-gray-700 border-gray-600 text-gray-100 placeholder:text-gray-500'
              : 'bg-white border-gray-200 text-gray-700 placeholder:text-gray-400'
          }`}
        />
      </div>

      <div>
        <label className={`block text-sm font-medium mb-2 ${
          isDarkMode ? 'text-gray-300' : 'text-gray-700'
        }`}>
          Description
        </label>
        <textarea
          name="description"
          value={description}
          onChange={onChange}
          placeholder="Add details, links, or proof of activity..."
          rows={4}
          className={`input-field w-full px-4 py-2.5 border rounded-lg focus:outline-none resize-y transition-colors ${
            isDarkMode
              ? 'bg-gray-700 border-gray-600 text-gray-100 placeholder:text-gray-500'
              : 'bg-white border-gray-200 text-gray-700 placeholder:text-gray-400'
          }`}
        />
      </div>
    </>
  );
};

export default ActivityDetailsFields;