import dotenv from 'dotenv';

dotenv.config();

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

interface IConfig {
  mongodb: IDatabaseConfig;
  jwt: IJwtConfig;
  admin: IAdminConfig;
  firebase: IFirebaseConfig;
  env: string;
}

const config: IConfig = {
  mongodb: {
    url: process.env.DATABASE_URL as string,
  },
  jwt: {
    secret: process.env.JWT_SECRET as string,
    accessExpirationMinutes:
      Number(process.env.JWT_ACCESS_EXPIRATION_MINUTES) || 30,
    refreshExpirationDays:
      Number(process.env.JWT_REFRESH_EXPIRATION_DAYS) || 30,
  },
  admin: {
    name: process.env.ADMIN_NAME || 'Super Admin',
    email: process.env.ADMIN_EMAIL || 'admin@example.com',
    password: process.env.ADMIN_PASSWORD || 'password123',
  },
  firebase: {
    projectId: process.env.FIREBASE_PROJECT_ID as string,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL as string,
    privateKey: (process.env.FIREBASE_PRIVATE_KEY || '').replace(/\\n/g, '\n'),
  },
  env: process.env.NODE_ENV || 'development',
};

export default config;
