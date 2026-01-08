import dotenv from 'dotenv';

dotenv.config();

interface IDatabaseConfig {
  url: string;
}

interface IJwtConfig {
  secret: string;
}

interface IConfig {
  mongodb: IDatabaseConfig;
  jwt: IJwtConfig;
}

const config: IConfig = {
  mongodb: {
    url: process.env.DATABASE_URL as string,
  },
  jwt: {
    secret: process.env.JWT_SECRET as string,
  },
};

export default config;
