import mongoose from 'mongoose';
import logger from './logger.service';
import config from '@/config/env.config';

const MONGODB_OPTIONS: mongoose.ConnectOptions = {
  maxPoolSize: 10,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
};

export const connectDB = async (): Promise<void> => {
  const startTime = Date.now();

  try {
    await mongoose.connect(config.mongodb.url, MONGODB_OPTIONS);

    const connectionTime = Date.now() - startTime;
    logger.info(`MongoDB connected successfully in ${connectionTime}ms`);

    mongoose.connection.on('error', (error) => {
      logger.error('MongoDB connection error:', error);
    });

    mongoose.connection.on('disconnected', () => {
      logger.warn('MongoDB disconnected. Attempting to reconnect...');
    });

    mongoose.connection.on('reconnected', () => {
      logger.info('MongoDB reconnected');
    });
  } catch (error) {
    logger.error('MongoDB initial connection error:', error);
    throw error;
  }
};

export const disconnectDB = async (): Promise<void> => {
  try {
    await mongoose.disconnect();
    logger.info('MongoDB disconnected gracefully');
  } catch (error) {
    logger.error('Error disconnecting from MongoDB:', error);
    throw error;
  }
};
