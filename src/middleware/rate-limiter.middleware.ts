import { Request, Response, NextFunction } from 'express';
import rateLimiterService from '../services/rate-limiter.service.js';
import envConfig from '../config/env.config.js';
import { AppError, ErrorCode } from '../constants/error-codes.js';

export const rateLimiterMiddleware = (
  maxRequests: number = envConfig.DEFAULT_RATE_LIMIT_MAX_REQUESTS,
  windowMs: number = envConfig.DEFAULT_RATE_LIMIT_WINDOW_MS
) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    // Determine rate limit identifier: authenticated User ID or Client IP address
    const identifier = req.user?.id || req.ip || req.headers['x-forwarded-for']?.toString() || 'anonymous';

    try {
      const result = await rateLimiterService.checkRateLimit(identifier, maxRequests, windowMs);

      // Inject standard rate limiting HTTP headers
      res.setHeader('X-RateLimit-Limit', result.limit.toString());
      res.setHeader('X-RateLimit-Remaining', result.remaining.toString());
      res.setHeader('X-RateLimit-Reset', result.resetSeconds.toString());

      if (!result.allowed) {
        res.setHeader('Retry-After', result.resetSeconds.toString());
        return next(
          new AppError(
            `Rate limit exceeded. Maximum allowed: ${result.limit} requests per ${Math.ceil(windowMs / 1000)}s window.`,
            429,
            ErrorCode.TOO_MANY_REQUESTS,
            {
              limit: result.limit,
              currentCount: result.currentCount,
              retryAfterSeconds: result.resetSeconds
            }
          )
        );
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

export default rateLimiterMiddleware;
