import 'reflect-metadata';
import express, { Express, Request, Response } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';
import cookieParser from 'cookie-parser';

import { errorHandle, notFoundHandle } from './helpers/handle-errors.helper';
import morganMiddleware from './middlewares/morgan.middleware';
import api from '@/api';

const rootApi = '/api/v1';

const app: Express = express();

// Security
app.use(helmet());
app.use(cors());
app.disable('x-powered-by');

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

app.use(rootApi, api);

app.use(notFoundHandle);

app.use(errorHandle);

export default app;
