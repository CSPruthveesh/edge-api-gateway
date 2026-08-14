import { Request, Response } from 'express';
import os from 'os';

export const getHealthStatus = (req: Request, res: Response): void => {
  const correlationId = req.headers['x-correlation-id'] || 'N/A';

  const healthData = {
    status: 'UP',
    service: 'edge-api-gateway',
    timestamp: new Date().toISOString(),
    correlationId,
    uptimeSeconds: Math.floor(process.uptime()),
    system: {
      platform: process.platform,
      arch: os.arch(),
      nodeVersion: process.version,
      cpuCores: os.cpus().length,
      memoryUsageMB: {
        rss: Math.round(process.memoryUsage().rss / 1024 / 1024),
        heapTotal: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
        heapUsed: Math.round(process.memoryUsage().heapUsed / 1024 / 1024)
      }
    }
  };

  res.status(200).json(healthData);
};
