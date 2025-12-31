import { Save, Trash2 } from 'lucide-react';

interface ModalFooterProps {
  isDarkMode: boolean;
  validationError: string;
  onSave: () => void;
  onDelete: () => void;
  onCancel: () => void;
}

const ModalFooter = ({ 
  isDarkMode, 
  validationError, 
  onSave, 
  onDelete, 
  onCancel 
}: ModalFooterProps) => {
  return (
    <div className={`sticky bottom-0 border-t px-8 py-5 transition-colors ${
      isDarkMode 
        ? 'bg-gradient-to-t from-gray-800 to-gray-800/95 border-gray-700' 
        : 'bg-gradient-to-t from-gray-50 to-white border-gray-100'
    }`}>
      <div className="flex gap-3">
        <button
          onClick={onDelete}
          className={`btn-delete px-5 py-2.5 rounded-lg font-medium flex items-center justify-center gap-2 ${
            isDarkMode ? 'bg-red-600 text-white' : 'bg-red-500 text-white'
          }`}
          title="Delete activity"
        >
          <Trash2 size={18} className="icon-hover" strokeWidth={2} />
          Delete
        </button>
        <div className="flex-1"></div>
        <button
          onClick={onCancel}
          className={`btn-secondary px-6 py-2.5 border rounded-lg font-medium ${
            isDarkMode
              ? 'border-gray-600 text-gray-300'
              : 'border-gray-300 text-gray-700'
          }`}
        >
          Cancel
        </button>
        <button
          onClick={onSave}
          disabled={!!validationError}
          className="btn-primary px-6 py-2.5 bg-blue-500 text-white rounded-lg font-medium flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
        >
          <Save size={18} className="icon-hover" strokeWidth={2} />
          Save Changes
        </button>
      </div>
    </div>
  );
};

export default ModalFooter;