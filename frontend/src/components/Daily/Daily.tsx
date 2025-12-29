import { ArrowLeft } from 'lucide-react';
import { useDailyData } from './hooks/useDailyData';
import { useDateNavigation } from './hooks/useDateNavigation';
import { useActivityEdit } from './hooks/useActivityEdit';
import { categoryColors } from '../../utils/categoryColors';
import DailyHeader from './DailyHeader';
import DailyStats from './DailyStats';
import ActivityList from './ActivityList';
import EditActivityModal from './EditActivityModal';

const Daily = ({ selectedDate, dateString, onBack }: { selectedDate: Date; dateString: string; onBack: () => void }) => {
  const CATEGORIES = Object.keys(categoryColors);

  // Custom hooks
  const { data, loading, error, categories, fetchActivities, getTotalTime } = useDailyData(dateString);
  
  const { 
    navigateToDate, 
    canNavigatePrev, 
    canNavigateNext, 
    isToday, 
    formatDate,
    getTodayIST 
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
    categories,
    CATEGORIES,
    fetchActivities,
    (err) => console.error(err)
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
        <div className="text-gray-600">Loading activities...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
          >
            <ArrowLeft size={20} />
            <span>Back to Calendar</span>
          </button>
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
            Error: {error}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
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

        <div className="bg-white rounded-lg shadow-lg p-8 mt-6">
          <DailyStats
            activities={data?.activities || []}
            categories={CATEGORIES}
          />

          <ActivityList
            activities={data?.activities || []}
            isToday={isToday()}
            dateString={dateString}
            todayIST={getTodayIST()}
            defaultCategory={CATEGORIES[0]}
            onActivityAdded={fetchActivities}
            onEditActivity={handleEditClick}
          />
        </div>
      </div>

      {editingActivity && (
        <EditActivityModal
          editForm={editForm}
          validationError={validationError}
          categories={categories}
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