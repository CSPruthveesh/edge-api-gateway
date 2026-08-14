import { Request, Response, NextFunction } from 'express';
import jwtService from '../services/jwt.service.js';
import { AppError, ErrorCode } from '../constants/error-codes.js';

export const authMiddleware = (req: Request, _res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return next(new AppError('Authorization header is missing', 401, ErrorCode.UNAUTHORIZED));
  }

  if (!authHeader.startsWith('Bearer ')) {
    return next(
      new AppError('Invalid authorization header format. Must be "Bearer <token>"', 401, ErrorCode.UNAUTHORIZED)
    );
  }

  const token = authHeader.split(' ')[1];
  if (!token || token.trim() === '') {
    return next(new AppError('Bearer token is empty', 401, ErrorCode.UNAUTHORIZED));
  }

  try {
    const userPayload = jwtService.verifyToken(token);
    req.user = userPayload;
    next();
  } catch (error) {
    next(error);
  }
};

export default authMiddleware;
