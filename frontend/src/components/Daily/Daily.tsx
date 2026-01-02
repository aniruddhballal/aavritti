import { useState } from 'react';
import { useDailyData } from './hooks/useDailyData';
import { useDateNavigation } from './hooks/useDateNavigation';
import { useActivityEdit } from './hooks/useActivityEdit';
import DailyHeader from './DailyHeader';
import EditActivityModal from './EditActivityModal/EditActivityModal';
import { useDarkMode } from '../../contexts/DarkModeContext';
import DailyLoadingState from './DailyLoadingState';
import DailyErrorState from './DailyErrorState';
import DailyPieSection from './DailyPieSection';
import DailyActivitySection from './DailyActivitySection';

const Daily = ({
  selectedDate,
  dateString,
  onBack
}: {
  selectedDate: Date;
  dateString: string;
  onBack: () => void;
}) => {
  const [leftColumnHeight, setLeftColumnHeight] = useState(0);
  const { isDarkMode } = useDarkMode();

  // Custom hooks - all data fetching and business logic
  const { data, loading, error, fetchActivities, getTotalTime } = useDailyData(dateString);
  
  const { 
    navigateToDate, 
    canNavigatePrev, 
    canNavigateNext, 
    isToday, 
    formatDate,
  } = useDateNavigation(selectedDate, dateString);

  const {
    editingActivity,
    editForm,
    validationError,
    editSubcategories,
    handleEditClick,
    handleEditChange,
    handleSaveEdit,
    handleDeleteActivity,
    handleCancelEdit
  } = useActivityEdit(
    dateString,
    fetchActivities,
    (err) => console.error(err)
  );

  // Early returns for loading and error states
  if (loading) return <DailyLoadingState isDarkMode={isDarkMode} />;
  if (error) return <DailyErrorState error={error} onBack={onBack} isDarkMode={isDarkMode} />;

  // Main layout render
  return (
    <div className={`min-h-screen p-4 lg:p-6 transition-colors ${
      isDarkMode ? 'bg-gray-900' : 'bg-gray-50'
    }`}>
      <div className="max-w-7xl mx-auto">
        <DailyHeader
          selectedDate={selectedDate}
          formatDate={formatDate}
          canNavigatePrev={canNavigatePrev}
          canNavigateNext={canNavigateNext}
          navigateToDate={navigateToDate}
          onBack={onBack}
          totalActivities={data?.totalActivities || 0}
          totalTime={getTotalTime()}
        />

        {/* Two-column layout */}
        <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
          <DailyPieSection
            activities={data?.activities}
            isDarkMode={isDarkMode}
            onHeightChange={setLeftColumnHeight}
          />

          <DailyActivitySection
            activities={data?.activities || []}
            isToday={isToday()}
            leftColumnHeight={leftColumnHeight}
            isDarkMode={isDarkMode}
            onActivityAdded={fetchActivities}
            onEditActivity={handleEditClick}
          />
        </div>
      </div>

      {editingActivity && (
        <EditActivityModal
          editForm={editForm}
          validationError={validationError}
          editSubcategories={editSubcategories}
          onEditChange={handleEditChange}
          onSave={handleSaveEdit}
          onDelete={handleDeleteActivity}
          onCancel={handleCancelEdit}
        />
      )}
    </div>
  );
};

export default Daily;