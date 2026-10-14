import express from 'express';
import { getDbStatus } from '../db/connection.js';
import { getSafeConfigStatus } from '../config/env.js';

const router = express.Router();

router.get('/', (req, res) => {
  const db = getDbStatus();
  const config = getSafeConfigStatus();

  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.floor(process.uptime()),
    database: {
      connected: db.isConnected,
      host: db.host
    },
    aiProvider: config.ai.provider,
    searchProvider: config.search.provider,
    version: '1.0.0'
  });
});

export default router;
