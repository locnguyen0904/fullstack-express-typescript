import { doubleCsrf } from 'csrf-csrf';
import { NextFunction, Request, Response } from 'express';

import { config } from '@/config';

const { generateCsrfToken, doubleCsrfProtection, invalidCsrfTokenError } =
  doubleCsrf({
    getSecret: () => config.jwt.secret,
    getSessionIdentifier: (req: Request) => req.ip || 'anonymous',
    cookieName: '__Host-csrf',
    cookieOptions: {
      httpOnly: true,
      sameSite: 'strict',
      path: '/',
      secure: config.env === 'production',
    },
    getCsrfTokenFromRequest: (req: Request) =>
      req.headers['x-csrf-token'] as string,
  });

export const csrfProtection = doubleCsrfProtection;

export const csrfTokenHandler = (req: Request, res: Response) => {
  const token = generateCsrfToken(req, res);
  res.json({ csrfToken: token });
};

export const csrfErrorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  next: NextFunction
) => {
  if (err === invalidCsrfTokenError) {
    res.status(403).json({ message: 'Invalid CSRF token' });
    return;
  }
  next(err);
};
