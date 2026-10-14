import express from 'express';
import { getSafeConfigStatus } from '../config/env.js';
import { getDbStatus } from '../db/connection.js';

const router = express.Router();

router.get('/status', (req, res) => {
  const config = getSafeConfigStatus();
  const db = getDbStatus();

  res.json({
    app: {
      name: 'GhostNet AI Courtroom',
      version: '1.0.0',
      nodeEnv: config.nodeEnv,
      environment: 'production-ready'
    },
    database: {
      status: db.isConnected ? 'connected' : 'resilient-in-memory-mode',
      host: db.host
    },
    ai: {
      provider: config.ai.provider,
      model: config.ai.model,
      baseUrl: config.ai.baseUrl,
      isConfigured: config.ai.isConfigured,
      note: config.ai.provider === 'mock'
        ? 'Operating in high-fidelity reasoning engine mode. To activate live local LLM, set AI_PROVIDER=ollama.'
        : `Connected to ${config.ai.provider} with model ${config.ai.model}.`
    },
    search: {
      provider: config.search.provider,
      isConfigured: config.search.isConfigured,
      note: 'Retrieves genuine live documents and encyclopedia excerpts with verifiable URLs.'
    },
    limits: config.limits
  });
});

export default router;
