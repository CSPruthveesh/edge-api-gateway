import { Request, Response, NextFunction } from 'express';
import jwtService, { UserPayload } from '../services/jwt.service.js';
import { AppError, ErrorCode } from '../constants/error-codes.js';

export const generateTestToken = (req: Request, res: Response, next: NextFunction): void => {
  try {
    const { id, email, tier, roles } = req.body;

    const payload: UserPayload = {
      id: id || `usr_${Math.random().toString(36).substring(2, 9)}`,
      email: email || 'test-engineer@edge.io',
      tier: tier || 'free',
      roles: Array.isArray(roles) ? roles : ['user']
    };

    const token = jwtService.signToken(payload);

    res.status(200).json({
      success: true,
      message: 'Token issued successfully',
      data: {
        token,
        expiresIn: '1h',
        user: payload
      }
    });
  } catch (error) {
    next(new AppError('Failed to generate authentication token', 500, ErrorCode.INTERNAL_SERVER_ERROR, error));
  }
};
