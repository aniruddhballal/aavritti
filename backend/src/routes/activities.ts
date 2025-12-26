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

// Add a new activity (only for today's date in IST)
router.post('/', async (req, res) => {
  try {
    const { date, category, title, description, duration, startTime, endTime } = req.body;
    
    // Validate that the date is today IN IST TIMEZONE
    const today = new Date().toLocaleDateString('en-CA', { 
      timeZone: 'Asia/Kolkata',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
    
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
      startTime: startTime || undefined, // Include if provided
      endTime: endTime || undefined, // Include if provided
      timestamp: new Date().toISOString()
    });
    
    await newActivity.save();
    res.status(201).json(newActivity);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create activity' });
  }
});

// Update an existing activity
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { category, title, description, duration, startTime, endTime } = req.body;
    
    // Find the activity first
    const activity = await Activity.findById(id);
    
    if (!activity) {
      return res.status(404).json({ error: 'Activity not found' });
    }
    
    // Validate category if provided
    if (category && !Object.values(ActivityCategory).includes(category)) {
      return res.status(400).json({ error: 'Invalid category' });
    }
    
    // Update fields
    if (category) activity.category = category;
    if (title) activity.title = title;
    if (description !== undefined) activity.description = description;
    if (duration) activity.duration = Number(duration);
    if (startTime !== undefined) activity.startTime = startTime;
    if (endTime !== undefined) activity.endTime = endTime;
    
    await activity.save();
    res.json(activity);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update activity' });
  }
});

export default router;