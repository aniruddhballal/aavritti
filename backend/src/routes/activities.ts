import { Router } from 'express';
import Activity from '../models/Activity';

const router = Router();

// Get activities for a specific date
router.get('/:date', async (req, res) => {
  try {
    const { date } = req.params;
    
    const dateActivities = await Activity.find({ date });
    
    res.json({
      date,
      activities: dateActivities,
      totalActivities: dateActivities.length,
      completedActivities: dateActivities.filter(a => a.completed).length
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch activities' });
  }
});

// Add a new activity
router.post('/', async (req, res) => {
  try {
    const { date, title, description, completed } = req.body;
    
    const newActivity = new Activity({
      date,
      title,
      description,
      timestamp: new Date().toISOString(),
      completed: completed || false
    });
    
    await newActivity.save();
    res.status(201).json(newActivity);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create activity' });
  }
});

export default router;