import { createApp } from './app.js';
import { config } from './config/env.js';
import { connectDB } from './db/connection.js';
import { seedDemoCaseIfEmpty } from './db/seedDemo.js';

async function startServer() {
  const app = createApp();

  // Initialize DB and demo case
  try {
    await connectDB();
    await seedDemoCaseIfEmpty();
  } catch (err) {
    console.warn(`[Bootstrap] Notice: Database bootstrap note: ${err.message}`);
  }

  const server = app.listen(config.port, () => {
    console.log(`=======================================================`);
    console.log(`⚖️  GHOSTNET — THE AI COURTROOM BACKEND RUNNING`);
    console.log(`   URL: http://localhost:${config.port}`);
    console.log(`   Health: http://localhost:${config.port}/api/health`);
    console.log(`   Environment: ${config.nodeEnv}`);
    console.log(`   AI Provider: ${config.aiProvider} (${config.aiModel})`);
    console.log(`   Search: ${config.searchProvider}`);
    console.log(`=======================================================`);
  });

  return server;
}

startServer().catch(err => {
  console.error('[Fatal] Server failed to start:', err);
  process.exit(1);
});
