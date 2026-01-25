import http from 'http';
import Container from 'typedi';

import app from './app';
import { logger, mongoose, RedisService } from './services';

const PORT = Number(process.env.PORT) || 3000;
const SHUTDOWN_TIMEOUT = 30000;

async function gracefulShutdown(
  server: http.Server,
  signal: string
): Promise<void> {
  logger.info(`${signal} received: starting graceful shutdown`);

  server.close(() => {
    logger.info('HTTP server closed');
  });

  try {
    await Promise.all([
      mongoose.disconnectDB(),
      Container.get(RedisService).disconnect(),
    ]);

    logger.info('All connections closed gracefully');
    process.exit(0);
  } catch (error) {
    logger.error('Error during graceful shutdown', { error });
    process.exit(1);
  }
}

function initGracefulShutdown(server: http.Server): void {
  let isShuttingDown = false;

  const shutdown = (signal: string) => {
    if (isShuttingDown) {
      logger.warn(`${signal} received again, shutdown already in progress`);
      return;
    }
    isShuttingDown = true;

    const timeout = setTimeout(() => {
      logger.error('Graceful shutdown timed out, forcing exit');
      process.exit(1);
    }, SHUTDOWN_TIMEOUT);
    timeout.unref();

    gracefulShutdown(server, signal);
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
}

async function bootstrap(): Promise<void> {
  try {
    await mongoose.connectDB();
    await Container.get(RedisService).connect();

    const server = http.createServer(app);
    initGracefulShutdown(server);

    server.listen(PORT, () => {
      logger.info(`Server running on port ${PORT}`);
    });
  } catch (error) {
    logger.error('Failed to start server', { error });
    process.exit(1);
  }
}

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection', { reason, promise });
});

process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception', { error });
  process.exit(1);
});

bootstrap();
