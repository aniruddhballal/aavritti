import express, { Request, Response } from 'express';
import CacheEntry from '../models/CacheEntry';

const router = express.Router();

// Create a new cache entry
router.post('/cache-entries', async (req: Request, res: Response) => {
  try {
    const newEntry = new CacheEntry({
      timestamp: new Date(),
      title: req.body.title || '',
      body: req.body.body || ''
    });
    
    const savedEntry = await newEntry.save();
    res.status(201).json(savedEntry);
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
});

// Get all cache entries (you might need this later)
router.get('/cache-entries', async (req: Request, res: Response) => {
  try {
    const entries = await CacheEntry.find().sort({ timestamp: -1 });
    res.json(entries);
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
});

export default router;