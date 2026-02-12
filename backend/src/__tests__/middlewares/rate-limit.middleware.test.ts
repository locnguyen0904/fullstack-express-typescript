describe('Rate Limit Middleware', () => {
  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
  });

  it('should export apiLimiter and authLimiter as functions', async () => {
    const { apiLimiter, authLimiter } =
      await import('@/middlewares/rate-limit.middleware');

    expect(typeof apiLimiter).toBe('function');
    expect(typeof authLimiter).toBe('function');
  });

  it('should bypass rate limiting in test environment', async () => {
    process.env.NODE_ENV = 'test';

    const { apiLimiter } =
      (await import('@/middlewares/rate-limit.middleware')) as {
        apiLimiter: (req: unknown, res: unknown, next: jest.Mock) => void;
      };

    const mockNext = jest.fn();
    apiLimiter({}, {}, mockNext);

    // In test env, rate limiter is a noop — next() called immediately
    expect(mockNext).toHaveBeenCalled();
  });
});
