import { Request, Response } from 'express';
import { authMiddleware } from '../../src/middleware/auth.middleware';
import jwtService, { UserPayload } from '../../src/services/jwt.service';
import { AppError, ErrorCode } from '../../src/constants/error-codes';

describe('Auth Middleware Unit Tests', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: jest.Mock;

  const validPayload: UserPayload = {
    id: 'usr_test_999',
    tier: 'enterprise',
    roles: ['admin']
  };

  beforeEach(() => {
    mockRequest = {
      headers: {}
    };
    mockResponse = {};
    mockNext = jest.fn();
  });

  it('should call next with UNAUTHORIZED AppError if Authorization header is missing', () => {
    authMiddleware(mockRequest as Request, mockResponse as Response, mockNext);

    expect(mockNext).toHaveBeenCalledWith(expect.any(AppError));
    const error = mockNext.mock.calls[0][0] as AppError;
    expect(error.statusCode).toBe(401);
    expect(error.errorCode).toBe(ErrorCode.UNAUTHORIZED);
  });

  it('should call next with UNAUTHORIZED AppError if header does not start with Bearer', () => {
    mockRequest.headers = { authorization: 'Basic dXNlcjpwYXNz' };

    authMiddleware(mockRequest as Request, mockResponse as Response, mockNext);

    expect(mockNext).toHaveBeenCalledWith(expect.any(AppError));
    const error = mockNext.mock.calls[0][0] as AppError;
    expect(error.statusCode).toBe(401);
  });

  it('should attach decoded user to req.user and call next() on valid token', () => {
    const validToken = jwtService.signToken(validPayload);
    mockRequest.headers = { authorization: `Bearer ${validToken}` };

    authMiddleware(mockRequest as Request, mockResponse as Response, mockNext);

    expect(mockNext).toHaveBeenCalledWith();
    expect(mockRequest.user).toBeDefined();
    expect(mockRequest.user?.id).toBe(validPayload.id);
    expect(mockRequest.user?.tier).toBe(validPayload.tier);
  });
});
