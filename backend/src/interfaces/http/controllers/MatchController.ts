import { Request, Response, NextFunction } from 'express';
import { MatchUseCases } from '../../../application/use-cases/matches/index.js';
import { z } from 'zod';

const updateScoreSchema = z.object({
  homeScore: z.number().int().min(0),
  awayScore: z.number().int().min(0),
  status: z.enum([
    'upcoming',
    'live_first_half',
    'half_time',
    'live_second_half',
    'extra_time',
    'penalties',
    'full_time',
    'postponed',
  ]),
  currentMinute: z.number().int().min(0).max(130),
  isClockRunning: z.boolean(),
});

const recordEventSchema = z.object({
  teamId: z.string().min(1),
  playerId: z.string().min(1),
  assistPlayerId: z.string().nullable().optional(),
  eventType: z.enum([
    'goal',
    'penalty_goal',
    'own_goal',
    'yellow_card',
    'red_card',
    'substitution',
    'var_decision',
  ]),
  minute: z.number().int().min(0).max(130),
  description: z.string().nullable().optional(),
});

export class MatchController {
  constructor(private matchUseCases: MatchUseCases) {}

  public getMatches = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const status = req.query.status as string | undefined;
      const teamId = req.query.teamId as string | undefined;
      const data = await this.matchUseCases.getMatches(status, teamId);
      res.json({ success: true, count: data.length, data });
    } catch (err) {
      next(err);
    }
  };

  public getMatchById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await this.matchUseCases.getMatchById(req.params.id as string);
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  };

  public updateScore = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const parsed = updateScoreSchema.parse(req.body);
      const data = await this.matchUseCases.updateScore(
        req.params.id as string,
        parsed.homeScore,
        parsed.awayScore,
        parsed.status as any,
        parsed.currentMinute,
        parsed.isClockRunning
      );
      res.json({ success: true, message: 'Match score updated', data });
    } catch (err) {
      next(err);
    }
  };

  public recordEvent = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const parsed = recordEventSchema.parse(req.body);
      const data = await this.matchUseCases.recordEvent({
        matchId: req.params.id as string,
        teamId: parsed.teamId,
        playerId: parsed.playerId,
        assistPlayerId: parsed.assistPlayerId,
        eventType: parsed.eventType as any,
        minute: parsed.minute,
        description: parsed.description,
      });
      res.status(201).json({ success: true, message: 'Match event recorded', data });
    } catch (err) {
      next(err);
    }
  };

  public deleteEvent = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id: matchId, eventId } = req.params;
      await this.matchUseCases.deleteEvent(eventId as string, matchId as string);
      res.json({ success: true, message: 'Match event deleted' });
    } catch (err) {
      next(err);
    }
  };
}
