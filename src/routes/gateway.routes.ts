import { Router, Request, Response, NextFunction } from 'express';
import routeRuleRepository from '../database/repositories/route-rule.repository.js';
import proxyService from '../services/proxy.service.js';
import authMiddleware from '../middleware/auth.middleware.js';
import rateLimiterMiddleware from '../middleware/rate-limiter.middleware.js';

const router = Router();

/**
 * Dynamic gateway catch-all proxy router middleware.
 */
export const dynamicGatewayRouter = (req: Request, res: Response, next: NextFunction): void => {
  const matchingRule = routeRuleRepository.findMatchingRule(req.path);

  if (!matchingRule) {
    return next(); // Fall through to standard 404 handler if no route rule matches
  }

  // Chain handlers dynamically: Auth (optional) -> RateLimiter (optional) -> Proxy
  const chain: Array<(req: Request, res: Response, next: NextFunction) => void> = [];

  if (matchingRule.authRequired) {
    chain.push(authMiddleware);
  }

  if (matchingRule.rateLimitMax) {
    chain.push(rateLimiterMiddleware(matchingRule.rateLimitMax, matchingRule.rateLimitWindowMs || 60000));
  }

  const proxyHandler = proxyService.createProxyHandler(matchingRule);
  chain.push(proxyHandler as unknown as (req: Request, res: Response, next: NextFunction) => void);

  // Execute middleware chain sequentially
  let index = 0;
  const executeChain = (err?: unknown) => {
    if (err) {
      return next(err);
    }
    if (index >= chain.length) {
      return;
    }
    const currentMiddleware = chain[index++];
    try {
      currentMiddleware(req, res, executeChain);
    } catch (e) {
      next(e);
    }
  };

  executeChain();
};

router.use(dynamicGatewayRouter);

export default router;
