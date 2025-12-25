import { Routes, Route } from 'react-router-dom'
import DateNavigator from './components/DateNavigator'
import DailyWrapper from './components/DailyWrapper'

function App() {
  return (
    <Routes>
      <Route path="/" element={<DateNavigator />} />
      <Route path="/daily/:date" element={<DailyWrapper />} />
    </Routes>
  )
}

export default App