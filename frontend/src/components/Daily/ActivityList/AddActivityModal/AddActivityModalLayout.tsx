import { X, Plus } from 'lucide-react';
import { useDarkMode } from '../../../../contexts/DarkModeContext';
import { ModalStyles } from './styles/ModalStyles';

interface AddActivityModalLayoutProps {
  isOpen: boolean;
  isSubmitting: boolean;
  onClose: () => void;
  onSubmit: () => void;
  children: React.ReactNode;
}

const AddActivityModalLayout = ({
  isOpen,
  isSubmitting,
  onClose,
  onSubmit,
  children,
}: AddActivityModalLayoutProps) => {
  const { isDarkMode } = useDarkMode();

  if (!isOpen) return null;

  return (
    <>
      <ModalStyles />
      <div className="fixed inset-0 bg-black/50 backdrop-blur-lg flex items-center justify-center p-4 z-50">
        <div className={`modal-content rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col transition-colors ${
          isDarkMode ? 'bg-gray-800' : 'bg-white'
        }`}>
          {/* Header */}
          <div className={`sticky top-0 border-b px-8 py-5 flex items-center justify-between transition-colors ${
            isDarkMode 
              ? 'bg-gradient-to-b from-gray-800 to-gray-800/95 border-gray-700' 
              : 'bg-gradient-to-b from-white to-gray-50 border-gray-100'
          }`}>
            <h2 className={`text-2xl font-semibold tracking-tight ${
              isDarkMode ? 'text-gray-100' : 'text-gray-800'
            }`}>
              Add Activity
            </h2>
            <button
              onClick={onClose}
              className={`close-btn p-2 rounded-lg ${
                isDarkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-400 hover:text-gray-600'
              }`}
              aria-label="Close modal"
            >
              <X size={20} strokeWidth={2} />
            </button>
          </div>

          {/* Scrollable Body */}
          <div className="overflow-y-auto flex-1">
            <div className="p-8 space-y-6">
              {children}
            </div>
          </div>

          {/* Footer */}
          <div className={`sticky bottom-0 border-t px-8 py-5 transition-colors ${
            isDarkMode 
              ? 'bg-gradient-to-t from-gray-800 to-gray-800/95 border-gray-700' 
              : 'bg-gradient-to-t from-gray-50 to-white border-gray-100'
          }`}>
            <div className="flex gap-3 justify-end">
              <button
                type="button"
                onClick={onClose}
                className={`btn-secondary px-6 py-2.5 border rounded-lg font-medium ${
                  isDarkMode
                    ? 'border-gray-600 text-gray-300'
                    : 'border-gray-300 text-gray-700'
                }`}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={onSubmit}
                disabled={isSubmitting}
                className="btn-primary px-6 py-2.5 bg-green-500 text-white rounded-lg font-medium flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                <Plus size={18} className="icon-hover" strokeWidth={2} />
                {isSubmitting ? 'Adding...' : 'Add Activity'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AddActivityModalLayout;