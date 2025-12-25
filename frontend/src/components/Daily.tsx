import { ArrowLeft } from 'lucide-react';

const Daily = ({ selectedDate, onBack }: { selectedDate: Date; onBack: () => void }) => {
  const formatDate = (date: Date) => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 
                    'July', 'August', 'September', 'October', 'November', 'December'];
    return `${days[date.getDay()]}, ${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
  };

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

        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            {formatDate(selectedDate)}
          </h1>
          <p className="text-gray-500 mb-8">View your activities and progress for this day</p>

          <div className="space-y-6">
            <div className="border-l-4 border-blue-500 pl-4">
              <h2 className="text-xl font-semibold text-gray-700 mb-2">Activities</h2>
              <p className="text-gray-600">Your daily activities will appear here...</p>
            </div>

            <div className="border-l-4 border-green-500 pl-4">
              <h2 className="text-xl font-semibold text-gray-700 mb-2">Progress</h2>
              <p className="text-gray-600">Your progress tracking will appear here...</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Daily;