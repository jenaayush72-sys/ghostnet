import dotenv from 'dotenv';
dotenv.config({ override: true });

export const config = {
  port: parseInt(process.env.PORT || '5000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  mongoUri: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/ghostnet',
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
  aiProvider: (process.env.AI_PROVIDER || 'multi_courtroom').toLowerCase(),
  aiBaseUrl: process.env.AI_BASE_URL || 'http://localhost:11434',
  aiModel: process.env.AI_MODEL || 'gemma-4-31b-it',
  aiApiKey: process.env.AI_API_KEY || '',
  
  // Multi-model courtroom configurations
  groqApiKey: process.env.GROQ_API_KEY || '',
  groqBaseUrl: process.env.GROQ_BASE_URL || 'https://api.groq.com/openai/v1',
  groqModel: process.env.GROQ_MODEL || 'openai/gpt-oss-120b',

  sarvamApiKey: process.env.SARVAM_API_KEY || '',
  sarvamBaseUrl: process.env.SARVAM_BASE_URL || 'https://api.sarvam.ai/v1',
  sarvamModel: process.env.SARVAM_MODEL || 'sarvam-105b',

  geminiApiKey: process.env.GEMINI_API_KEY || '',
  geminiModel: process.env.GEMINI_MODEL || 'gemma-4-31b-it',
  geminiFallbackModel: process.env.GEMINI_FALLBACK_MODEL || 'gemma-4-26b-a4b-it',

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
      model: 'Gemma 4 31B (Judge) + Sarvam 105B (Prosecutor) + Groq (Ghost/Defense)',
      isConfigured: Boolean(config.geminiApiKey || config.groqApiKey || config.sarvamApiKey)
    },
    courtroomRoster: {
      judge: { provider: 'Google / Gemma 4', model: config.geminiModel, configured: Boolean(config.geminiApiKey) },
      prosecutor: { provider: 'Sarvam AI', model: config.sarvamModel, configured: Boolean(config.sarvamApiKey) },
      ghostAndDefense: { provider: 'Groq', model: config.groqModel, configured: Boolean(config.groqApiKey) }
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
