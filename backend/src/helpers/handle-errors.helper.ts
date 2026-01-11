import { ZodError } from 'zod';
import { Response as ExpressResponse, NextFunction, Request } from 'express';
import mongoose from 'mongoose';

import Response from './response.helper';
import {
  AppError,
  InternalServerError,
  NotFoundError,
} from '@/core/response-error.core';

const getZodError = (
  error: ZodError
): {
  message: string;
  code: string;
  details: { message: string; code: string }[];
} => {
  const details = error.issues.map((issue) => ({
    message: `${issue.path.join('.')}: ${issue.message}`,
    code: issue.code,
  }));

  return {
    message: 'Invalid request data. Please review the request and try again.',
    code: 'VALIDATION_ERROR',
    details,
  };
};

export const errorHandle = (
  error: unknown,
  _req: Request,
  res: ExpressResponse,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction
): void => {
  if (error instanceof AppError) {
    const { message, status, stack } = error;
    const code = typeof error.code === 'string' ? error.code : undefined;
    Response.error(res, { message, code, stack }, status);
    return;
  }

  if (error instanceof ZodError) {
    const zodError = getZodError(error);
    Response.error(res, zodError, 400);
    return;
  }

  if (error instanceof mongoose.Error.CastError) {
    Response.error(
      res,
      {
        message: 'Invalid ObjectId format',
        code: 'INVALID_OBJECT_ID',
      },
      400
    );
    return;
  }

  const err = error as Error;
  const internalError =
    process.env.NODE_ENV !== 'production'
      ? new InternalServerError(err.message)
      : new InternalServerError();
  internalError.stack = err.stack;
  const { message, status, stack } = internalError;
  const code =
    typeof internalError.code === 'string' ? internalError.code : undefined;
  Response.error(res, { message, code, stack }, status);
};

export const logErrors = (
  err: Error,
  _req: Request,
  _res: ExpressResponse,
  next: NextFunction
): void => {
  console.error(err.stack);
  next(err);
};

export const notFoundHandle = (
  _req: Request,
  _res: ExpressResponse,
  next: NextFunction
): void => {
  const error = new NotFoundError();
  next(error);
};
