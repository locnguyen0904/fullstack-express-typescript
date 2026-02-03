import { Request } from 'express';
import morgan, { StreamOptions } from 'morgan';

import { logger } from '@/services';

const stream: StreamOptions = {
  // Use the http severity
  write: (message) => logger.http(message),
};

morgan.token('request-id', (req: Request) => req.requestId || '-');

const format =
  process.env.NODE_ENV === 'production'
    ? ':request-id :method :url :status :res[content-length] - :response-time ms'
    : ':request-id :method :url :status :res[content-length] - :response-time ms :remote-addr';

const morganMiddleware = morgan(format, { stream });

export default morganMiddleware;
