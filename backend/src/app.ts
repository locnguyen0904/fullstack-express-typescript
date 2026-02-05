import 'reflect-metadata';
import '@/api/users/user.events';

import compression from 'compression';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import csrf from 'csurf';
import express, { Express, NextFunction, Request, Response } from 'express';
import helmet from 'helmet';
import swaggerUi from 'swagger-ui-express';

import api from '@/api';
import { healthHandler } from '@/api/health';
import { config, env, generateOpenApiDocs } from '@/config';
import {
  errorHandle,
  logErrors,
  notFoundHandle,
} from '@/helpers/handle-errors.helper';
import {
  apiLimiter,
  morganMiddleware,
  requestIdMiddleware,
} from '@/middlewares';

const rootApi = '/api/v1';

const app: Express = express();

app.set('trust proxy', config.env === 'production');

// Swagger Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(generateOpenApiDocs()));

// Security
app.use(helmet());
app.use(
  cors({
    origin:
      config.env === 'production'
        ? env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3001']
        : true,
    credentials: true,
  })
);
app.disable('x-powered-by');

// Rate Limiting
app.use(rootApi, apiLimiter);

// Request ID
app.use(requestIdMiddleware);

// Morgan
app.use(morganMiddleware);

// Compression
app.use(compression());

app.use(cookieParser());

// Parse requests
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// CSRF Protection - Auth-based detection
const csrfProtection = csrf({ cookie: true });

app.use((req: Request, res: Response, next: NextFunction) => {
  if (req.headers.authorization?.startsWith('Bearer ')) {
    return next();
  }
  if (!req.cookies?._csrf) {
    return next();
  }
  return csrfProtection(req, res, next);
});

app.get('/api/v1/csrf-token', csrfProtection, (req: Request, res: Response) => {
  res.json({ csrfToken: req.csrfToken() });
});

app.get('/', (_req: Request, res: Response) => {
  res.json({ message: 'Welcome to backend-template API!' });
});

app.get('/health', healthHandler);

app.use(rootApi, api);

app.use(notFoundHandle);

app.use(logErrors);

app.use(errorHandle);

export default app;
