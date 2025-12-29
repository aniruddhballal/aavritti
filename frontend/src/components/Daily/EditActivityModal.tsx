// (Edit modal)
// a modal component that handles the entire edit form UI with all form fields (category, subcategory, title, description, duration, start/end times), validation display, and action buttons (delete, cancel, save).

import { X, Save } from 'lucide-react';

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
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-800">Edit Activity</h2>
          <button
            onClick={onCancel}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Category *
            </label>
            <select
              value={editForm.category}
              onChange={(e) => onEditChange('category', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {categories.map(cat => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>

          {editSubcategories.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Subcategory *
              </label>
              <select
                value={editForm.subcategory}
                onChange={(e) => onEditChange('subcategory', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select a subcategory</option>
                {editSubcategories.map(sub => (
                  <option key={sub} value={sub}>
                    {sub.charAt(0).toUpperCase() + sub.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Title *
            </label>
            <input
              type="text"
              value={editForm.title}
              onChange={(e) => onEditChange('title', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={editForm.description}
              onChange={(e) => onEditChange('description', e.target.value)}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Duration (minutes) *
            </label>
            <input
              type="number"
              value={editForm.duration}
              onChange={(e) => onEditChange('duration', parseInt(e.target.value) || 0)}
              min="1"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <small className="text-gray-500 mt-1 block">
              {editForm.duration} minutes = {Math.floor(editForm.duration / 60)}h {editForm.duration % 60}m
            </small>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Start Time
              </label>
              <input
                type="time"
                value={editForm.startTime}
                onChange={(e) => onEditChange('startTime', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                End Time
              </label>
              <input
                type="time"
                value={editForm.endTime}
                onChange={(e) => onEditChange('endTime', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {validationError && (
            <div className="bg-red-50 border border-red-200 rounded-md p-3 text-red-700 text-sm">
              ⚠️ {validationError}
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <button
              onClick={onDelete}
              className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors flex items-center justify-center gap-2"
              title="Delete activity"
            >
              <X size={18} />
              Delete
            </button>
            <div className="flex-1"></div>
            <button
              onClick={onCancel}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={onSave}
              disabled={!!validationError}
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save size={18} />
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditActivityModal;