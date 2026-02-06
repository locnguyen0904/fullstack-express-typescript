import { env } from './env.schema';

interface IDatabaseConfig {
  url: string;
}

interface IJwtConfig {
  secret: string;
  accessExpirationMinutes: number;
  refreshExpirationDays: number;
}

interface IAdminConfig {
  name: string;
  email: string;
  password?: string;
}

interface IFirebaseConfig {
  projectId: string;
  clientEmail: string;
  privateKey: string;
}

interface IRedisConfig {
  url?: string;
}

interface IEncryptionConfig {
  key: string;
}

interface IConfig {
  mongodb: IDatabaseConfig;
  jwt: IJwtConfig;
  encryption: IEncryptionConfig;
  admin: IAdminConfig;
  firebase: IFirebaseConfig;
  redis: IRedisConfig;
  env: string;
  port?: number;
}

const config: IConfig = {
  mongodb: {
    url: env.DATABASE_URL,
  },
  jwt: {
    secret: env.JWT_SECRET,
    accessExpirationMinutes: env.JWT_ACCESS_EXPIRATION_MINUTES,
    refreshExpirationDays: env.JWT_REFRESH_EXPIRATION_DAYS,
  },
  encryption: {
    key: env.ENCRYPTION_KEY || env.JWT_SECRET,
  },
  admin: {
    name: env.ADMIN_NAME,
    email: env.ADMIN_EMAIL,
    password: env.ADMIN_PASSWORD,
  },
  firebase: {
    projectId: env.FIREBASE_PROJECT_ID || '',
    clientEmail: env.FIREBASE_CLIENT_EMAIL || '',
    privateKey: (env.FIREBASE_PRIVATE_KEY || '').replace(/\\n/g, '\n'),
  },
  redis: {
    url: env.REDIS_URL,
  },
  env: env.NODE_ENV,
  port: env.PORT,
};

export default config;
