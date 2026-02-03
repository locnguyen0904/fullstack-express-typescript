import 'winston-daily-rotate-file';

import path from 'path';

import { createLogger, format, Logger, transports } from 'winston';

const LOG_DIR = process.env.LOG_DIR || 'logs';
const LOG_LEVEL = process.env.LOG_LEVEL || 'info';

const consoleFormat = format.combine(
  format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  format.errors({ stack: true }),
  format.colorize(),
  format.printf(({ level, message, timestamp, stack }) => {
    const log = `${timestamp} [${level}]: ${message}`;
    return stack ? `${log}\n${stack}` : log;
  })
);

const fileFormat = format.combine(
  format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  format.errors({ stack: true }),
  format.json()
);

const isTest = process.env.NODE_ENV === 'test';

const logger: Logger = createLogger({
  level: isTest ? 'silent' : LOG_LEVEL,
  silent: isTest,
  transports: [
    new transports.Console({ format: consoleFormat }),
    new transports.DailyRotateFile({
      filename: path.join(LOG_DIR, 'app-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      maxSize: '20m',
      maxFiles: '14d',
      format: fileFormat,
    }),
    new transports.DailyRotateFile({
      filename: path.join(LOG_DIR, 'error-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      maxSize: '20m',
      maxFiles: '14d',
      level: 'error',
      format: fileFormat,
    }),
  ],
});

export default logger;
