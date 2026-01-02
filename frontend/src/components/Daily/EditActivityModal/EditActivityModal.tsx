import { useDarkMode } from '../../../contexts/DarkModeContext';
import { getModalStyles } from './styles';
import ModalHeader from './ModalHeader';
import ModalBody from './ModalBody';
import ModalFooter from './ModalFooter';

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
  editSubcategories: string[];  // ✅ Keep this (fetched dynamically)
  onEditChange: (field: string, value: any) => void;
  onSave: () => void;
  onDelete: () => void;
  onCancel: () => void;
}

const EditActivityModal = ({
  editForm,
  validationError,
  editSubcategories,  // ✅ Remove categories from here
  onEditChange,
  onSave,
  onDelete,
  onCancel
}: EditActivityModalProps) => {
  const { isDarkMode } = useDarkMode();
  
  return (
    <>
      <style>{getModalStyles(isDarkMode)}</style>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-lg flex items-center justify-center p-4 z-50">
        <div className={`modal-content rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col transition-colors ${
          isDarkMode ? 'bg-gray-800' : 'bg-white'
        }`}>
          <ModalHeader isDarkMode={isDarkMode} onCancel={onCancel} />
          
          <ModalBody
            editForm={editForm}
            validationError={validationError}
            editSubcategories={editSubcategories}  // ✅ Remove categories prop
            onEditChange={onEditChange}
            isDarkMode={isDarkMode}
          />
          
          <ModalFooter
            isDarkMode={isDarkMode}
            validationError={validationError}
            onSave={onSave}
            onDelete={onDelete}
            onCancel={onCancel}
          />
        </div>
      </div>
    </>
  );
};

export default EditActivityModal;