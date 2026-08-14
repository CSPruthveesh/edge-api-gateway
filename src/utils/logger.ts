import pino from 'pino';
import envConfig from '../config/env.config.js';

export const logger = pino({
  level: envConfig.LOG_LEVEL || 'info',
  base: {
    env: envConfig.NODE_ENV,
    service: 'edge-api-gateway'
  },
  timestamp: pino.stdTimeFunctions.isoTime,
  formatters: {
    level: (label) => ({ level: label.toUpperCase() })
  }
});

export default logger;
