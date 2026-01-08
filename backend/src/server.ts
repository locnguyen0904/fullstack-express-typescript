import http from 'http';

import app from './app';
import { logger, mongoose } from './services';

const PORT = Number(process.env.PORT) || 3000;

function initGracefulShutdown(server: http.Server): void {
  process.on('SIGTERM', () => {
    logger.info('SIGTERM received: closing HTTP server');
    server.close(() => logger.info('HTTP server closed'));
  });
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
