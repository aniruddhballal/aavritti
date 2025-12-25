import { Router } from 'express';
import Activity, { ActivityCategory } from '../models/Activity';

const router = Router();

// Get activities for a specific date
router.get('/:date', async (req, res) => {
  try {
    const { date } = req.params;
    
    const dateActivities = await Activity.find({ date }).sort({ timestamp: -1 });
    
    res.json({
      date,
      activities: dateActivities,
      totalActivities: dateActivities.length,
      totalDuration: dateActivities.reduce((sum, a) => sum + a.duration, 0)
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch activities' });
  }
});

// Get all categories
router.get('/meta/categories', (_req, res) => {
  res.json({
    categories: Object.values(ActivityCategory).map(cat => ({
      value: cat,
      label: cat.charAt(0).toUpperCase() + cat.slice(1)
    }))
  });
});

// Add a new activity (only for today's date)
router.post('/', async (req, res) => {
  try {
    const { date, category, title, description, duration } = req.body;
    
    // Validate that the date is today
    const today = new Date().toISOString().split('T')[0];
    if (date !== today) {
      return res.status(400).json({ 
        error: 'You can only add activities for today' 
      });
    }
    
    // Validate category
    if (!Object.values(ActivityCategory).includes(category)) {
      return res.status(400).json({ 
        error: 'Invalid category' 
      });
    }
    
    // Validate required fields
    if (!title || !duration) {
      return res.status(400).json({ 
        error: 'Title and duration are required' 
      });
    }
    
    const newActivity = new Activity({
      date,
      category,
      title,
      description: description || '',
      duration: Number(duration),
      timestamp: new Date().toISOString()
    });
    
    await newActivity.save();
    res.status(201).json(newActivity);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create activity' });
  }
});

export default router;