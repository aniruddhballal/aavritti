interface CalendarHeaderProps {
  formattedDate: string;
  isDarkMode: boolean;
}

const CalendarHeader = ({ formattedDate, isDarkMode }: CalendarHeaderProps) => {
  return (
    <div className="mb-6 text-center">
      <h2 className={`text-2xl font-bold ${
        isDarkMode ? 'text-gray-100' : 'text-gray-800'
      }`}>
        {formattedDate}
      </h2>
    </div>
  );
};

export default CalendarHeader;