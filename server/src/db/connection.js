import mongoose from 'mongoose';
import dns from 'dns';
import { config } from '../config/env.js';

// Configure reliable DNS servers for MongoDB Atlas SRV lookups on Windows
try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch {
  // Use default system DNS if override fails
}

let isConnected = false;
let connectionError = null;

export async function connectDB() {
  if (isConnected) return mongoose.connection;

  try {
    mongoose.set('strictQuery', false);
    const conn = await mongoose.connect(config.mongoUri, {
      serverSelectionTimeoutMS: 8000,
      connectTimeoutMS: 8000,
    });
    isConnected = true;
    connectionError = null;
    console.log(`[Database] Connected to MongoDB Atlas at ${conn.connection.host}`);
    return conn;
  } catch (err) {
    connectionError = err.message;
    console.warn(`[Database] MongoDB connection warning: ${err.message}. Operating with resilient memory persistence mode.`);
    return null;
  }
}

export function getDbStatus() {
  return {
    isConnected: mongoose.connection.readyState === 1 || isConnected,
    readyState: mongoose.connection.readyState,
    host: mongoose.connection.host || 'local-fallback',
    error: connectionError
  };
}
