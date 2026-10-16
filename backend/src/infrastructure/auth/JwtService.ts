import jwt from 'jsonwebtoken';
import { UserRole } from '../../domain/enums/index.js';
import { env } from '../../config/env.js';
import { AppError } from '../../shared/errors/AppError.js';

export interface TokenPayload {
  userId: string;
  email: string;
  role: UserRole;
  teamId?: string | null;
}

export class JwtService {
  private secret: string;
  private expiresIn: string;

  constructor(secret = env.JWT_SECRET, expiresIn = env.JWT_EXPIRES_IN) {
    this.secret = secret;
    this.expiresIn = expiresIn;
  }

  public signToken(payload: TokenPayload): string {
    return jwt.sign(payload, this.secret, {
      expiresIn: this.expiresIn as any,
    });
  }

  public verifyToken(token: string): TokenPayload {
    try {
      const decoded = jwt.verify(token, this.secret) as TokenPayload;
      return decoded;
    } catch {
      throw AppError.unauthorized('Invalid or expired token', 'TOKEN_EXPIRED');
    }
  }
}
