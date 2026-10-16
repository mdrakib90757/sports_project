import { Request, Response, NextFunction } from 'express';
import { AuthUseCases } from '../../../application/use-cases/auth/index.js';
import { z } from 'zod';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

const verifyPinSchema = z.object({
  teamId: z.string().min(1),
  pin: z.string().min(4).max(6),
});

export class AuthController {
  constructor(private authUseCases: AuthUseCases) {}

  public login = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const parsed = loginSchema.parse(req.body);
      const result = await this.authUseCases.login(parsed.email, parsed.password);

      // Set httpOnly cookie
      res.cookie('kpl_token', result.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      res.json({
        success: true,
        message: 'Logged in successfully',
        data: result,
      });
    } catch (err) {
      next(err);
    }
  };

  public verifyCaptainPin = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const parsed = verifyPinSchema.parse(req.body);
      const result = await this.authUseCases.verifyCaptainPin(parsed.teamId, parsed.pin);

      res.cookie('kpl_token', result.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      res.json({
        success: true,
        message: 'Captain PIN verified successfully',
        data: result,
      });
    } catch (err) {
      next(err);
    }
  };

  public logout = async (_req: Request, res: Response) => {
    res.clearCookie('kpl_token');
    res.json({ success: true, message: 'Logged out successfully' });
  };

  public me = async (req: any, res: Response) => {
    res.json({ success: true, user: req.user });
  };
}
