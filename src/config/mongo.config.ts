import mongoose from 'mongoose';
import envConfig from './env.config.js';
import logger from '../utils/logger.js';

export const connectMongo = async (): Promise<typeof mongoose> => {
  try {
    const conn = await mongoose.connect(envConfig.MONGO_URI, {
      autoIndex: true,
      serverSelectionTimeoutMS: 5000
    });

    logger.info({ mongoUri: envConfig.MONGO_URI }, 'MongoDB connected successfully');
    return conn;
  } catch (error) {
    logger.warn({ error, mongoUri: envConfig.MONGO_URI }, 'MongoDB connection deferred or failed');
    return mongoose;
  }
};

mongoose.connection.on('disconnected', () => {
  logger.warn('MongoDB connection lost');
});

mongoose.connection.on('error', (err) => {
  logger.error({ err }, 'MongoDB connection error');
});

export default connectMongo;
