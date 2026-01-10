import express from 'express';
import cors from 'cors';
import connectDB from './config/database';
import activitiesRouter from './routes/activities';
import cacheEntriesRouter from './routes/cacheEntries';
import categorySuggestions from './routes/categorySuggestions';
import categoriesRouter from './routes/categories'; // ✅ NEW
import authRouter from './routes/auth';
import { requireAuth } from './middleware/auth';

const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(express.json());

// Public routes (no authentication required)
app.use('/api/auth', authRouter);

app.get('/', (_req, res) => {
  res.send('API running');
});

// Protected routes (authentication required)
app.use('/api/activities', requireAuth, activitiesRouter);
app.use('/api/cache', requireAuth, cacheEntriesRouter);
app.use('/api/suggestions', requireAuth, categorySuggestions);
app.use('/api/categories', requireAuth, categoriesRouter); // ✅ NEW

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});