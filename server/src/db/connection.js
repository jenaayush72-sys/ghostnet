import mongoose from 'mongoose';
import { config } from '../config/env.js';

let isConnected = false;
let connectionError = null;

export async function connectDB() {
  if (isConnected) return mongoose.connection;

  try {
    mongoose.set('strictQuery', false);
    const conn = await mongoose.connect(config.mongoUri, {
      serverSelectionTimeoutMS: 3000,
      connectTimeoutMS: 3000,
    });
    isConnected = true;
    connectionError = null;
    console.log(`[Database] Connected to MongoDB at ${config.mongoUri}`);
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
