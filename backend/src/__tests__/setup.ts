// Global test setup
import 'reflect-metadata';

process.env.DATABASE_URL =
  process.env.MONGO_MEMORY_URI || 'mongodb://localhost:27017/test';
process.env.JWT_SECRET =
  process.env.JWT_SECRET || 'test-secret-key-should-be-long-enough-32';
process.env.JWT_ACCESS_EXPIRATION_MINUTES =
  process.env.JWT_ACCESS_EXPIRATION_MINUTES || '30';
process.env.JWT_REFRESH_EXPIRATION_DAYS =
  process.env.JWT_REFRESH_EXPIRATION_DAYS || '30';
process.env.ADMIN_NAME = process.env.ADMIN_NAME || 'Test Admin';
process.env.ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@test.local';
process.env.ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'password123';
process.env.NODE_ENV = process.env.NODE_ENV || 'test';
