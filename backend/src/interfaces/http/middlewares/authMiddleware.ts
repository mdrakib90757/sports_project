import { Request, Response, NextFunction } from 'express';
import { JwtService, TokenPayload } from '../../../infrastructure/auth/JwtService.js';
import { UserRole } from '../../../domain/enums/index.js';
import { AppError } from '../../../shared/errors/AppError.js';

export interface AuthenticatedRequest extends Request {
  user?: TokenPayload;
}

export function requireAuth(allowedRoles: UserRole[] = ['ADMIN', 'OPERATOR', 'CAPTAIN']) {
  const jwtService = new JwtService();

  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    let token: string | undefined;

    // Check Authorization header
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    } else if (req.cookies && req.cookies.kpl_token) {
      token = req.cookies.kpl_token;
    }

    if (!token) {
      return next(AppError.unauthorized('Authentication required', 'NO_TOKEN'));
    }

    try {
      const payload = jwtService.verifyToken(token);
      req.user = payload;

      if (!allowedRoles.includes(payload.role)) {
        return next(AppError.forbidden(`Role '${payload.role}' does not have sufficient permissions`));
      }

      next();
    } catch (err) {
      next(err);
    }
  };
}
