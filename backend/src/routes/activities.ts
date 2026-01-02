import { Router } from 'express';
import Activity from '../models/Activity';
import Category from '../models/Category';

const router = Router();

// Get activities for a specific date
router.get('/:date', async (req, res) => {
  try {
    const { date } = req.params;

    const dateActivities = await Activity
      .find({ date })
      .sort({ createdAt: -1 });

    res.json({
      date,
      activities: dateActivities,
      totalActivities: dateActivities.length,
      totalDuration: dateActivities.reduce((sum, a) => sum + a.duration, 0)
    });
  } catch (error) {
    console.error('Error fetching activities:', error);
    res.status(500).json({ error: 'Failed to fetch activities' });
  }
});

// Get suggested categories and subcategories (replaces /meta/categories)
router.get('/meta/suggestions', async (_req, res) => {
  try {
    const categories = await Category.find()
      .sort({ usageCount: -1 })
      .lean();

    const suggestions = categories.map(cat => ({
      value: cat.name,
      label: cat.displayName,
      usageCount: cat.usageCount,
      subcategories: cat.subcategories
        .sort((a, b) => b.usageCount - a.usageCount)
        .map(sub => ({
          value: sub.name,
          label: sub.displayName,
          usageCount: sub.usageCount
        }))
    }));

    res.json({ categories: suggestions });
  } catch (error) {
    console.error('Error fetching suggestions:', error);
    res.status(500).json({ error: 'Failed to fetch suggestions' });
  }
});

// Add a new activity (only today, IST)
router.post('/', async (req, res) => {
  try {
    const { date, category, subcategory, title, description, duration, startTime, endTime } = req.body;

    // Validate today's date in IST
    const today = new Date().toLocaleDateString('en-CA', {
      timeZone: 'Asia/Kolkata',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });

    if (date !== today) {
      return res.status(400).json({ error: 'You can only add activities for today' });
    }

    // Validate required fields
    if (!category?.trim() || !title?.trim() || !duration) {
      return res.status(400).json({ error: 'Category, title, and duration are required' });
    }

    // Create activity
    const activity = await Activity.create({
      date,
      category: category.trim(),
      subcategory: subcategory?.trim() || undefined,
      title: title.trim(),
      description: description?.trim() || undefined,
      duration: Number(duration),
      startTime: startTime?.trim() || undefined,
      endTime: endTime?.trim() || undefined
    });

    // Update taxonomy (learn from this activity)
    const norm = (s: string) => s.trim().toLowerCase();
    const catName = norm(category);
    const subName = subcategory ? norm(subcategory) : null;

    // Upsert category
    const cat = await Category.findOneAndUpdate(
      { name: catName },
      {
        $setOnInsert: { name: catName, displayName: category.trim() },
        $inc: { usageCount: 1 }
      },
      { new: true, upsert: true }
    );

    // Update subcategory if provided
    if (subName && cat) {
      const existingSubIndex = cat.subcategories.findIndex(s => s.name === subName);

      if (existingSubIndex >= 0) {
        // Increment existing subcategory
        cat.subcategories[existingSubIndex].usageCount += 1;
      } else {
        // Add new subcategory
        cat.subcategories.push({
          name: subName,
          displayName: subcategory.trim(),
          usageCount: 1
        });
      }
      await cat.save();
    }

    res.status(201).json(activity);
  } catch (error) {
    console.error('Error creating activity:', error);
    res.status(500).json({ error: 'Failed to create activity' });
  }
});

// Update activity
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const activity = await Activity.findById(id);
    if (!activity) {
      return res.status(404).json({ error: 'Activity not found' });
    }

    // Apply updates with trimming for string fields
    if (updates.category) activity.category = updates.category.trim();
    if (updates.subcategory !== undefined) {
      activity.subcategory = updates.subcategory?.trim() || undefined;
    }
    if (updates.title) activity.title = updates.title.trim();
    if (updates.description !== undefined) {
      activity.description = updates.description?.trim() || undefined;
    }
    if (updates.duration) activity.duration = Number(updates.duration);
    if (updates.startTime !== undefined) {
      activity.startTime = updates.startTime?.trim() || undefined;
    }
    if (updates.endTime !== undefined) {
      activity.endTime = updates.endTime?.trim() || undefined;
    }

    await activity.save();

    res.json(activity);
  } catch (error) {
    console.error('Error updating activity:', error);
    res.status(500).json({ error: 'Failed to update activity' });
  }
});

// Delete activity
router.delete('/:id', async (req, res) => {
  try {
    const activity = await Activity.findByIdAndDelete(req.params.id);
    
    if (!activity) {
      return res.status(404).json({ error: 'Activity not found' });
    }
    
    res.json({ message: 'Activity deleted successfully', activity });
  } catch (error) {
    console.error('Error deleting activity:', error);
    res.status(500).json({ error: 'Failed to delete activity' });
  }
});

export default router;