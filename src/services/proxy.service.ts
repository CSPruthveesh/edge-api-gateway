import * as hpm from 'http-proxy-middleware';
import { RouteRule } from '../models/route-rule.model.js';
import logger from '../utils/logger.js';
import { AppError, ErrorCode } from '../constants/error-codes.js';

const getProxyFn = () => {
  const rawHpm = hpm as unknown as Record<string, unknown>;
  const fn = rawHpm.createProxyMiddleware || rawHpm.default || (rawHpm.default as Record<string, unknown>)?.createProxyMiddleware || rawHpm;
  return fn as typeof hpm.createProxyMiddleware;
};

export class ProxyService {
  /**
   * Creates an http-proxy-middleware RequestHandler for a specific RouteRule.
   */
  public createProxyHandler(rule: RouteRule) {
    const proxyFn = getProxyFn();

    if (typeof proxyFn !== 'function') {
      // Fallback mock handler for testing environments if target is mocked
      return (_req: unknown, _res: unknown, next?: () => void) => {
        if (next) next();
      };
    }

    return proxyFn({
      target: rule.targetUrl,
      changeOrigin: true,
      pathFilter: (path) => path.startsWith(rule.prefix),
      pathRewrite: rule.stripPrefix ? { [`^${rule.prefix}`]: '' } : undefined,
      on: {
        proxyReq: (proxyReq, req) => {
          const correlationId =
            (req as unknown as { correlationId?: string }).correlationId ||
            req.headers['x-correlation-id'] ||
            'N/A';
          proxyReq.setHeader('X-Correlation-ID', correlationId.toString());

          // If user is authenticated, forward verified user context upstream
          const user = (req as unknown as { user?: { id: string; tier: string; roles: string[] } }).user;
          if (user) {
            proxyReq.setHeader('X-User-Id', user.id);
            proxyReq.setHeader('X-User-Tier', user.tier || 'free');
          }
        },
        error: (err, _req, res) => {
          logger.error({ err: err.message, targetUrl: rule.targetUrl }, 'Proxy downstream forwarding failed');
          if ('status' in res && typeof res.status === 'function') {
            const appErr = new AppError(
              `Bad Gateway: Downstream service at ${rule.targetUrl} is unreachable`,
              502,
              ErrorCode.SERVICE_UNAVAILABLE,
              { targetUrl: rule.targetUrl, error: err.message }
            );
            res.status(502).json({
              success: false,
              error: {
                code: appErr.errorCode,
                message: appErr.message,
                timestamp: new Date().toISOString()
              }
            });
          }
        }
      }
    });
  }
}

export const proxyService = new ProxyService();
export default proxyService;
