import http from 'http';
import createApp from './app.js';
import envConfig from './config/env.config.js';
import logger from './utils/logger.js';

const app = createApp();
const server = http.createServer(app);

const startServer = (): void => {
  server.listen(envConfig.PORT, envConfig.HOST, () => {
    logger.info(
      {
        port: envConfig.PORT,
        host: envConfig.HOST,
        env: envConfig.NODE_ENV
      },
      `Edge API Gateway started successfully on http://${envConfig.HOST}:${envConfig.PORT}`
    );
  });
};

const gracefulShutdown = (signal: string): void => {
  logger.info({ signal }, `Received ${signal}. Initiating graceful shutdown...`);

  server.close((err) => {
    if (err) {
      logger.error({ err }, 'Error during HTTP server shutdown');
      process.exit(1);
    }
    logger.info('HTTP server closed successfully');
    process.exit(0);
  });

  // Force shutdown after 10s if connections fail to close
  setTimeout(() => {
    logger.error('Forcefully shutting down gateway process due to timeout');
    process.exit(1);
  }, 10000).unref();
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

process.on('uncaughtException', (err: Error) => {
  logger.fatal({ err, stack: err.stack }, 'Uncaught Exception detected!');
  process.exit(1);
});

process.on('unhandledRejection', (reason: unknown) => {
  logger.fatal({ reason }, 'Unhandled Promise Rejection detected!');
  process.exit(1);
});

startServer();

export { server };
