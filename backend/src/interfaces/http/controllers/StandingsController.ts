import { Request, Response, NextFunction } from 'express';
import { StandingsUseCases } from '../../../application/use-cases/standings/index.js';

export class StandingsController {
  constructor(private standingsUseCases: StandingsUseCases) {}

  public getStandings = async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await this.standingsUseCases.getStandings();
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  };
}
