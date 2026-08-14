import jwt, { SignOptions } from 'jsonwebtoken';
import envConfig from '../config/env.config.js';
import { AppError, ErrorCode } from '../constants/error-codes.js';

export interface UserPayload {
  id: string;
  email?: string;
  tier: 'free' | 'pro' | 'enterprise';
  roles: string[];
  [key: string]: unknown;
}

export class JwtService {
  private readonly secret: string;
  private readonly expiresIn: string;

  constructor() {
    this.secret = envConfig.JWT_SECRET;
    this.expiresIn = envConfig.JWT_EXPIRES_IN;
  }

  /**
   * Signs a payload and returns a signed JWT token string.
   */
  public signToken(payload: UserPayload, options?: SignOptions): string {
    try {
      return jwt.sign(payload, this.secret, {
        expiresIn: this.expiresIn as jwt.SignOptions['expiresIn'],
        ...options
      });
    } catch (error) {
      throw new AppError('Failed to sign JWT token', 500, ErrorCode.INTERNAL_SERVER_ERROR, error);
    }
  }

  /**
   * Performs high-speed stateless in-memory verification of JWT tokens.
   */
  public verifyToken(token: string): UserPayload {
    try {
      const decoded = jwt.verify(token, this.secret) as UserPayload;
      if (!decoded || !decoded.id) {
        throw new AppError('Invalid token claims structure', 401, ErrorCode.INVALID_TOKEN);
      }
      return decoded;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      if (error instanceof jwt.TokenExpiredError) {
        throw new AppError('JWT token has expired', 401, ErrorCode.TOKEN_EXPIRED);
      }
      if (error instanceof jwt.JsonWebTokenError) {
        throw new AppError('Invalid JWT token signature', 401, ErrorCode.INVALID_TOKEN);
      }
      throw new AppError('Authentication failed', 401, ErrorCode.UNAUTHORIZED, error);
    }
  }
}

export const jwtService = new JwtService();
export default jwtService;
