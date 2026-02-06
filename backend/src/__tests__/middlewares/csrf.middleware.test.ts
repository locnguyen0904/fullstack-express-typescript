import { NextFunction, Request, Response } from 'express';

import {
  csrfProtection,
  csrfTokenHandler,
} from '@/middlewares/csrf.middleware';

describe('CSRF Middleware', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: jest.MockedFunction<NextFunction>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockRequest = {
      headers: {},
      cookies: {},
      method: 'POST',
    };
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
      cookie: jest.fn(),
    } as Partial<Response>;
    mockNext = jest.fn();
  });

  describe('csrfProtection', () => {
    it('skips CSRF for requests with Bearer token', () => {
      mockRequest.headers = { authorization: 'Bearer some-token' };
      mockRequest.method = 'POST';
      mockRequest.cookies = { refreshToken: 'encrypted-token' };

      csrfProtection(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledWith();
      expect(mockNext).not.toHaveBeenCalledWith(expect.any(Error));
    });

    it('skips CSRF for Bearer token on DELETE method', () => {
      mockRequest.headers = { authorization: 'Bearer api-key' };
      mockRequest.method = 'DELETE';
      mockRequest.cookies = { refreshToken: 'encrypted-token' };

      csrfProtection(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledWith();
    });

    it.each(['GET', 'HEAD', 'OPTIONS'])(
      'skips CSRF for safe method %s',
      (method) => {
        mockRequest.method = method;

        csrfProtection(
          mockRequest as Request,
          mockResponse as Response,
          mockNext
        );

        expect(mockNext).toHaveBeenCalled();
        expect(mockNext).not.toHaveBeenCalledWith(expect.any(Error));
      }
    );

    it('skips CSRF when no auth cookies present (Swagger, curl)', () => {
      mockRequest.method = 'POST';
      mockRequest.cookies = {};
      mockRequest.headers = {};

      csrfProtection(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledWith();
      expect(mockNext).not.toHaveBeenCalledWith(expect.any(Error));
    });

    it('rejects POST with auth cookie but no CSRF token', () => {
      mockRequest.method = 'POST';
      mockRequest.cookies = { refreshToken: 'encrypted-token' };
      mockRequest.headers = {};

      csrfProtection(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledWith(expect.any(Error));
    });

    it('rejects POST with auth cookie and invalid CSRF token', () => {
      mockRequest.method = 'POST';
      mockRequest.cookies = {
        refreshToken: 'encrypted-token',
        csrf: 'some-cookie-hash',
      };
      mockRequest.headers = { 'x-csrf-token': 'wrong-token' };

      csrfProtection(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledWith(expect.any(Error));
    });

    it('does not skip CSRF for non-Bearer authorization with auth cookie', () => {
      mockRequest.headers = { authorization: 'Basic abc123' };
      mockRequest.method = 'POST';
      mockRequest.cookies = { refreshToken: 'encrypted-token' };

      csrfProtection(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledWith(expect.any(Error));
    });
  });

  describe('csrfTokenHandler', () => {
    it('generates a token and sets cookie', () => {
      csrfTokenHandler(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.cookie).toHaveBeenCalled();
      expect(mockResponse.json).toHaveBeenCalledWith({
        csrfToken: expect.any(String),
      });
    });

    it('returns a non-empty token string', () => {
      csrfTokenHandler(mockRequest as Request, mockResponse as Response);

      const body = (mockResponse.json as jest.Mock).mock.calls[0][0];
      expect(body.csrfToken).toBeTruthy();
      expect(typeof body.csrfToken).toBe('string');
      expect(body.csrfToken.length).toBeGreaterThan(0);
    });
  });

  describe('integration: generate then validate', () => {
    it('accepts request with valid generated token and auth cookie', () => {
      // Step 1: Generate a CSRF token
      const setCookies: Record<string, string> = {};
      const genRes = {
        cookie: jest.fn((name: string, value: string) => {
          setCookies[name] = value;
        }),
        json: jest.fn(),
      } as unknown as Response;

      csrfTokenHandler(mockRequest as Request, genRes);

      const csrfToken = (genRes.json as jest.Mock).mock.calls[0][0].csrfToken;

      // Step 2: Make a POST request with the generated token + auth cookie
      const validRequest: Partial<Request> = {
        method: 'POST',
        headers: { 'x-csrf-token': csrfToken },
        cookies: { ...setCookies, refreshToken: 'encrypted-token' },
      };

      const validateNext = jest.fn();
      csrfProtection(
        validRequest as Request,
        mockResponse as Response,
        validateNext
      );

      expect(validateNext).toHaveBeenCalledWith();
      expect(validateNext).not.toHaveBeenCalledWith(expect.any(Error));
    });
  });
});
