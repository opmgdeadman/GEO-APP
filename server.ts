import express from 'express';
import cors from 'cors';
import { createServer as createViteServer } from 'vite';
import { initDb } from './server/db';
import authRoutes from './server/routes/auth';
import projectRoutes from './server/routes/projects';
import analyzeRoutes from './server/routes/analyze';

const app = express();
const PORT = 3000;

// Initialize Database
initDb();

// Middleware
app.use(cors());
app.use(express.json());

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/analyze', analyzeRoutes);

// Health Check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Vite Integration
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Production static file serving would go here
    // app.use(express.static('dist'));
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
