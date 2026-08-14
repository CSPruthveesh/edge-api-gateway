import request from 'supertest';
import createApp from '../../src/app';

describe('Auth Integration Tests', () => {
  const app = createApp();

  it('POST /api/v1/auth/token should generate a valid JWT token', async () => {
    const response = await request(app).post('/api/v1/auth/token').send({
      id: 'usr_integration_77',
      tier: 'pro',
      roles: ['developer']
    });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.token).toBeDefined();
    expect(response.body.data.user.id).toBe('usr_integration_77');
    expect(response.body.data.user.tier).toBe('pro');
  });

  it('GET /api/v1/protected/me should reject unauthenticated requests with 401', async () => {
    const response = await request(app).get('/api/v1/protected/me');

    expect(response.status).toBe(401);
    expect(response.body.success).toBe(false);
    expect(response.body.error.code).toBe('UNAUTHORIZED');
  });

  it('GET /api/v1/protected/me should accept valid Bearer tokens and return user context', async () => {
    const tokenRes = await request(app).post('/api/v1/auth/token').send({
      id: 'usr_authenticated_100',
      tier: 'enterprise'
    });

    const token = tokenRes.body.data.token;

    const response = await request(app)
      .get('/api/v1/protected/me')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.user.id).toBe('usr_authenticated_100');
    expect(response.body.user.tier).toBe('enterprise');
  });
});
