import { Router } from 'express';
import Category from '../models/Category';

const router = Router();

// Suggest categories based on partial match
router.get('/categories', async (req, res) => {
  try {
    const query = String(req.query.q || '').trim().toLowerCase();
    
    // If no query, return top categories by usage
    const filter = query 
      ? { name: { $regex: `^${query}`, $options: 'i' } }  // Starts with (faster)
      : {};

    const categories = await Category.find(filter)
      .sort({ usageCount: -1, name: 1 })  // Secondary sort by name
      .select('displayName name usageCount color subcategories')  // ✅ Include subcategories
      .lean();  // Performance boost

    // ✅ Return full structure with subcategories
    res.json(categories.map(c => ({
      name: c.name,                    // Normalized name (lowercase)
      displayName: c.displayName,      // Original display name
      color: c.color,
      usageCount: c.usageCount || 0,
      subcategories: (c.subcategories || []).map(sub => ({
        name: sub.name,
        displayName: sub.displayName,
        usageCount: sub.usageCount || 0
      }))
    })));
  } catch (error) {
    console.error('Error fetching category suggestions:', error);
    res.status(500).json({ error: 'Failed to fetch suggestions' });
  }
});

// Suggest subcategories for a given category
router.get('/subcategories', async (req, res) => {
  try {
    const categoryQuery = String(req.query.category || '').trim().toLowerCase();
    const subQuery = String(req.query.q || '').trim().toLowerCase();

    if (!categoryQuery) {
      return res.json([]);
    }

    const category = await Category.findOne({ name: categoryQuery })
      .select('subcategories')
      .lean();

    if (!category || !category.subcategories?.length) {
      return res.json([]);
    }

    // Filter and sort subcategories
    const suggestions = category.subcategories
      .filter(sub => 
        !subQuery || sub.name.startsWith(subQuery)  // Starts with (more intuitive)
      )
      .sort((a, b) => {
        // Sort by usage, then alphabetically
        if (b.usageCount !== a.usageCount) {
          return b.usageCount - a.usageCount;
        }
        return a.name.localeCompare(b.name);
      })
      .slice(0, 10)  // Increased from 5
      .map(sub => sub.displayName);

    res.json(suggestions);
  } catch (error) {
    console.error('Error fetching subcategory suggestions:', error);
    res.status(500).json({ error: 'Failed to fetch suggestions' });
  }
});

export default router;