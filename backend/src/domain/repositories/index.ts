import {
  Team,
  Player,
  Match,
  MatchEvent,
  MatchLineupItem,
  Official,
  User,
  DrawSession,
  DrawPick,
} from '../entities/index.js';
import { PlayerLevel, MatchStatus, SquadRole } from '../enums/index.js';

export interface ITeamRepository {
  findAll(): Promise<Team[]>;
  findById(id: string): Promise<Team | null>;
  create(team: Team): Promise<Team>;
  update(team: Team): Promise<Team>;
}

export interface IPlayerRepository {
  findAll(): Promise<Player[]>;
  findById(id: string): Promise<Player | null>;
  findByTeamId(teamId: string): Promise<Player[]>;
  findByPhone(phone: string): Promise<Player | null>;
  create(player: Player): Promise<Player>;
  update(player: Player): Promise<Player>;
  updateLevel(id: string, level: PlayerLevel, extraCategoryTag?: string | null): Promise<Player>;
  updateSquadRole(id: string, squadRole: SquadRole): Promise<Player>;
  assignToTeam(id: string, teamId: string | null): Promise<Player>;
}

export interface IMatchRepository {
  findAll(): Promise<Match[]>;
  findById(id: string): Promise<Match | null>;
  updateScore(
    id: string,
    homeScore: number,
    awayScore: number,
    status: MatchStatus,
    currentMinute: number,
    isClockRunning: boolean
  ): Promise<Match>;
  addEvent(event: MatchEvent): Promise<MatchEvent>;
  deleteEvent(eventId: string): Promise<void>;
  getEventsByMatchId(matchId: string): Promise<MatchEvent[]>;
  getLineupsByMatchId(matchId: string): Promise<MatchLineupItem[]>;
}

export interface IOfficialRepository {
  findAll(): Promise<Official[]>;
  findById(id: string): Promise<Official | null>;
  create(official: Official): Promise<Official>;
  update(official: Official): Promise<Official>;
  delete(id: string): Promise<void>;
}

export interface IUserRepository {
  findByEmail(email: string): Promise<User | null>;
  findById(id: string): Promise<User | null>;
  create(user: User): Promise<User>;
}

export interface IDrawRepository {
  getActiveSession(): Promise<DrawSession | null>;
  createSession(session: DrawSession): Promise<DrawSession>;
  updateSession(session: DrawSession): Promise<DrawSession>;
  addPick(pick: DrawPick): Promise<DrawPick>;
  getPicks(sessionId: string): Promise<DrawPick[]>;
  undoLastPick(sessionId: string): Promise<DrawPick | null>;
  resetSession(sessionId: string): Promise<void>;
}
