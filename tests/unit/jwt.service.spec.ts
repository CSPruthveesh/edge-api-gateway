import jwtService, { UserPayload } from '../../src/services/jwt.service';
import { AppError, ErrorCode } from '../../src/constants/error-codes';

describe('JwtService Unit Tests', () => {
  const mockPayload: UserPayload = {
    id: 'user_12345',
    email: 'engineer@edge.io',
    tier: 'pro',
    roles: ['developer', 'admin']
  };

  it('should successfully sign and verify a valid JWT token', () => {
    const token = jwtService.signToken(mockPayload);
    expect(typeof token).toBe('string');

    const decoded = jwtService.verifyToken(token);
    expect(decoded.id).toBe(mockPayload.id);
    expect(decoded.tier).toBe(mockPayload.tier);
    expect(decoded.roles).toEqual(mockPayload.roles);
  });

  it('should throw TOKEN_EXPIRED AppError when token has expired', () => {
    const expiredToken = jwtService.signToken(mockPayload, { expiresIn: '-1s' });

    expect(() => jwtService.verifyToken(expiredToken)).toThrow(AppError);
    try {
      jwtService.verifyToken(expiredToken);
    } catch (err) {
      const error = err as AppError;
      expect(error.errorCode).toBe(ErrorCode.TOKEN_EXPIRED);
      expect(error.statusCode).toBe(401);
    }
  });

  it('should throw INVALID_TOKEN AppError when token signature is tampered', () => {
    const validToken = jwtService.signToken(mockPayload);
    const tamperedToken = validToken.substring(0, validToken.length - 5) + 'xxxxx';

    expect(() => jwtService.verifyToken(tamperedToken)).toThrow(AppError);
    try {
      jwtService.verifyToken(tamperedToken);
    } catch (err) {
      const error = err as AppError;
      expect(error.errorCode).toBe(ErrorCode.INVALID_TOKEN);
      expect(error.statusCode).toBe(401);
    }
  });
});
