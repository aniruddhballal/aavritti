import { X, Save, Trash2 } from 'lucide-react';
import { useDarkMode } from '../../../contexts/DarkModeContext';

interface EditActivityModalProps {
  editForm: {
    title: string;
    description: string;
    category: string;
    subcategory: string;
    duration: number;
    startTime: string;
    endTime: string;
  };
  validationError: string;
  categories: Array<{value: string; label: string; subcategories?: string[]}>;
  editSubcategories: string[];
  onEditChange: (field: string, value: any) => void;
  onSave: () => void;
  onDelete: () => void;
  onCancel: () => void;
}

const EditActivityModal = ({
  editForm,
  validationError,
  categories,
  editSubcategories,
  onEditChange,
  onSave,
  onDelete,
  onCancel
}: EditActivityModalProps) => {
  const { isDarkMode } = useDarkMode();

  return (
    <>
      <style>{`
        @keyframes modalFadeIn {
          from {
            opacity: 0;
            transform: scale(0.96);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        .modal-content {
          animation: modalFadeIn 0.2s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .input-field {
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .input-field:hover {
          ${isDarkMode ? 'border-color: #4b5563;' : 'border-color: #cbd5e1;'}
          ${isDarkMode ? 'background-color: #374151;' : 'background-color: #fafafa;'}
        }

        .input-field:focus {
          ${isDarkMode ? 'border-color: #60a5fa;' : 'border-color: #93c5fd;'}
          ${isDarkMode ? 'background-color: #1f2937;' : 'background-color: #ffffff;'}
          box-shadow: 0 0 0 3px rgba(59, 130, 246, ${isDarkMode ? '0.15' : '0.08'});
        }

        .btn-primary {
          position: relative;
          overflow: hidden;
          transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .btn-primary:not(:disabled):hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(59, 130, 246, ${isDarkMode ? '0.35' : '0.25'});
        }

        .btn-primary:not(:disabled):active {
          transform: translateY(0);
          box-shadow: 0 2px 6px rgba(59, 130, 246, ${isDarkMode ? '0.25' : '0.2'});
        }

        .btn-primary::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(
            90deg,
            transparent,
            rgba(255, 255, 255, ${isDarkMode ? '0.2' : '0.3'}),
            transparent
          );
          transition: left 0.5s;
        }

        .btn-primary:not(:disabled):hover::before {
          left: 100%;
        }

        .btn-secondary {
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .btn-secondary:hover {
          ${isDarkMode ? 'background-color: #374151;' : 'background-color: #f8fafc;'}
          ${isDarkMode ? 'border-color: #6b7280;' : 'border-color: #94a3b8;'}
          transform: translateY(-1px);
          box-shadow: 0 2px 6px rgba(0, 0, 0, ${isDarkMode ? '0.15' : '0.06'});
        }

        .btn-secondary:active {
          transform: translateY(0);
        }

        .btn-delete {
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .btn-delete:hover {
          background-color: #ef4444;
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(239, 68, 68, ${isDarkMode ? '0.35' : '0.25'});
        }

        .btn-delete:active {
          transform: translateY(0);
          box-shadow: 0 2px 6px rgba(239, 68, 68, ${isDarkMode ? '0.25' : '0.2'});
        }

        .icon-hover {
          transition: transform 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .btn-primary:not(:disabled):hover .icon-hover,
        .btn-delete:hover .icon-hover {
          transform: scale(1.1);
        }

        .close-btn {
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .close-btn:hover {
          ${isDarkMode ? 'background-color: #374151;' : 'background-color: #f1f5f9;'}
          transform: rotate(90deg);
        }

        .close-btn:active {
          ${isDarkMode ? 'background-color: #4b5563;' : 'background-color: #e2e8f0;'}
        }

        .select-wrapper {
          position: relative;
        }

        .select-wrapper::after {
          content: '';
          position: absolute;
          right: 12px;
          top: 50%;
          transform: translateY(-50%);
          width: 0;
          height: 0;
          border-left: 4px solid transparent;
          border-right: 4px solid transparent;
          border-top: 5px solid ${isDarkMode ? '#9ca3af' : '#64748b'};
          pointer-events: none;
          transition: transform 0.2s ease;
        }

        .select-wrapper:hover::after {
          border-top-color: ${isDarkMode ? '#d1d5db' : '#475569'};
        }

        select {
          appearance: none;
          -webkit-appearance: none;
          -moz-appearance: none;
        }

        .error-alert {
          animation: modalFadeIn 0.2s ease-out;
        }
      `}</style>

      <div className="fixed inset-0 bg-black/50 backdrop-blur-lg flex items-center justify-center p-4 z-50">
        <div className={`modal-content rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col transition-colors ${
          isDarkMode ? 'bg-gray-800' : 'bg-white'
        }`}>
          <div className={`sticky top-0 border-b px-8 py-5 flex items-center justify-between transition-colors ${
            isDarkMode 
              ? 'bg-gradient-to-b from-gray-800 to-gray-800/95 border-gray-700' 
              : 'bg-gradient-to-b from-white to-gray-50 border-gray-100'
          }`}>
            <h2 className={`text-2xl font-semibold tracking-tight ${
              isDarkMode ? 'text-gray-100' : 'text-gray-800'
            }`}>
              Edit Activity
            </h2>
            <button
              onClick={onCancel}
              className={`close-btn p-2 rounded-lg ${
                isDarkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-400 hover:text-gray-600'
              }`}
              aria-label="Close modal"
            >
              <X size={20} strokeWidth={2} />
            </button>
          </div>

          <div className="overflow-y-auto flex-1">
            <div className="p-8 space-y-6">
              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Category <span className="text-red-400">*</span>
                </label>
                <div className="select-wrapper">
                  <select
                    value={editForm.category}
                    onChange={(e) => onEditChange('category', e.target.value)}
                    className={`input-field w-full px-4 py-2.5 border rounded-lg focus:outline-none transition-colors ${
                      isDarkMode
                        ? 'bg-gray-700 border-gray-600 text-gray-100'
                        : 'bg-white border-gray-200 text-gray-700'
                    }`}
                  >
                    {categories.map(cat => (
                      <option key={cat.value} value={cat.value}>
                        {cat.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {editSubcategories.length > 0 && (
                <div>
                  <label className={`block text-sm font-medium mb-2 ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Subcategory <span className="text-red-400">*</span>
                  </label>
                  <div className="select-wrapper">
                    <select
                      value={editForm.subcategory}
                      onChange={(e) => onEditChange('subcategory', e.target.value)}
                      className={`input-field w-full px-4 py-2.5 border rounded-lg focus:outline-none transition-colors ${
                        isDarkMode
                          ? 'bg-gray-700 border-gray-600 text-gray-100'
                          : 'bg-white border-gray-200 text-gray-700'
                      }`}
                    >
                      <option value="">Select a subcategory</option>
                      {editSubcategories.map(sub => (
                        <option key={sub} value={sub}>
                          {sub.charAt(0).toUpperCase() + sub.slice(1)}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Title <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={editForm.title}
                  onChange={(e) => onEditChange('title', e.target.value)}
                  className={`input-field w-full px-4 py-2.5 border rounded-lg focus:outline-none transition-colors ${
                    isDarkMode
                      ? 'bg-gray-700 border-gray-600 text-gray-100 placeholder:text-gray-500'
                      : 'bg-white border-gray-200 text-gray-700 placeholder:text-gray-400'
                  }`}
                  placeholder="Enter activity title"
                />
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Description
                </label>
                <textarea
                  value={editForm.description}
                  onChange={(e) => onEditChange('description', e.target.value)}
                  rows={4}
                  className={`input-field w-full px-4 py-2.5 border rounded-lg focus:outline-none resize-y transition-colors ${
                    isDarkMode
                      ? 'bg-gray-700 border-gray-600 text-gray-100 placeholder:text-gray-500'
                      : 'bg-white border-gray-200 text-gray-700 placeholder:text-gray-400'
                  }`}
                  placeholder="Add details about this activity"
                />
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Duration (minutes) <span className="text-red-400">*</span>
                </label>
                <input
                  type="number"
                  value={editForm.duration}
                  onChange={(e) => onEditChange('duration', parseInt(e.target.value) || 0)}
                  min="1"
                  className={`input-field w-full px-4 py-2.5 border rounded-lg focus:outline-none transition-colors ${
                    isDarkMode
                      ? 'bg-gray-700 border-gray-600 text-gray-100'
                      : 'bg-white border-gray-200 text-gray-700'
                  }`}
                />
                <div className={`text-xs mt-2 pl-1 ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  {editForm.duration} minutes = {Math.floor(editForm.duration / 60)}h {editForm.duration % 60}m
                </div>
              </div>

              <div className="grid grid-cols-2 gap-5">
                <div>
                  <label className={`block text-sm font-medium mb-2 ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Start Time
                  </label>
                  <input
                    type="time"
                    value={editForm.startTime}
                    onChange={(e) => onEditChange('startTime', e.target.value)}
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
                    value={editForm.endTime}
                    onChange={(e) => onEditChange('endTime', e.target.value)}
                    className={`input-field w-full px-4 py-2.5 border rounded-lg focus:outline-none transition-colors ${
                      isDarkMode
                        ? 'bg-gray-700 border-gray-600 text-gray-100'
                        : 'bg-white border-gray-200 text-gray-700'
                    }`}
                  />
                </div>
              </div>

              {validationError && (
                <div className={`error-alert border rounded-lg p-4 text-sm flex items-start gap-2 ${
                  isDarkMode
                    ? 'bg-red-900/30 border-red-800 text-red-300'
                    : 'bg-red-50 border-red-200 text-red-700'
                }`}>
                  <span className="text-base">⚠️</span>
                  <span>{validationError}</span>
                </div>
              )}
            </div>
          </div>

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
        </div>
      </div>
    </>
  );
};

export default EditActivityModal;