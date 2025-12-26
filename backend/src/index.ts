import express from 'express';
import cors from 'cors';
import connectDB from './config/database';
import activitiesRouter from './routes/activities';
import cacheEntriesRouter from './routes/cacheEntries';

const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/activities', activitiesRouter);
app.use('/api', cacheEntriesRouter);

app.get('/', (_req, res) => {
  res.send('API running');
});

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});