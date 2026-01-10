import { Router } from 'express';
import Category from '../models/Category';
import { getUniqueColor } from '../utils/colorGenerator';

const router = Router();

// Create a new category
router.post('/', async (req, res) => {
  try {
    const { name } = req.body;

    if (!name?.trim()) {
      return res.status(400).json({ error: 'Category name is required' });
    }

    const norm = (s: string) => s.trim().toLowerCase();
    const catName = norm(name);

    // Check if category already exists
    const existing = await Category.findOne({ name: catName });
    if (existing) {
      return res.status(409).json({ 
        error: 'Category already exists',
        category: {
          name: existing.name,
          displayName: existing.displayName,
          color: existing.color,
          usageCount: existing.usageCount,
          subcategories: existing.subcategories.map(sub => ({
            name: sub.name,
            displayName: sub.displayName,
            usageCount: sub.usageCount
          }))
        }
      });
    }

    // Get existing colors to avoid duplicates
    const existingCategories = await Category.find({}).select('color');
    const usedColors = existingCategories.map(cat => cat.color);

    // Create new category
    const category = await Category.create({
      name: catName,
      displayName: name.trim(),
      color: getUniqueColor(usedColors),
      usageCount: 0,
      subcategories: []
    });

    res.status(201).json({
      name: category.name,
      displayName: category.displayName,
      color: category.color,
      usageCount: category.usageCount,
      subcategories: []
    });
  } catch (error) {
    console.error('Error creating category:', error);
    res.status(500).json({ error: 'Failed to create category' });
  }
});

// Create a new subcategory for an existing category
router.post('/:categoryName/subcategories', async (req, res) => {
  try {
    const { categoryName } = req.params;
    const { name } = req.body;

    if (!name?.trim()) {
      return res.status(400).json({ error: 'Subcategory name is required' });
    }

    const norm = (s: string) => s.trim().toLowerCase();
    const catName = norm(categoryName);
    const subName = norm(name);

    // Find the category
    const category = await Category.findOne({ name: catName });
    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }

    // Check if subcategory already exists
    const existingSub = category.subcategories.find(sub => sub.name === subName);
    if (existingSub) {
      return res.status(409).json({ 
        error: 'Subcategory already exists',
        subcategory: {
          name: existingSub.name,
          displayName: existingSub.displayName,
          usageCount: existingSub.usageCount
        }
      });
    }

    // Add new subcategory
    category.subcategories.push({
      name: subName,
      displayName: name.trim(),
      usageCount: 0
    } as any);

    await category.save();

    // Get the newly created subcategory
    const newSub = category.subcategories.find(sub => sub.name === subName);

    res.status(201).json({
      name: newSub!.name,
      displayName: newSub!.displayName,
      usageCount: newSub!.usageCount
    });
  } catch (error) {
    console.error('Error creating subcategory:', error);
    res.status(500).json({ error: 'Failed to create subcategory' });
  }
});

export default router;