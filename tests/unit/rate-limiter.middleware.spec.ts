import { Request, Response } from 'express';
import { rateLimiterMiddleware } from '../../src/middleware/rate-limiter.middleware';
import rateLimiterService from '../../src/services/rate-limiter.service';
import { AppError, ErrorCode } from '../../src/constants/error-codes';

jest.mock('../../src/services/rate-limiter.service');

describe('Rate Limiter Middleware Unit Tests', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: jest.Mock;

  beforeEach(() => {
    mockRequest = {
      ip: '127.0.0.1',
      headers: {}
    };
    mockResponse = {
      setHeader: jest.fn()
    };
    mockNext = jest.fn();
    jest.clearAllMocks();
  });

  it('should set headers and call next() when request is within limit', async () => {
    (rateLimiterService.checkRateLimit as jest.Mock).mockResolvedValue({
      allowed: true,
      currentCount: 1,
      remaining: 4,
      limit: 5,
      resetSeconds: 60
    });

    const middleware = rateLimiterMiddleware(5, 60000);
    await middleware(mockRequest as Request, mockResponse as Response, mockNext);

    expect(mockResponse.setHeader).toHaveBeenCalledWith('X-RateLimit-Limit', '5');
    expect(mockResponse.setHeader).toHaveBeenCalledWith('X-RateLimit-Remaining', '4');
    expect(mockResponse.setHeader).toHaveBeenCalledWith('X-RateLimit-Reset', '60');
    expect(mockNext).toHaveBeenCalledWith();
  });

  it('should set Retry-After header and call next with 429 AppError when limit is exceeded', async () => {
    (rateLimiterService.checkRateLimit as jest.Mock).mockResolvedValue({
      allowed: false,
      currentCount: 5,
      remaining: 0,
      limit: 5,
      resetSeconds: 60
    });

    const middleware = rateLimiterMiddleware(5, 60000);
    await middleware(mockRequest as Request, mockResponse as Response, mockNext);

    expect(mockResponse.setHeader).toHaveBeenCalledWith('Retry-After', '60');
    expect(mockNext).toHaveBeenCalledWith(expect.any(AppError));

    const err = mockNext.mock.calls[0][0] as AppError;
    expect(err.statusCode).toBe(429);
    expect(err.errorCode).toBe(ErrorCode.TOO_MANY_REQUESTS);
  });
});
