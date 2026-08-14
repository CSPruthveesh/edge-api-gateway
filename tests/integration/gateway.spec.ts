import request from 'supertest';
import http from 'http';
import createApp from '../../src/app';
import { createMockServer } from '../../scripts/mock-downstream';
import jwtService from '../../src/services/jwt.service';

describe('End-to-End Dynamic Proxy Gateway Integration Tests', () => {
  const app = createApp();
  let mockUserService: http.Server;

  beforeAll((done) => {
    mockUserService = createMockServer('User Microservice', 8001);
    mockUserService.on('listening', () => done());
  });

  afterAll((done) => {
    mockUserService.close(done);
  });

  it('should reject unauthenticated requests to protected microservice routes with 401', async () => {
    const response = await request(app).get('/api/v1/users/profile');

    expect(response.status).toBe(401);
    expect(response.body.success).toBe(false);
    expect(response.body.error.code).toBe('UNAUTHORIZED');
  });

  it('should forward authenticated requests downstream with enriched headers', async () => {
    const token = jwtService.signToken({
      id: 'usr_proxy_test_42',
      tier: 'enterprise',
      roles: ['developer']
    });

    const response = await request(app)
      .get('/api/v1/users/profile')
      .set('Authorization', `Bearer ${token}`)
      .set('X-Correlation-ID', 'corr-gateway-test-999');

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.service).toBe('User Microservice');
    expect(response.body.receivedHeaders.userId).toBe('usr_proxy_test_42');
    expect(response.body.receivedHeaders.userTier).toBe('enterprise');
    expect(response.body.receivedHeaders.correlationId).toBe('corr-gateway-test-999');
  });
});
