import request from 'supertest';
import createApp from '../../src/app';
import rateLimiterService from '../../src/services/rate-limiter.service';

describe('Resilience & Fault Tolerance Integration Tests', () => {
  const app = createApp();

  it('should fail-open gracefully when Redis rate limiter evaluation fails', async () => {
    // Mock checkRateLimit to simulate a Redis connection drop / timeout
    jest.spyOn(rateLimiterService, 'checkRateLimit').mockRejectedValueOnce(new Error('Redis connection timeout'));

    const response = await request(app).get('/api/v1/limited-resource');

    // Should return 200 OK because rateLimiterMiddleware catches errors and calls next()
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
  });
});
