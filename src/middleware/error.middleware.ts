import { Request, Response, NextFunction } from 'express';
import { AppError, ErrorCode } from '../constants/error-codes.js';
import logger from '../utils/logger.js';
import envConfig from '../config/env.config.js';

export const errorMiddleware = (
  err: Error | AppError,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction
): void => {
  const correlationId = (req as Request & { id?: string }).id || req.headers['x-correlation-id'] || 'N/A';

  if (err instanceof AppError) {
    logger.warn(
      {
        correlationId,
        statusCode: err.statusCode,
        errorCode: err.errorCode,
        path: req.originalUrl,
        method: req.method,
        details: err.details
      },
      `AppError: ${err.message}`
    );

    res.status(err.statusCode).json({
      success: false,
      error: {
        code: err.errorCode,
        message: err.message,
        details: err.details || null,
        timestamp: new Date().toISOString(),
        correlationId
      }
    });
    return;
  }

  // Unhandled internal server errors
  logger.error(
    {
      correlationId,
      path: req.originalUrl,
      method: req.method,
      stack: err.stack
    },
    `Unhandled Server Error: ${err.message}`
  );

  res.status(500).json({
    success: false,
    error: {
      code: ErrorCode.INTERNAL_SERVER_ERROR,
      message: envConfig.NODE_ENV === 'production' ? 'An internal server error occurred' : err.message,
      timestamp: new Date().toISOString(),
      correlationId
    }
  });
};

export default errorMiddleware;
