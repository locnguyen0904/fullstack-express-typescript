import { NextFunction, Request, RequestHandler, Response } from 'express';

export const asyncHandler = (
  fn: (req: Request, res: Response) => Promise<void>
): RequestHandler => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await fn(req, res);
    } catch (error) {
      next(error);
    }
  };
};
