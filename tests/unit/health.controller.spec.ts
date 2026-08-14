import { Request, Response } from 'express';
import { getHealthStatus } from '../../src/controllers/health.controller';

describe('Health Controller Unit Tests', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;

  beforeEach(() => {
    mockRequest = {
      headers: {
        'x-correlation-id': 'unit-test-correlation-123'
      }
    };
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis()
    };
  });

  it('should return 200 OK status with correlationId and uptime metrics', () => {
    getHealthStatus(mockRequest as Request, mockResponse as Response);

    expect(mockResponse.status).toHaveBeenCalledWith(200);
    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        status: 'UP',
        service: 'edge-api-gateway',
        correlationId: 'unit-test-correlation-123',
        uptimeSeconds: expect.any(Number),
        system: expect.objectContaining({
          platform: expect.any(String),
          arch: expect.any(String),
          nodeVersion: expect.any(String),
          cpuCores: expect.any(Number),
          memoryUsageMB: expect.objectContaining({
            rss: expect.any(Number),
            heapTotal: expect.any(Number),
            heapUsed: expect.any(Number)
          })
        })
      })
    );
  });

  it('should fallback to N/A correlationId if header is missing', () => {
    mockRequest.headers = {};
    getHealthStatus(mockRequest as Request, mockResponse as Response);

    expect(mockResponse.status).toHaveBeenCalledWith(200);
    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        correlationId: 'N/A'
      })
    );
  });
});
