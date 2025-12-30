import { ArrowLeft } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { useDailyData } from './hooks/useDailyData';
import { useDateNavigation } from './hooks/useDateNavigation';
import { useActivityEdit } from './hooks/useActivityEdit';
import { categoryColors } from '../../utils/categoryColors';
import DailyHeader from './DailyHeader';
import InteractivePieChart from '../InteractivePieChart';
import ActivityList from './ActivityList';
import EditActivityModal from './EditActivityModal';

const Daily = ({ selectedDate, dateString, onBack }: { selectedDate: Date; dateString: string; onBack: () => void }) => {
  const CATEGORIES = Object.keys(categoryColors);
  const leftColumnRef = useRef<HTMLDivElement>(null);
  const [leftColumnHeight, setLeftColumnHeight] = useState(0);

  // Custom hooks
  const { data, loading, error, categories, fetchActivities, getTotalTime } = useDailyData(dateString);
  
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
    categories,
    CATEGORIES,
    fetchActivities,
    (err) => console.error(err)
  );

  // Measure left column height and update right column max-height
  useEffect(() => {
    const updateHeight = () => {
      if (leftColumnRef.current) {
        const height = leftColumnRef.current.offsetHeight;
        setLeftColumnHeight(height);
      }
    };

    updateHeight();
    
    // Add resize observer to handle dynamic content changes
    const resizeObserver = new ResizeObserver(updateHeight);
    if (leftColumnRef.current) {
      resizeObserver.observe(leftColumnRef.current);
    }

    // Also listen for window resize
    window.addEventListener('resize', updateHeight);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener('resize', updateHeight);
    };
  }, [data?.activities]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
        <div className="text-gray-600">Loading activities...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 lg:p-6">
        <div className="max-w-7xl mx-auto">
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
    <div className="min-h-screen bg-gray-50 p-4 lg:p-6">
      {/* Wider max-width container for desktop */}
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

        {/* Two-column layout on large screens, stacked on mobile */}
        <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column - Pie Chart */}
          <div>
            {data?.activities && data.activities.length > 0 ? (
              <div ref={leftColumnRef}>
                <InteractivePieChart 
                  activities={data.activities} 
                  categories={CATEGORIES}
                />
              </div>
            ) : (
              <div ref={leftColumnRef} className="bg-gray-50 rounded-lg p-6">
                <div className="flex items-center justify-center h-[400px] text-gray-500">
                  No activity data to display
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Activity List */}
          <div 
            className="bg-white rounded-lg shadow-lg p-6 lg:p-8 flex flex-col overflow-hidden"
            style={{
              maxHeight: leftColumnHeight > 0 ? `${leftColumnHeight}px` : 'calc(100vh + 100px)'
            }}
          >
            <ActivityList
              activities={data?.activities || []}
              isToday={isToday()}
              defaultCategory={CATEGORIES[0]}
              onActivityAdded={fetchActivities}
              onEditActivity={handleEditClick}
            />
          </div>
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