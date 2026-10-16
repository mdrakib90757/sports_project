import { Request, Response, NextFunction } from 'express';
import { DrawUseCases } from '../../../application/use-cases/draw/index.js';

export class DrawController {
  constructor(private drawUseCases: DrawUseCases) {}

  public getSessionState = async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await this.drawUseCases.getSessionState();
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  };

  public startSession = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const isPractice = Boolean(req.body?.isPractice);
      const session = await this.drawUseCases.startSession(isPractice);
      res.json({ success: true, data: session });
    } catch (err) {
      next(err);
    }
  };

  public nextPick = async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.drawUseCases.nextPick();
      res.json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  };

  public undoLastPick = async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.drawUseCases.undoLastPick();
      res.json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  };

  public resetSession = async (_req: Request, res: Response, next: NextFunction) => {
    try {
      await this.drawUseCases.resetSession();
      res.json({ success: true, message: 'Draw session reset successfully' });
    } catch (err) {
      next(err);
    }
  };
}
