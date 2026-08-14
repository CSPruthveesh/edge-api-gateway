import RedisMock from 'ioredis-mock';
import { RateLimiterService } from '../../src/services/rate-limiter.service';

describe('RateLimiterService Unit Tests', () => {
  let redisMock: InstanceType<typeof RedisMock>;
  let rateLimiter: RateLimiterService;

  beforeEach(() => {
    redisMock = new RedisMock();
    rateLimiter = new RateLimiterService(redisMock as unknown as import('ioredis').Redis);
  });

  afterEach(async () => {
    await redisMock.quit();
  });

  it('should allow requests within rate limit thresholds', async () => {
    const res1 = await rateLimiter.checkRateLimit('client_ip_1', 3, 60000);
    expect(res1.allowed).toBe(true);
    expect(res1.currentCount).toBe(1);
    expect(res1.remaining).toBe(2);

    const res2 = await rateLimiter.checkRateLimit('client_ip_1', 3, 60000);
    expect(res2.allowed).toBe(true);
    expect(res2.currentCount).toBe(2);
    expect(res2.remaining).toBe(1);
  });

  it('should reject requests when threshold is exceeded', async () => {
    await rateLimiter.checkRateLimit('client_ip_2', 2, 60000);
    await rateLimiter.checkRateLimit('client_ip_2', 2, 60000);

    const blockedRes = await rateLimiter.checkRateLimit('client_ip_2', 2, 60000);
    expect(blockedRes.allowed).toBe(false);
    expect(blockedRes.remaining).toBe(0);
  });

  it('should trigger fail-open behavior if Redis operation throws an error', async () => {
    const errorRedisMock = {
      evalsha: jest.fn().mockRejectedValue(new Error('Redis connection lost')),
      eval: jest.fn().mockRejectedValue(new Error('Redis connection lost'))
    };

    const failOpenLimiter = new RateLimiterService(errorRedisMock as unknown as import('ioredis').Redis);
    const result = await failOpenLimiter.checkRateLimit('client_ip_3', 10, 60000);

    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(10);
  });
});
