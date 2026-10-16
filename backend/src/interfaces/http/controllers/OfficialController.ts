import { Request, Response, NextFunction } from 'express';
import { OfficialUseCases } from '../../../application/use-cases/officials/index.js';

export class OfficialController {
  constructor(private officialUseCases: OfficialUseCases) {}

  public getOfficials = async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await this.officialUseCases.getOfficials();
      res.json({ success: true, count: data.length, data });
    } catch (err) {
      next(err);
    }
  };
}
