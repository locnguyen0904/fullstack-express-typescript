import 'reflect-metadata';
import express, { Express, Request, Response } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import swaggerUi from 'swagger-ui-express';

import {
  errorHandle,
  logErrors,
  notFoundHandle,
} from '@/helpers/handle-errors.helper';
import {
  morganMiddleware,
  apiLimiter,
  requestIdMiddleware,
} from '@/middlewares';
import { generateOpenApiDocs, config } from '@/config';
import api from '@/api';
import { healthHandler } from '@/api/health';
import '@/services/event.handlers';

const rootApi = '/api/v1';

const app: Express = express();

app.set('trust proxy', config.env === 'production');

// Swagger Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(generateOpenApiDocs()));

// Security
app.use(helmet());
app.use(cors());
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

app.get('/', (_req: Request, res: Response) => {
  res.json({ message: 'Welcome to backend-template API!' });
});

app.get('/health', healthHandler);

app.use(rootApi, api);

app.use(notFoundHandle);

app.use(logErrors);

app.use(errorHandle);

export default app;
