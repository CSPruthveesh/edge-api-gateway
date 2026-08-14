import express, { Application } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import loggerMiddleware from './middleware/logger.middleware.js';
import auditHookMiddleware from './middleware/audit-hook.middleware.js';
import errorMiddleware from './middleware/error.middleware.js';
import authMiddleware from './middleware/auth.middleware.js';
import rateLimiterMiddleware from './middleware/rate-limiter.middleware.js';
import healthRoutes from './routes/health.routes.js';
import authRoutes from './routes/auth.routes.js';
import gatewayRoutes from './routes/gateway.routes.js';
import { AppError, ErrorCode } from './constants/error-codes.js';

export const createApp = (): Application => {
  const app: Application = express();

  // Security and core middleware
  app.use(helmet());
  app.use(cors());
  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: true, limit: '1mb' }));

  // HTTP Request Logging and non-blocking audit hook
  app.use(loggerMiddleware);
  app.use(auditHookMiddleware);


  // Core API Routes
  app.use('/', healthRoutes);
  app.use('/', authRoutes);

  // Protected test endpoint for zero-trust auth verification
  app.get('/api/v1/protected/me', authMiddleware, (req, res) => {
    res.status(200).json({
      success: true,
      user: req.user
    });
  });

  // Test endpoint for rate limiting verification (5 requests / 60s window)
  app.get('/api/v1/limited-resource', rateLimiterMiddleware(5, 60000), (req, res) => {
    res.status(200).json({
      success: true,
      message: 'Access granted within rate limits'
    });
  });

  // Dynamic Microservice Catch-All Gateway Router
  app.use('/', gatewayRoutes);

  // Catch-all 404 handler for undefined routes
  app.use((req, res, next) => {
    next(new AppError(`Route ${req.method} ${req.originalUrl} not found`, 404, ErrorCode.NOT_FOUND));
  });

  // Global Error Handler Middleware
  app.use(errorMiddleware);

  return app;
};

export default createApp;



