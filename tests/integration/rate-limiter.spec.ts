import request from 'supertest';
import createApp from '../../src/app';

describe('Rate Limiter Integration Tests', () => {
  const app = createApp();

  it('GET /api/v1/limited-resource should return rate limit headers on successful request', async () => {
    const response = await request(app).get('/api/v1/limited-resource');

    expect(response.status).toBe(200);
    expect(response.headers['x-ratelimit-limit']).toBe('5');
    expect(response.headers['x-ratelimit-remaining']).toBeDefined();
    expect(response.headers['x-ratelimit-reset']).toBeDefined();
  });
});
