import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { config } from './config/env.js';
import healthRouter from './routes/health.js';
import investigationsRouter from './routes/investigations.js';
import evidenceRouter from './routes/evidence.js';
import settingsRouter from './routes/settings.js';

export function createApp() {
  const app = express();

  // Security Headers
  app.use(helmet({
    contentSecurityPolicy: false // Allow SSE streaming and API responses
  }));

  // CORS configuration
  app.use(cors({
    origin: (origin, callback) => {
      // Allow local development ports (Vite 5173, etc.) or configured client URL
      if (!origin || origin.startsWith('http://localhost:') || origin.startsWith('http://127.0.0.1:') || origin === config.clientUrl) {
        callback(null, true);
      } else {
        callback(null, true); // Permissive in dev/testing mode
      }
    },
    credentials: true
  }));

  // Body Parsing with payload limits
  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: true, limit: '1mb' }));

  // Rate Limiting on investigation creation
  const investigationLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 30, // 30 new investigations per minute per IP
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      success: false,
      error: 'Rate limit exceeded: Too many investigation requests filed. Please wait before submitting another case.'
    }
  });

  // Mount API Routes
  app.use('/api/health', healthRouter);
  app.use('/api/investigations', (req, res, next) => {
    if (req.method === 'POST') {
      return investigationLimiter(req, res, next);
    }
    next();
  }, investigationsRouter);
  app.use('/api/evidence', evidenceRouter);
  app.use('/api/settings', settingsRouter);

  // Root route - Informational landing for backend port
  app.get('/', (req, res) => {
    res.json({
      name: '⚖️ GhostNet — The AI Courtroom API',
      status: 'online',
      message: 'This is the backend API server (Port 5000). To use the interactive courtroom interface, open http://localhost:5173 in your browser.',
      frontendUrl: config.clientUrl || 'http://localhost:5173',
      endpoints: {
        health: '/api/health',
        investigations: '/api/investigations',
        evidence: '/api/evidence',
        settings: '/api/settings/status'
      }
    });
  });

  // 404 handler
  app.use((req, res) => {
    res.status(404).json({
      success: false,
      error: `API route not found: ${req.method} ${req.path}`
    });
  });

  // Centralized Error Handling Middleware (never leaks internal paths or secrets)
  app.use((err, req, res, next) => {
    console.error(`[API Error] ${req.method} ${req.path}:`, err.message);
    const statusCode = err.status || err.statusCode || 500;
    res.status(statusCode).json({
      success: false,
      error: err.message || 'Internal Server Error',
      ...(config.nodeEnv === 'development' ? { stage: err.stage } : {})
    });
  });

  return app;
}
