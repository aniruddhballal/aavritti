import { Routes, Route } from 'react-router-dom'
import DateNavigator from './components/DateNavigator/DateNavigator.tsx'
import RAM from './components/RAM/RAM.tsx'
import Cache from './components/Cache/Cache.tsx'
import DailyWrapper from './components/Daily/DailyWrapper.tsx'
import { DarkModeProvider } from './contexts/DarkModeContext';
import AddActivity from './components/AddActivity/AddActivity.tsx'

function App() {
  return (
    <DarkModeProvider>
      <Routes>
      <Route path="/" element={<DateNavigator />} />
      <Route path="/daily/:date" element={<DailyWrapper />} />
      <Route path="/add" element={<AddActivity />} />
      <Route path="/ram" element={<RAM />} />
      <Route path="/cache" element={<Cache />} />
    </Routes>
    </DarkModeProvider>
    
  )
}

export default App