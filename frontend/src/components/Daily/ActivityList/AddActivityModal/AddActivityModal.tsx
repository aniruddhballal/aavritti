import AddActivityModalLayout from './AddActivityModalLayout';
import CategoryFields from './components/CategoryFields';
import ActivityDetailsFields from './components/ActivityDetailsFields';
import DurationSection from './components/DurationSection';
import FormErrorAlert from './components/FormErrorAlert';
import { useAddActivityForm } from './hooks/useAddActivityForm';
import type { Category } from './types';

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
  const {
    formData,
    isSubmitting,
    error,
    subcategories,
    handleChange,
    handleSubmit,
  } = useAddActivityForm({
    isOpen,
    categories,
    onActivityAdded,
    onClose,
  });

  return (
    <AddActivityModalLayout
      isOpen={isOpen}
      isSubmitting={isSubmitting}
      onClose={onClose}
      onSubmit={handleSubmit}
    >
      <CategoryFields
        categories={categories}
        subcategories={subcategories}
        selectedCategory={formData.category}
        selectedSubcategory={formData.subcategory}
        onChange={handleChange}
      />

      <ActivityDetailsFields
        title={formData.title}
        description={formData.description}
        onChange={handleChange}
      />

      <DurationSection
        duration={formData.duration}
        startTime={formData.startTime}
        endTime={formData.endTime}
        onChange={handleChange}
      />

      <FormErrorAlert error={error} />
    </AddActivityModalLayout>
  );
};

export default AddActivityModal;