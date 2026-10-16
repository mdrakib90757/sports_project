import { Request, Response, NextFunction } from 'express';
import { TeamUseCases } from '../../../application/use-cases/teams/index.js';

export class TeamController {
  constructor(private teamUseCases: TeamUseCases) {}

  public getTeams = async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await this.teamUseCases.getTeams();
      res.json({ success: true, count: data.length, data });
    } catch (err) {
      next(err);
    }
  };

  public getTeamById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await this.teamUseCases.getTeamById(req.params.id as string);
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  };
}
