import express from 'express';
import cors from 'cors';
import activitiesRouter from './routes/activities';

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/activities', activitiesRouter);

app.get('/', (_req, res) => {
  res.send('API running');
});

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});