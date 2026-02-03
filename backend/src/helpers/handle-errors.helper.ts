import { NextFunction, Request,Response as ExpressResponse } from 'express';
import mongoose from 'mongoose';
import { ZodError } from 'zod';

import { AppError, InternalServerError, NotFoundError } from '@/core';
import { logger } from '@/services';

import Response from './response.helper';

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

const isDuplicateKeyError = (
  error: unknown
): error is { code: number; keyValue?: Record<string, unknown> } => {
  if (!error || typeof error !== 'object') return false;
  return 'code' in error && (error as { code?: number }).code === 11000;
};

const getDuplicateKeyError = (error: {
  keyValue?: Record<string, unknown>;
}): {
  message: string;
  code: string;
  details?: { field: string }[];
} => {
  const keyValue = error.keyValue ?? {};
  const fields = Object.keys(keyValue);

  if (fields.length === 0) {
    return {
      message: 'Duplicate key error',
      code: 'DUPLICATE_KEY',
    };
  }

  return {
    message: `Duplicate value for ${fields.join(', ')}`,
    code: 'DUPLICATE_KEY',
    details: fields.map((field) => ({ field })),
  };
};

export const errorHandle = (
  error: unknown,
  _req: Request,
  res: ExpressResponse,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction
): void => {
  const includeStack = process.env.NODE_ENV !== 'production';

  if (error instanceof AppError) {
    const { message, status, stack } = error;
    const code = typeof error.code === 'string' ? error.code : undefined;
    const payload = {
      message,
      code,
      ...(includeStack && stack ? { stack } : {}),
    };
    Response.error(res, payload, status);
    return;
  }

  if (error instanceof ZodError) {
    const zodError = getZodError(error);
    Response.error(res, zodError, 400);
    return;
  }

  if (isDuplicateKeyError(error)) {
    const duplicateKeyError = getDuplicateKeyError(error);
    Response.error(res, duplicateKeyError, 409);
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
  const payload = {
    message,
    code,
    ...(includeStack && stack ? { stack } : {}),
  };
  Response.error(res, payload, status);
};

export const logErrors = (
  err: Error,
  req: Request,
  _res: ExpressResponse,
  next: NextFunction
): void => {
  logger.error('Request failed', {
    message: err.message,
    stack: err.stack,
    requestId: req.requestId,
    method: req.method,
    url: req.originalUrl,
  });
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
