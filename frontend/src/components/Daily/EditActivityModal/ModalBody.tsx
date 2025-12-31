import SelectField from './SelectField';
import TextInputField from './TextInputField';
import TextAreaField from './TextAreaField';
import TimeRangeField from './TimeRangeField';

interface ModalBodyProps {
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
  isDarkMode: boolean;
}

const ModalBody = ({
  editForm,
  validationError,
  categories,
  editSubcategories,
  onEditChange,
  isDarkMode
}: ModalBodyProps) => {
  const categoryOptions = categories.map(cat => ({
    value: cat.value,
    label: cat.label
  }));

  const subcategoryOptions = [
    { value: '', label: 'Select a subcategory' },
    ...editSubcategories.map(sub => ({
      value: sub,
      label: sub.charAt(0).toUpperCase() + sub.slice(1)
    }))
  ];

  const durationHelperText = `${editForm.duration} minutes = ${Math.floor(editForm.duration / 60)}h ${editForm.duration % 60}m`;

  return (
    <div className="overflow-y-auto flex-1">
      <div className="p-8 space-y-6">
        <SelectField
          label="Category"
          value={editForm.category}
          options={categoryOptions}
          onChange={(value) => onEditChange('category', value)}
          isDarkMode={isDarkMode}
          required
        />

        {editSubcategories.length > 0 && (
          <SelectField
            label="Subcategory"
            value={editForm.subcategory}
            options={subcategoryOptions}
            onChange={(value) => onEditChange('subcategory', value)}
            isDarkMode={isDarkMode}
            required
          />
        )}

        <TextInputField
          label="Title"
          value={editForm.title}
          onChange={(value) => onEditChange('title', value)}
          isDarkMode={isDarkMode}
          required
          placeholder="Enter activity title"
        />

        <TextAreaField
          label="Description"
          value={editForm.description}
          onChange={(value) => onEditChange('description', value)}
          isDarkMode={isDarkMode}
          placeholder="Add details about this activity"
        />

        <TextInputField
          label="Duration (minutes)"
          value={editForm.duration}
          onChange={(value) => onEditChange('duration', parseInt(value) || 0)}
          isDarkMode={isDarkMode}
          type="number"
          required
          min="1"
          helperText={durationHelperText}
        />

        <TimeRangeField
          startTime={editForm.startTime}
          endTime={editForm.endTime}
          onStartChange={(value) => onEditChange('startTime', value)}
          onEndChange={(value) => onEditChange('endTime', value)}
          isDarkMode={isDarkMode}
        />

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
  );
};

export default ModalBody;