import { useNavigate, useParams } from 'react-router-dom';
import Daily from './Daily';

function DailyWrapper() {
  const navigate = useNavigate();
  const { date } = useParams<{ date: string }>();
  
  if (!date) {
    navigate('/');
    return null;
  }
  
  const selectedDate = new Date(date);
  
  return <Daily selectedDate={selectedDate} dateString={date} onBack={() => navigate('/')} />;
}

export default DailyWrapper;