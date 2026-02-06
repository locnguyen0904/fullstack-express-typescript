import { doubleCsrf } from 'csrf-csrf';
import { Request, Response } from 'express';

import { config } from '@/config';

const isProduction = config.env === 'production';

const { doubleCsrfProtection, generateCsrfToken } = doubleCsrf({
  getSecret: () => config.jwt.secret,
  getSessionIdentifier: () => '',
  cookieOptions: {
    httpOnly: true,
    sameSite: 'strict',
    secure: isProduction,
    path: '/',
  },
  cookieName: isProduction ? '__Host-csrf' : 'csrf',
  getCsrfTokenFromRequest: (req) =>
    (req.headers['x-csrf-token'] as string) ||
    (req.headers['x-xsrf-token'] as string),
  ignoredMethods: ['GET', 'HEAD', 'OPTIONS'],
});

export function csrfProtection(
  req: Request,
  res: Response,
  next: Parameters<typeof doubleCsrfProtection>[2]
): void {
  // Skip for Bearer token auth (API clients are inherently CSRF-safe)
  if (req.headers.authorization?.startsWith('Bearer ')) {
    return next();
  }

  // Skip if no auth cookies — no session to protect (Swagger, curl, Postman)
  if (!req.cookies?.refreshToken) {
    return next();
  }

  return doubleCsrfProtection(req, res, next);
}

export function csrfTokenHandler(req: Request, res: Response): void {
  const token = generateCsrfToken(req, res);
  res.json({ csrfToken: token });
}
