import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { isAuth, authorize } from '@/middlewares';
import { UnAuthorizedError, ForbiddenError } from '@/core';
import { config } from '@/config';

// Mock jsonwebtoken
jest.mock('jsonwebtoken');

describe('Auth Middleware', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: jest.MockedFunction<NextFunction>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockRequest = {
      headers: {},
    };
    mockResponse = {};
    mockNext = jest.fn();
  });

  describe('isAuth', () => {
    it('calls next with UnAuthorizedError when no authorization header', () => {
      mockRequest.headers = {};

      isAuth(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(UnAuthorizedError));
      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({ message: 'Please authenticate' })
      );
    });

    it('calls next with UnAuthorizedError when authorization header does not start with Bearer', () => {
      mockRequest.headers = { authorization: 'Basic token123' };

      isAuth(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(UnAuthorizedError));
    });

    it('calls next with UnAuthorizedError when Bearer token is missing', () => {
      mockRequest.headers = { authorization: 'Bearer ' };

      (jwt.verify as jest.Mock).mockImplementation(() => {
        throw new Error('jwt malformed');
      });

      isAuth(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(UnAuthorizedError));
    });

    it('sets req.user and calls next when token is valid', () => {
      const mockPayload = { sub: 'user-123', role: 'user', type: 'access' };
      mockRequest.headers = { authorization: 'Bearer valid-token' };

      (jwt.verify as jest.Mock).mockReturnValue(mockPayload);

      isAuth(mockRequest as Request, mockResponse as Response, mockNext);

      expect(jwt.verify).toHaveBeenCalledWith('valid-token', config.jwt.secret);
      expect(mockRequest.user).toEqual(mockPayload);
      expect(mockNext).toHaveBeenCalledWith();
    });

    it('calls next with UnAuthorizedError when token verification fails', () => {
      mockRequest.headers = { authorization: 'Bearer invalid-token' };

      (jwt.verify as jest.Mock).mockImplementation(() => {
        throw new Error('invalid signature');
      });

      isAuth(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(UnAuthorizedError));
    });

    it('calls next with UnAuthorizedError when token is expired', () => {
      mockRequest.headers = { authorization: 'Bearer expired-token' };

      (jwt.verify as jest.Mock).mockImplementation(() => {
        throw new jwt.TokenExpiredError('jwt expired', new Date());
      });

      isAuth(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(UnAuthorizedError));
    });
  });

  describe('authorize', () => {
    it('returns a middleware function', () => {
      const middleware = authorize('admin', 'user');
      expect(typeof middleware).toBe('function');
    });

    it('calls next with UnAuthorizedError when req.user is not set', () => {
      const middleware = authorize('admin');
      mockRequest.user = undefined;

      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(UnAuthorizedError));
      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({ message: 'Please authenticate' })
      );
    });

    it('calls next with ForbiddenError when user role is not allowed', () => {
      const middleware = authorize('admin');
      mockRequest.user = { sub: 'user-123', role: 'user', type: 'access' };

      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(ForbiddenError));
      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'You do not have permission to access this resource',
        })
      );
    });

    it('calls next without error when user role is allowed', () => {
      const middleware = authorize('admin', 'user');
      mockRequest.user = { sub: 'user-123', role: 'user', type: 'access' };

      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith();
    });

    it('allows admin role when authorized for admin', () => {
      const middleware = authorize('admin');
      mockRequest.user = { sub: 'admin-123', role: 'admin', type: 'access' };

      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith();
    });

    it('supports multiple allowed roles', () => {
      const middleware = authorize('admin', 'moderator', 'user');
      mockRequest.user = { sub: 'user-123', role: 'moderator', type: 'access' };

      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith();
    });
  });
});
