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

// Get all cache entries
router.get('/cache-entries', async (req: Request, res: Response) => {
  try {
    const entries = await CacheEntry.find().sort({ timestamp: -1 });
    res.json(entries);
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
});

// Update a cache entry
router.put('/cache-entries/:id', async (req: Request, res: Response) => {
  try {
    const updatedEntry = await CacheEntry.findByIdAndUpdate(
      req.params.id,
      {
        title: req.body.title,
        body: req.body.body
      },
      { new: true }
    );
    
    if (!updatedEntry) {
      return res.status(404).json({ message: 'Cache entry not found' });
    }
    
    res.json(updatedEntry);
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
});

// Delete a cache entry
router.delete('/cache-entries/:id', async (req: Request, res: Response) => {
  try {
    const deletedEntry = await CacheEntry.findByIdAndDelete(req.params.id);
    
    if (!deletedEntry) {
      return res.status(404).json({ message: 'Cache entry not found' });
    }
    
    res.json({ message: 'Cache entry deleted successfully', deletedEntry });
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
});

export default router;