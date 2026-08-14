import pinoHttp from 'pino-http';
import { randomUUID } from 'crypto';
import logger from '../utils/logger.js';

export const loggerMiddleware = pinoHttp({
  logger,
  genReqId: (req) => {
    const existingId = req.headers['x-correlation-id'] || req.headers['x-request-id'];
    if (existingId && typeof existingId === 'string') {
      return existingId;
    }
    return randomUUID();
  },
  customAttributeKeys: {
    req: 'request',
    res: 'response',
    err: 'error',
    responseTime: 'latencyMs'
  },
  customProps: (req) => {
    return {
      correlationId: req.id
    };
  },
  serializers: {
    req: (req) => ({
      method: req.method,
      url: req.url,
      ip: req.remoteAddress
    }),
    res: (res) => ({
      statusCode: res.statusCode
    })
  }
});

export default loggerMiddleware;
