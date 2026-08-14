import express, { Application } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import loggerMiddleware from './middleware/logger.middleware.js';
import errorMiddleware from './middleware/error.middleware.js';
import authMiddleware from './middleware/auth.middleware.js';
import healthRoutes from './routes/health.routes.js';
import authRoutes from './routes/auth.routes.js';
import { AppError, ErrorCode } from './constants/error-codes.js';

export const createApp = (): Application => {
  const app: Application = express();

  // Security and core middleware
  app.use(helmet());
  app.use(cors());
  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: true, limit: '1mb' }));

  // HTTP Request Logging and correlation tracing
  app.use(loggerMiddleware);

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

  // Catch-all 404 handler for undefined routes
  app.use((req, res, next) => {
    next(new AppError(`Route ${req.method} ${req.originalUrl} not found`, 404, ErrorCode.NOT_FOUND));
  });

  // Global Error Handler Middleware
  app.use(errorMiddleware);

  return app;
};

export default createApp;

