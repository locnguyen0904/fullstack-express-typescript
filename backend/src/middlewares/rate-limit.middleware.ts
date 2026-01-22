import rateLimit from 'express-rate-limit';
import { Request } from 'express';

export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  validate: { keyGeneratorIpFallback: false },
  keyGenerator: (req: Request) => req.user?.sub ?? req.ip ?? 'unknown',
  message: {
    message: 'Too many requests, please try again after 15 minutes',
    code: 'TOO_MANY_REQUESTS',
  },
});

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    message: 'Too many login attempts, please try again after 15 minutes',
    code: 'TOO_MANY_REQUESTS',
  },
});
