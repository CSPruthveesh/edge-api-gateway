import { Redis } from 'ioredis';
import { randomUUID } from 'crypto';
import redisClient from '../config/redis.config.js';
import { SLIDING_WINDOW_LUA_SCRIPT } from '../utils/lua-loader.js';
import logger from '../utils/logger.js';

export interface RateLimitResult {
  allowed: boolean;
  currentCount: number;
  remaining: number;
  limit: number;
  resetSeconds: number;
}

export class RateLimiterService {
  private redis: Redis;
  private luaSha: string | null = null;

  constructor(redisInstance: Redis = redisClient) {
    this.redis = redisInstance;
  }

  /**
   * Pre-loads the sliding window Lua script into Redis script cache to get SHA digest.
   */
  public async initLuaScript(): Promise<string> {
    try {
      this.luaSha = (await this.redis.script('LOAD', SLIDING_WINDOW_LUA_SCRIPT)) as string;
      logger.info({ luaSha: this.luaSha }, 'Sliding-window Lua script pre-loaded successfully');
      return this.luaSha;
    } catch (err) {
      logger.warn({ err }, 'Failed to pre-load Lua script SHA into Redis; will fallback to EVAL');
      return '';
    }
  }

  /**
   * Evaluates rate limit for a client identifier using sliding-window Lua script.
   */
  public async checkRateLimit(
    identifier: string,
    maxRequests: number = 1000,
    windowMs: number = 60000
  ): Promise<RateLimitResult> {
    const key = `rate_limit:${identifier}`;
    const now = Date.now();
    const memberId = `${now}:${randomUUID()}`;

    try {
      let evalResult: [number, number, number];

      if (this.luaSha) {
        try {
          evalResult = (await this.redis.evalsha(
            this.luaSha,
            1,
            key,
            now.toString(),
            windowMs.toString(),
            maxRequests.toString(),
            memberId
          )) as [number, number, number];
        } catch (shaErr: unknown) {
          if (shaErr instanceof Error && shaErr.message.includes('NOSCRIPT')) {
            await this.initLuaScript();
            evalResult = (await this.redis.eval(
              SLIDING_WINDOW_LUA_SCRIPT,
              1,
              key,
              now.toString(),
              windowMs.toString(),
              maxRequests.toString(),
              memberId
            )) as [number, number, number];
          } else {
            throw shaErr;
          }
        }
      } else {
        evalResult = (await this.redis.eval(
          SLIDING_WINDOW_LUA_SCRIPT,
          1,
          key,
          now.toString(),
          windowMs.toString(),
          maxRequests.toString(),
          memberId
        )) as [number, number, number];
      }

      const allowed = evalResult[0] === 1;
      const currentCount = evalResult[1];
      const remaining = evalResult[2];

      return {
        allowed,
        currentCount,
        remaining,
        limit: maxRequests,
        resetSeconds: Math.ceil(windowMs / 1000)
      };
    } catch (error) {
      logger.error({ error, identifier }, 'Error evaluating rate limit via Redis; triggering fail-open policy');
      // Fail-open strategy: allow request if Redis fails to avoid dropping valid traffic
      return {
        allowed: true,
        currentCount: 0,
        remaining: maxRequests,
        limit: maxRequests,
        resetSeconds: Math.ceil(windowMs / 1000)
      };
    }
  }
}

export const rateLimiterService = new RateLimiterService();
export default rateLimiterService;
