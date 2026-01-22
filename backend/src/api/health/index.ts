import { Request, Response, Router } from 'express';
import mongoose from 'mongoose';
import './health.doc';

export const healthHandler = async (_req: Request, res: Response) => {
  const dbReady = mongoose.connection.readyState === 1;
  const payload = {
    status: dbReady ? 'ok' : 'error',
    uptime: process.uptime(),
    timestamp: Date.now(),
    checks: {
      database: dbReady ? 'up' : 'down',
    },
  };

  return res.status(dbReady ? 200 : 503).json(payload);
};

const router = Router();

router.get('/', healthHandler);

export default router;
