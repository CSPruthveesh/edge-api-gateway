import { Request, Response, NextFunction } from 'express';
import auditService from '../services/audit.service.js';

export const auditHookMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  const startTime = Date.now();

  res.on('finish', () => {
    const latencyMs = Date.now() - startTime;
    const correlationId = (req as Request & { id?: string }).id || (req.headers['x-correlation-id'] as string) || 'N/A';
    const clientIp = req.ip || req.headers['x-forwarded-for']?.toString() || req.socket.remoteAddress || '127.0.0.1';

    auditService.push({
      correlationId,
      clientIp,
      method: req.method,
      path: req.originalUrl || req.url,
      statusCode: res.statusCode,
      latencyMs,
      userId: req.user?.id,
      userTier: req.user?.tier,
      userAgent: req.headers['user-agent']
    });
  });

  next();
};

export default auditHookMiddleware;
