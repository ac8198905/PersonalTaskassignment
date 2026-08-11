import express from 'express';
import cors from 'cors';
import taskRoutes from './routes/taskRoutes.js';
import errorMiddleware from './middleware/errorMiddleware.js';

const app = express();

// --------------- Global Middleware ---------------
app.use(cors());
app.use(express.json());

// --------------- Routes ---------------
app.use('/api/tasks', taskRoutes);

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ success: true, message: 'API is running' });
});

// 404 catch-all for unknown routes
app.use((_req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
  });
});

// --------------- Error Handler ---------------
app.use(errorMiddleware);

export default app;
