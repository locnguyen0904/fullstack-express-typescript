import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { container } from 'tsyringe';

import { config } from '@/config';
import { ForbiddenError, UnAuthorizedError } from '@/core';
import { authorize, isAuth } from '@/middlewares';
import TokenBlacklistService from '@/services/token-blacklist.service';

// Mock jsonwebtoken
jest.mock('jsonwebtoken');

// Mock tsyringe container
jest.mock('tsyringe', () => ({
  container: {
    resolve: jest.fn(),
  },
  singleton: () => (target: unknown) => target,
  inject: () => () => undefined,
}));

const mockBlacklist = {
  revoke: jest.fn().mockResolvedValue(undefined),
  isRevoked: jest.fn().mockResolvedValue(false),
};

(container.resolve as jest.Mock).mockReturnValue(mockBlacklist);

describe('Auth Middleware', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: jest.MockedFunction<NextFunction>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockBlacklist.isRevoked.mockResolvedValue(false);
    (container.resolve as jest.Mock).mockReturnValue(mockBlacklist);
    mockRequest = {
      headers: {},
    };
    mockResponse = {};
    mockNext = jest.fn();
  });

  describe('isAuth', () => {
    it('calls next with UnAuthorizedError when no authorization header', async () => {
      mockRequest.headers = {};

      await isAuth(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(UnAuthorizedError));
      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({ message: 'Please authenticate' })
      );
    });

    it('calls next with UnAuthorizedError when authorization header does not start with Bearer', async () => {
      mockRequest.headers = { authorization: 'Basic token123' };

      await isAuth(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(UnAuthorizedError));
    });

    it('calls next with UnAuthorizedError when Bearer token is missing', async () => {
      mockRequest.headers = { authorization: 'Bearer ' };

      (jwt.verify as jest.Mock).mockImplementation(() => {
        throw new Error('jwt malformed');
      });

      await isAuth(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(UnAuthorizedError));
    });

    it('sets req.user and calls next when token is valid', async () => {
      const mockPayload = { sub: 'user-123', role: 'user', type: 'access' };
      mockRequest.headers = { authorization: 'Bearer valid-token' };

      (jwt.verify as jest.Mock).mockReturnValue(mockPayload);

      await isAuth(mockRequest as Request, mockResponse as Response, mockNext);

      expect(jwt.verify).toHaveBeenCalledWith('valid-token', config.jwt.secret);
      expect(mockRequest.user).toEqual(mockPayload);
      expect(mockNext).toHaveBeenCalledWith();
    });

    it('calls next with UnAuthorizedError when token verification fails', async () => {
      mockRequest.headers = { authorization: 'Bearer invalid-token' };

      (jwt.verify as jest.Mock).mockImplementation(() => {
        throw new Error('invalid signature');
      });

      await isAuth(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(UnAuthorizedError));
    });

    it('calls next with UnAuthorizedError when token is expired', async () => {
      mockRequest.headers = { authorization: 'Bearer expired-token' };

      (jwt.verify as jest.Mock).mockImplementation(() => {
        throw new jwt.TokenExpiredError('jwt expired', new Date());
      });

      await isAuth(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(UnAuthorizedError));
    });

    it('calls next with UnAuthorizedError when token jti is revoked', async () => {
      const mockPayload = {
        sub: 'user-123',
        role: 'user',
        type: 'access',
        jti: 'revoked-jti',
      };
      mockRequest.headers = { authorization: 'Bearer revoked-token' };

      (jwt.verify as jest.Mock).mockReturnValue(mockPayload);
      mockBlacklist.isRevoked.mockResolvedValue(true);

      await isAuth(mockRequest as Request, mockResponse as Response, mockNext);

      expect(container.resolve).toHaveBeenCalledWith(TokenBlacklistService);
      expect(mockBlacklist.isRevoked).toHaveBeenCalledWith('revoked-jti');
      expect(mockNext).toHaveBeenCalledWith(expect.any(UnAuthorizedError));
      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({ message: 'Token has been revoked' })
      );
    });

    it('allows valid token with non-revoked jti', async () => {
      const mockPayload = {
        sub: 'user-123',
        role: 'user',
        type: 'access',
        jti: 'valid-jti',
      };
      mockRequest.headers = { authorization: 'Bearer valid-token' };

      (jwt.verify as jest.Mock).mockReturnValue(mockPayload);
      mockBlacklist.isRevoked.mockResolvedValue(false);

      await isAuth(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockBlacklist.isRevoked).toHaveBeenCalledWith('valid-jti');
      expect(mockRequest.user).toEqual(mockPayload);
      expect(mockNext).toHaveBeenCalledWith();
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
