import { NextFunction, Request, Response } from 'express';
import mongoose from 'mongoose';
import { ZodError } from 'zod';

import { BadRequestError, NotFoundError } from '@/core';
import {
  errorHandle,
  logErrors,
  notFoundHandle,
} from '@/helpers/handle-errors.helper';
import { logger } from '@/services';

// Mock logger
jest.mock('@/services', () => ({
  logger: {
    error: jest.fn(),
  },
}));

describe('Handle Errors Helper', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: jest.MockedFunction<NextFunction>;
  const originalEnv = process.env.NODE_ENV;

  beforeEach(() => {
    jest.clearAllMocks();
    mockRequest = {
      requestId: 'test-request-id',
      method: 'GET',
      originalUrl: '/test',
    };
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    mockNext = jest.fn();
  });

  afterEach(() => {
    process.env.NODE_ENV = originalEnv;
  });

  describe('errorHandle', () => {
    it('handles AppError and sends appropriate response', () => {
      const error = new BadRequestError('Bad request message');

      errorHandle(
        error,
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: expect.objectContaining({
            message: 'Bad request message',
            code: 'BAD_REQUEST',
          }),
        })
      );
    });

    it('includes stack trace in development mode', () => {
      process.env.NODE_ENV = 'development';
      const error = new BadRequestError('Test error');
      error.stack = 'Error stack trace';

      errorHandle(
        error,
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: expect.objectContaining({
            stack: 'Error stack trace',
          }),
        })
      );
    });

    it('excludes stack trace in production mode', () => {
      process.env.NODE_ENV = 'production';
      const error = new BadRequestError('Test error');
      error.stack = 'Error stack trace';

      errorHandle(
        error,
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      const jsonCall = (mockResponse.json as jest.Mock).mock.calls[0][0];
      expect(jsonCall.error.stack).toBeUndefined();
    });

    it('handles ZodError and sends 400 response', () => {
      const zodError = new ZodError([
        {
          code: 'invalid_type',
          expected: 'string',
          path: ['email'],
          message: 'Expected string, received number',
        } as never,
      ]);

      errorHandle(
        zodError,
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: expect.objectContaining({
            message:
              'Invalid request data. Please review the request and try again.',
            code: 'VALIDATION_ERROR',
          }),
        })
      );
    });

    it('handles MongoDB duplicate key error', () => {
      const duplicateError = {
        code: 11000,
        keyValue: { email: 'test@example.com' },
      };

      errorHandle(
        duplicateError,
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.status).toHaveBeenCalledWith(409);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: expect.objectContaining({
            message: 'Duplicate value for email',
            code: 'DUPLICATE_KEY',
          }),
        })
      );
    });

    it('handles MongoDB duplicate key error without keyValue', () => {
      const duplicateError = { code: 11000 };

      errorHandle(
        duplicateError,
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.status).toHaveBeenCalledWith(409);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: expect.objectContaining({
            message: 'Duplicate key error',
            code: 'DUPLICATE_KEY',
          }),
        })
      );
    });

    it('handles Mongoose CastError', () => {
      const castError = new mongoose.Error.CastError(
        'ObjectId',
        'invalid-id',
        '_id'
      );

      errorHandle(
        castError,
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: expect.objectContaining({
            message: 'Invalid ObjectId format',
            code: 'INVALID_OBJECT_ID',
          }),
        })
      );
    });

    it('handles unknown errors as InternalServerError in development', () => {
      process.env.NODE_ENV = 'development';
      const unknownError = new Error('Something went wrong');

      errorHandle(
        unknownError,
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: expect.objectContaining({
            message: 'Something went wrong',
            code: 'INTERNAL_SERVER_ERROR',
          }),
        })
      );
    });

    it('handles unknown errors as InternalServerError in production', () => {
      process.env.NODE_ENV = 'production';
      const unknownError = new Error('Sensitive error message');

      errorHandle(
        unknownError,
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: expect.objectContaining({
            message: 'Internal Server Error',
            code: 'INTERNAL_SERVER_ERROR',
          }),
        })
      );
    });

    it('handles non-object errors as InternalServerError', () => {
      process.env.NODE_ENV = 'production';

      errorHandle(
        'string error',
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.status).toHaveBeenCalledWith(500);
    });
  });

  describe('logErrors', () => {
    it('logs error details and calls next', () => {
      const error = new Error('Test error');
      error.stack = 'Error stack';

      logErrors(
        error,
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(logger.error).toHaveBeenCalledWith('Request failed', {
        message: 'Test error',
        stack: 'Error stack',
        requestId: 'test-request-id',
        method: 'GET',
        url: '/test',
      });
      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe('notFoundHandle', () => {
    it('creates NotFoundError and calls next', () => {
      notFoundHandle(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledWith(expect.any(NotFoundError));
    });
  });
});
