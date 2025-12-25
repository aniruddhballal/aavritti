import express from 'express';
import cors from 'cors';

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// In-memory storage for now (we'll add a database later)
interface Activity {
  id: string;
  date: string; // YYYY-MM-DD format
  title: string;
  description: string;
  timestamp: string; // ISO string
  completed: boolean;
}

let activities: Activity[] = [
  {
    id: '1',
    date: '2025-12-25',
    title: 'Morning Workout',
    description: 'Completed 30 minute cardio session',
    timestamp: '2025-12-25T06:30:00+05:30',
    completed: true
  },
  {
    id: '2',
    date: '2025-12-25',
    title: 'Code Review',
    description: 'Reviewed PRs for the new feature',
    timestamp: '2025-12-25T10:00:00+05:30',
    completed: true
  },
  {
    id: '3',
    date: '2025-12-25',
    title: 'Team Meeting',
    description: 'Weekly sync with the team',
    timestamp: '2025-12-25T14:00:00+05:30',
    completed: false
  }
];

// Get activities for a specific date
app.get('/api/activities/:date', (req, res) => {
  const { date } = req.params;
  
  // Filter activities for the requested date
  const dateActivities = activities.filter(activity => activity.date === date);
  
  res.json({
    date,
    activities: dateActivities,
    totalActivities: dateActivities.length,
    completedActivities: dateActivities.filter(a => a.completed).length
  });
});

// Add a new activity
app.post('/api/activities', (req, res) => {
  const { date, title, description, completed } = req.body;
  
  const newActivity: Activity = {
    id: Date.now().toString(),
    date,
    title,
    description,
    timestamp: new Date().toISOString(),
    completed: completed || false
  };
  
  activities.push(newActivity);
  res.status(201).json(newActivity);
});

app.get('/', (_req, res) => {
  res.send('API running');
});

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});