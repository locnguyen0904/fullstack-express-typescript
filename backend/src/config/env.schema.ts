import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development'),
  PORT: z.coerce.number().optional(),
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
  JWT_SECRET: z.string().min(32, 'JWT_SECRET must be at least 32 characters'),
  JWT_ACCESS_EXPIRATION_MINUTES: z.coerce.number().int().positive().default(30),
  JWT_REFRESH_EXPIRATION_DAYS: z.coerce.number().int().positive().default(30),
  ADMIN_NAME: z.string().default('Super Admin'),
  ADMIN_EMAIL: z.email().default('admin@example.com'),
  ADMIN_PASSWORD: z.string().default('password123'),
  FIREBASE_PROJECT_ID: z.string().optional(),
  FIREBASE_CLIENT_EMAIL: z.string().optional(),
  FIREBASE_PRIVATE_KEY: z.string().optional(),
  REDIS_URL: z.string().optional(),
  LOG_LEVEL: z.string().optional(),
  LOG_DIR: z.string().optional(),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  // eslint-disable-next-line no-console
  console.error('Invalid environment variables:');
  // eslint-disable-next-line no-console
  console.error(z.prettifyError(parsed.error));
  throw new Error('Invalid environment variables');
}

export type Env = z.infer<typeof envSchema>;
export const env = parsed.data;
