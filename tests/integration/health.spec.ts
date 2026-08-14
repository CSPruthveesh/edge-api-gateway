import request from 'supertest';
import createApp from '../../src/app';

describe('GET /health Integration Test', () => {
  const app = createApp();

  it('should return HTTP 200 OK with system readiness metrics', async () => {
    const response = await request(app).get('/health');

    expect(response.status).toBe(200);
    expect(response.body).toEqual(
      expect.objectContaining({
        status: 'UP',
        service: 'edge-api-gateway',
        system: expect.objectContaining({
          platform: expect.any(String),
          nodeVersion: expect.any(String)
        })
      })
    );
  });

  it('should handle non-existent routes with HTTP 404 AppError', async () => {
    const response = await request(app).get('/undefined-route');

    expect(response.status).toBe(404);
    expect(response.body.success).toBe(false);
    expect(response.body.error.code).toBe('NOT_FOUND');
  });
});
