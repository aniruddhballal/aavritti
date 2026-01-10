import { Router } from 'express';
import Activity from '../models/Activity';
import Category from '../models/Category';
import { getUniqueColor } from '../utils/colorGenerator';

const router = Router();

// Get activities for a specific date
router.get('/:date', async (req, res) => {
  try {
    const { date } = req.params;

    const dateActivities = await Activity
      .find({ date })
      .populate('categoryId')
      .sort({ createdAt: -1 })
      .lean();

    // Transform to include category and subcategory info
    const enrichedActivities = dateActivities.map(activity => {
      const category = activity.categoryId as any;
      let subcategoryName = null;
      
      // Find subcategory name if subcategoryId exists
      if (activity.subcategoryId && category.subcategories) {
        const subcategory = category.subcategories.find(
          (sub: any) => sub._id.toString() === activity.subcategoryId?.toString()
        );
        subcategoryName = subcategory?.displayName || null;
      }

      return {
        ...activity,
        category: category.name,
        categoryColor: category.color || '#95A5A6',
        subcategory: subcategoryName
      };
    });

    res.json({
      date,
      activities: enrichedActivities,
      totalActivities: enrichedActivities.length,
      totalDuration: enrichedActivities.reduce((sum, a) => sum + a.duration, 0)
    });
  } catch (error) {
    console.error('Error fetching activities:', error);
    res.status(500).json({ error: 'Failed to fetch activities' });
  }
});

// Get suggested categories and subcategories
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

// Add a new activity
router.post('/', async (req, res) => {
  try {
    const { date, category, subcategory, title, description, duration, startTime, endTime } = req.body;

    if (!date) {
      return res.status(400).json({ error: 'Date is required' });
    }
    
    if (!category?.trim() || !title?.trim() || !duration) {
      return res.status(400).json({ error: 'Category, title, and duration are required' });
    }

    const norm = (s: string) => s.trim().toLowerCase();
    const catName = norm(category);
    const subName = subcategory ? norm(subcategory) : null;

    // Get existing colors to avoid duplicates
    const existingCategories = await Category.find({}).select('color');
    const usedColors = existingCategories.map(cat => cat.color);

    const cat = await Category.findOneAndUpdate(
      { name: catName },
      {
        $setOnInsert: { 
          name: catName, 
          displayName: category,
          color: getUniqueColor(usedColors)
        },
        $inc: { usageCount: 1 }
      },
      { new: true, upsert: true }
    );

    let subcategoryId = null;

    // Update subcategory if provided
    if (subName && cat) {
      const existingSubIndex = cat.subcategories.findIndex(s => s.name === subName);

      if (existingSubIndex >= 0) {
        // Increment existing subcategory
        cat.subcategories[existingSubIndex].usageCount += 1;
        subcategoryId = cat.subcategories[existingSubIndex]._id;
      } else {
        // Add new subcategory
        cat.subcategories.push({
          name: subName,
          displayName: subcategory.trim(),
          usageCount: 1
        } as any);
        await cat.save();
        
        // Get the newly created subcategory ID
        const newSub = cat.subcategories.find(s => s.name === subName);
        subcategoryId = newSub?._id;
      }
      
      await cat.save();
    }

    // Create activity with categoryId and subcategoryId
    const activity = await Activity.create({
      date,
      categoryId: cat._id,
      subcategoryId: subcategoryId || undefined,
      title: title.trim(),
      description: description?.trim() || undefined,
      duration: Number(duration),
      startTime: startTime?.trim() || undefined,
      endTime: endTime?.trim() || undefined
    });

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

    // Handle category update - convert name to ID
    if (updates.category) {
      const norm = (s: string) => s.trim().toLowerCase();
      const catName = norm(updates.category);
      
      const existingCategories = await Category.find({}).select('color');
      const usedColors = existingCategories.map(cat => cat.color);
      
      const cat = await Category.findOneAndUpdate(
        { name: catName },
        {
          $setOnInsert: { 
            name: catName, 
            displayName: updates.category,
            color: getUniqueColor(usedColors)
          },
          $inc: { usageCount: 1 }
        },
        { new: true, upsert: true }
      );
      
      activity.categoryId = cat._id;
      
      // Clear subcategory when category changes
      activity.subcategoryId = undefined;
    }
    
    // Handle subcategory update - convert name to ID
    if (updates.subcategory !== undefined) {
      if (updates.subcategory === null || updates.subcategory === '') {
        activity.subcategoryId = undefined;
      } else {
        const norm = (s: string) => s.trim().toLowerCase();
        const subName = norm(updates.subcategory);
        
        // Get the category to find/create subcategory
        const cat = await Category.findById(activity.categoryId);
        
        if (cat) {
          const existingSubIndex = cat.subcategories.findIndex(s => s.name === subName);
          
          if (existingSubIndex >= 0) {
            cat.subcategories[existingSubIndex].usageCount += 1;
            activity.subcategoryId = cat.subcategories[existingSubIndex]._id;
          } else {
            cat.subcategories.push({
              name: subName,
              displayName: updates.subcategory.trim(),
              usageCount: 1
            } as any);
            await cat.save();
            
            const newSub = cat.subcategories.find(s => s.name === subName);
            activity.subcategoryId = newSub?._id;
          }
          
          await cat.save();
        }
      }
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