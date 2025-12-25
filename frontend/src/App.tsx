import { useState } from 'react'
import DateNavigator from './components/DateNavigator'
import Daily from './components/Daily'

function App() {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)

  if (selectedDate) {
    return <Daily selectedDate={selectedDate} onBack={() => setSelectedDate(null)} />
  }

  return <DateNavigator onDateSelect={setSelectedDate} />
}

export default App