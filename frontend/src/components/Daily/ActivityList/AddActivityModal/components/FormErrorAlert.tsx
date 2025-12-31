import { useDarkMode } from '../../../../../contexts/DarkModeContext';

interface FormErrorAlertProps {
  error: string;
}

const FormErrorAlert = ({ error }: FormErrorAlertProps) => {
  const { isDarkMode } = useDarkMode();

  if (!error) return null;

  return (
    <div className={`error-alert border rounded-lg p-4 text-sm flex items-start gap-2 ${
      isDarkMode
        ? 'bg-red-900/30 border-red-800 text-red-300'
        : 'bg-red-50 border-red-200 text-red-700'
    }`}>
      <span className="text-base">⚠️</span>
      <span>{error}</span>
    </div>
  );
};

export default FormErrorAlert;