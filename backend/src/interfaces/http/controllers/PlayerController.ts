import { Request, Response, NextFunction } from 'express';
import { PlayerUseCases } from '../../../application/use-cases/players/index.js';
import { z } from 'zod';

const registerPlayerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  nameBn: z.string().optional(),
  phone: z.string().min(10, 'Valid phone number is required'),
  position: z.enum(['GK', 'DEF', 'MID', 'FWD']),
  photoUrl: z.string().url().optional(),
});

const assignLevelSchema = z.object({
  level: z.enum(['A', 'B', 'C', 'EXTRA']),
  extraCategoryTag: z.string().nullable().optional(),
});

const setSquadRoleSchema = z.object({
  squadRole: z.enum(['MAIN', 'EXTRA']),
});

export class PlayerController {
  constructor(private playerUseCases: PlayerUseCases) {}

  public getPlayers = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const teamId = req.query.teamId as string | undefined;
      const level = req.query.level as any;
      const data = await this.playerUseCases.getPlayers(teamId, level);
      res.json({ success: true, count: data.length, data });
    } catch (err) {
      next(err);
    }
  };

  public getTopScorers = async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await this.playerUseCases.getTopScorers();
      res.json({ success: true, count: data.length, data });
    } catch (err) {
      next(err);
    }
  };

  public registerPlayer = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const parsed = registerPlayerSchema.parse(req.body);
      const data = await this.playerUseCases.registerPlayer(parsed);
      res.status(201).json({ success: true, message: 'Player registered successfully', data });
    } catch (err) {
      next(err);
    }
  };

  public assignLevel = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const parsed = assignLevelSchema.parse(req.body);
      const data = await this.playerUseCases.assignLevel(req.params.id as string, parsed.level, parsed.extraCategoryTag);
      res.json({ success: true, message: 'Player level updated', data });
    } catch (err) {
      next(err);
    }
  };

  public setSquadRole = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const parsed = setSquadRoleSchema.parse(req.body);
      const data = await this.playerUseCases.setSquadRole(req.params.id as string, parsed.squadRole);
      res.json({ success: true, message: 'Player squad role updated', data });
    } catch (err) {
      next(err);
    }
  };
}
