import { Request, Response } from 'express';
import { AppError, ErrorCode } from '../../src/constants/error-codes';
import { errorMiddleware } from '../../src/middleware/error.middleware';

describe('Error Middleware', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: jest.Mock;

  beforeEach(() => {
    mockRequest = {
      originalUrl: '/test-route',
      method: 'GET',
      headers: {}
    };
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis()
    };
    mockNext = jest.fn();
  });

  it('should correctly format operational AppError responses', () => {
    const appError = new AppError('Resource not found', 404, ErrorCode.NOT_FOUND);

    errorMiddleware(appError, mockRequest as Request, mockResponse as Response, mockNext);

    expect(mockResponse.status).toHaveBeenCalledWith(404);
    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        error: expect.objectContaining({
          code: ErrorCode.NOT_FOUND,
          message: 'Resource not found'
        })
      })
    );
  });

  it('should format unhandled errors as HTTP 500 INTERNAL_SERVER_ERROR', () => {
    const genericError = new Error('Unexpected crash');

    errorMiddleware(genericError, mockRequest as Request, mockResponse as Response, mockNext);

    expect(mockResponse.status).toHaveBeenCalledWith(500);
    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        error: expect.objectContaining({
          code: ErrorCode.INTERNAL_SERVER_ERROR
        })
      })
    );
  });
});
