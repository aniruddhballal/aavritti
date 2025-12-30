import { X, Plus } from 'lucide-react';
import { useState, useEffect } from 'react';
import { activityService } from '../../services';
import { useDarkMode } from '../../contexts/DarkModeContext';

interface Category {
  value: string;
  label: string;
  subcategories?: string[];
}

interface AddActivityModalProps {
  isOpen: boolean;
  onClose: () => void;
  onActivityAdded: () => void;
  categories: Category[];
}

const AddActivityModal = ({
  isOpen,
  onClose,
  onActivityAdded,
  categories
}: AddActivityModalProps) => {
  const { isDarkMode } = useDarkMode();
  const [subcategories, setSubcategories] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    category: '',
    subcategory: '',
    title: '',
    duration: '',
    startTime: '',
    endTime: '',
    description: ''
  });
  const [durationMode, setDurationMode] = useState<'manual' | 'calculated'>('manual');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Get today's date in IST timezone (YYYY-MM-DD)
  const getTodayIST = () => {
    const now = new Date();
    return now.toLocaleDateString('en-CA', {
      timeZone: 'Asia/Kolkata',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  };

  const today = getTodayIST();

  // Calculate duration from start/end times
  useEffect(() => {
    if (durationMode === 'calculated' && formData.startTime && formData.endTime) {
      const start = new Date(`${today}T${formData.startTime}`);
      const end = new Date(`${today}T${formData.endTime}`);
      const diffMinutes = Math.round((end.getTime() - start.getTime()) / 60000);
      
      if (diffMinutes > 0) {
        setFormData(prev => ({ ...prev, duration: diffMinutes.toString() }));
      }
    }
  }, [formData.startTime, formData.endTime, durationMode, today]);

  // Update subcategories when category changes
  useEffect(() => {
    const selectedCategory = categories.find(cat => cat.value === formData.category);
    if (selectedCategory?.subcategories) {
      setSubcategories(selectedCategory.subcategories);
    } else {
      setSubcategories([]);
      setFormData(prev => ({ ...prev, subcategory: '' }));
    }
  }, [formData.category, categories]);

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setFormData({
        category: '',
        subcategory: '',
        title: '',
        duration: '',
        startTime: '',
        endTime: '',
        description: ''
      });
      setDurationMode('manual');
      setError('');
    }
  }, [isOpen]);

  const handleSubmit = async () => {
    setError('');

    // Convert duration from HH:MM to minutes
    let durationInMinutes = 0;
    
    if (durationMode === 'manual') {
      const timeParts = formData.duration.split(':');
      if (timeParts.length !== 2) {
        setError('Please enter duration in HH:MM format');
        return;
      }
      const hours = parseInt(timeParts[0]) || 0;
      const minutes = parseInt(timeParts[1]) || 0;
      durationInMinutes = hours * 60 + minutes;
    } else {
      durationInMinutes = parseInt(formData.duration);
    }

    if (!durationInMinutes || durationInMinutes <= 0) {
      setError('Please provide a valid duration');
      return;
    }

    setIsSubmitting(true);

    try {
      const activityData = {
        date: today,
        category: formData.category,
        title: formData.title,
        duration: durationInMinutes,
        description: formData.description,
        ...(formData.subcategory && { subcategory: formData.subcategory }),
        ...(formData.startTime && { startTime: formData.startTime }),
        ...(formData.endTime && { endTime: formData.endTime })
      };

      await activityService.createActivity(activityData); 

      onActivityAdded();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add activity');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleDurationModeChange = (mode: 'manual' | 'calculated') => {
    setDurationMode(mode);
    setFormData(prev => ({
      ...prev,
      duration: '',
      startTime: '',
      endTime: ''
    }));
  };

  if (!isOpen) return null;

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
          box-shadow: 0 4px 12px rgba(34, 197, 94, ${isDarkMode ? '0.35' : '0.25'});
        }

        .btn-primary:not(:disabled):active {
          transform: translateY(0);
          box-shadow: 0 2px 6px rgba(34, 197, 94, ${isDarkMode ? '0.25' : '0.2'});
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

        .icon-hover {
          transition: transform 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .btn-primary:not(:disabled):hover .icon-hover {
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

        .mode-btn {
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .mode-btn:not(.active):hover {
          ${isDarkMode ? 'background-color: #4b5563;' : 'background-color: #e2e8f0;'}
          transform: translateY(-1px);
        }

        .mode-btn.active {
          box-shadow: 0 2px 8px rgba(34, 197, 94, ${isDarkMode ? '0.3' : '0.2'});
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
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className={`input-field w-full px-4 py-2.5 border rounded-lg focus:outline-none transition-colors ${
                      isDarkMode
                        ? 'bg-gray-700 border-gray-600 text-gray-100'
                        : 'bg-white border-gray-200 text-gray-700'
                    }`}
                  >
                    <option value="">Select a category</option>
                    {categories.map(cat => (
                      <option key={cat.value} value={cat.value}>
                        {cat.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {subcategories.length > 0 && (
                <div>
                  <label className={`block text-sm font-medium mb-2 ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Subcategory <span className="text-red-400">*</span>
                  </label>
                  <div className="select-wrapper">
                    <select
                      name="subcategory"
                      value={formData.subcategory}
                      onChange={handleChange}
                      className={`input-field w-full px-4 py-2.5 border rounded-lg focus:outline-none transition-colors ${
                        isDarkMode
                          ? 'bg-gray-700 border-gray-600 text-gray-100'
                          : 'bg-white border-gray-200 text-gray-700'
                      }`}
                    >
                      <option value="">Select a subcategory</option>
                      {subcategories.map(sub => (
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
                  Activity Title <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="e.g., Morning Run"
                  className={`input-field w-full px-4 py-2.5 border rounded-lg focus:outline-none transition-colors ${
                    isDarkMode
                      ? 'bg-gray-700 border-gray-600 text-gray-100 placeholder:text-gray-500'
                      : 'bg-white border-gray-200 text-gray-700 placeholder:text-gray-400'
                  }`}
                />
              </div>

              <div>
                <label className={`block text-sm font-medium mb-3 ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Duration Input Method <span className="text-red-400">*</span>
                </label>
                <div className="flex gap-3 mb-4">
                  <button
                    type="button"
                    onClick={() => handleDurationModeChange('manual')}
                    className={`mode-btn flex-1 px-4 py-2.5 rounded-lg font-medium ${
                      durationMode === 'manual'
                        ? 'bg-green-500 text-white active'
                        : isDarkMode
                          ? 'bg-gray-700 text-gray-300'
                          : 'bg-gray-200 text-gray-700'
                    }`}
                  >
                    Enter HH:MM
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDurationModeChange('calculated')}
                    className={`mode-btn flex-1 px-4 py-2.5 rounded-lg font-medium ${
                      durationMode === 'calculated'
                        ? 'bg-green-500 text-white active'
                        : isDarkMode
                          ? 'bg-gray-700 text-gray-300'
                          : 'bg-gray-200 text-gray-700'
                    }`}
                  >
                    Start/End Time
                  </button>
                </div>

                {durationMode === 'manual' ? (
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      Duration (HH:MM) <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      name="duration"
                      value={formData.duration}
                      onChange={handleChange}
                      placeholder="01:30"
                      pattern="[0-9]{1,2}:[0-5][0-9]"
                      className={`input-field w-full px-4 py-2.5 border rounded-lg focus:outline-none transition-colors ${
                        isDarkMode
                          ? 'bg-gray-700 border-gray-600 text-gray-100 placeholder:text-gray-500'
                          : 'bg-white border-gray-200 text-gray-700 placeholder:text-gray-400'
                      }`}
                    />
                    <div className={`text-xs mt-2 pl-1 ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-500'
                    }`}>
                      Enter hours and minutes (e.g., 01:30 for 1 hour 30 minutes)
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-5">
                      <div>
                        <label className={`block text-sm font-medium mb-2 ${
                          isDarkMode ? 'text-gray-300' : 'text-gray-700'
                        }`}>
                          Start Time <span className="text-red-400">*</span>
                        </label>
                        <input
                          type="time"
                          name="startTime"
                          value={formData.startTime}
                          onChange={handleChange}
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
                          End Time <span className="text-red-400">*</span>
                        </label>
                        <input
                          type="time"
                          name="endTime"
                          value={formData.endTime}
                          onChange={handleChange}
                          className={`input-field w-full px-4 py-2.5 border rounded-lg focus:outline-none transition-colors ${
                            isDarkMode
                              ? 'bg-gray-700 border-gray-600 text-gray-100'
                              : 'bg-white border-gray-200 text-gray-700'
                          }`}
                        />
                      </div>
                    </div>
                    {formData.startTime && formData.endTime && formData.duration && (
                      <div className={`rounded-lg p-3 ${
                        isDarkMode ? 'bg-blue-900/30' : 'bg-blue-50'
                      }`}>
                        <div className={`text-sm font-medium ${
                          isDarkMode ? 'text-blue-300' : 'text-blue-700'
                        }`}>
                          Calculated Duration: {formData.duration} minutes ({Math.floor(parseInt(formData.duration) / 60)}h {parseInt(formData.duration) % 60}m)
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Add details, links, or proof of activity..."
                  rows={4}
                  className={`input-field w-full px-4 py-2.5 border rounded-lg focus:outline-none resize-y transition-colors ${
                    isDarkMode
                      ? 'bg-gray-700 border-gray-600 text-gray-100 placeholder:text-gray-500'
                      : 'bg-white border-gray-200 text-gray-700 placeholder:text-gray-400'
                  }`}
                />
              </div>

              {error && (
                <div className={`error-alert border rounded-lg p-4 text-sm flex items-start gap-2 ${
                  isDarkMode
                    ? 'bg-red-900/30 border-red-800 text-red-300'
                    : 'bg-red-50 border-red-200 text-red-700'
                }`}>
                  <span className="text-base">⚠️</span>
                  <span>{error}</span>
                </div>
              )}
            </div>
          </div>

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
                onClick={handleSubmit}
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

export default AddActivityModal;