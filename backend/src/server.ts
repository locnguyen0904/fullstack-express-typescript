import http from 'http';

import app from './app';
import { logger, mongoose } from './services';

const PORT = Number(process.env.PORT) || 3000;

function initGracefulShutdown(server: http.Server): void {
  const shutdown = async (signal: string) => {
    logger.info(`${signal} received: closing HTTP server`);

    server.close(async () => {
      logger.info('HTTP server closed');
      await mongoose.disconnectDB();
      process.exit(0);
    });

    setTimeout(() => {
      logger.error('Graceful shutdown timed out, forcing exit');
      process.exit(1);
    }, 30000).unref();
  };

  process.on('SIGTERM', () => void shutdown('SIGTERM'));
  process.on('SIGINT', () => void shutdown('SIGINT'));
}

// -----------------------------
// Bootstrap
// -----------------------------
function bootstrap(): void {
  mongoose.connectDB();

  const server = http.createServer(app);
  initGracefulShutdown(server);

  server.listen(PORT, () => {
    logger.info(`Server running on port ${PORT}`);
  });
}

bootstrap();
