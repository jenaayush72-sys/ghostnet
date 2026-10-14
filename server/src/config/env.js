import dotenv from 'dotenv';
dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || '5000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  mongoUri: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/ghostnet',
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
  aiProvider: (process.env.AI_PROVIDER || 'mock').toLowerCase(),
  aiBaseUrl: process.env.AI_BASE_URL || 'http://localhost:11434',
  aiModel: process.env.AI_MODEL || 'llama3.2',
  aiApiKey: process.env.AI_API_KEY || '',
  searchProvider: (process.env.SEARCH_PROVIDER || 'duckduckgo').toLowerCase(),
  searchApiKey: process.env.SEARCH_API_KEY || '',
  maxAgentCalls: parseInt(process.env.MAX_AGENT_CALLS || '12', 10),
  agentTimeoutMs: parseInt(process.env.AGENT_TIMEOUT_MS || '60000', 10),
  maxSearchResults: parseInt(process.env.MAX_SEARCH_RESULTS || '6', 10)
};

export function getSafeConfigStatus() {
  return {
    nodeEnv: config.nodeEnv,
    ai: {
      provider: config.aiProvider,
      model: config.aiModel || 'default',
      baseUrl: config.aiBaseUrl,
      isConfigured: config.aiProvider === 'mock' || (config.aiProvider === 'ollama') || Boolean(config.aiApiKey)
    },
    search: {
      provider: config.searchProvider,
      isConfigured: ['duckduckgo', 'wikipedia', 'mock'].includes(config.searchProvider) || Boolean(config.searchApiKey)
    },
    limits: {
      maxAgentCalls: config.maxAgentCalls,
      agentTimeoutMs: config.agentTimeoutMs,
      maxSearchResults: config.maxSearchResults
    }
  };
}
