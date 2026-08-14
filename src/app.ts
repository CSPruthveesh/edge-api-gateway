import express, { Application } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import loggerMiddleware from './middleware/logger.middleware.js';
import errorMiddleware from './middleware/error.middleware.js';
import healthRoutes from './routes/health.routes.js';
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

  // Catch-all 404 handler for undefined routes
  app.use((req, res, next) => {
    next(new AppError(`Route ${req.method} ${req.originalUrl} not found`, 404, ErrorCode.NOT_FOUND));
  });

  // Global Error Handler Middleware
  app.use(errorMiddleware);

  return app;
};

export default createApp;
