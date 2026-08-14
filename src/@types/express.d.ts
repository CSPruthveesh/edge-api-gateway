import { UserPayload } from '../services/jwt.service.js';

declare global {
  namespace Express {
    interface Request {
      user?: UserPayload;
      correlationId?: string;
      startTime?: number;
    }
  }
}
