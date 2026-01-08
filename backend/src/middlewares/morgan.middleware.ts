import morgan, { StreamOptions } from 'morgan';
import { logger } from '@/services';

const stream: StreamOptions = {
  // Use the http severity
  write: (message) => logger.http(message),
};

// Use 'tiny' for production (minimal, efficient) and 'combined' for development (detailed)
const format = process.env.NODE_ENV === 'production' ? 'tiny' : 'combined';

const morganMiddleware = morgan(format, { stream });

export default morganMiddleware;
