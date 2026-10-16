import { IMatchRepository, ITeamRepository, IPlayerRepository } from '../../../domain/repositories/index.js';
import { Match, MatchEvent } from '../../../domain/entities/index.js';
import { MatchStatus, EventType } from '../../../domain/enums/index.js';
import { RealtimePublisher } from '../../../infrastructure/realtime/RealtimePublisher.js';
import { AppError } from '../../../shared/errors/AppError.js';

export class MatchUseCases {
  constructor(
    private matchRepo: IMatchRepository,
    private teamRepo: ITeamRepository,
    private playerRepo: IPlayerRepository,
    private publisher: RealtimePublisher
  ) {}

  public async getMatches(status?: string, teamId?: string): Promise<Match[]> {
    let matches = await this.matchRepo.findAll();
    const teams = await this.teamRepo.findAll();
    const teamsMap = new Map(teams.map((t) => [t.id, t]));

    // Hydrate home/away teams
    matches = matches.map((m) => ({
      ...m,
      homeTeam: teamsMap.get(m.homeTeamId),
      awayTeam: teamsMap.get(m.awayTeamId),
    }));

    if (status) {
      if (status === 'live') {
        matches = matches.filter((m) => m.status.startsWith('live') || m.status === 'half_time');
      } else {
        matches = matches.filter((m) => m.status === status);
      }
    }

    if (teamId && teamId !== 'all') {
      matches = matches.filter((m) => m.homeTeamId === teamId || m.awayTeamId === teamId);
    }

    return matches;
  }

  public async getMatchById(id: string): Promise<Match> {
    const match = await this.matchRepo.findById(id);
    if (!match) {
      throw AppError.notFound(`Match with ID ${id} not found`);
    }

    const [homeTeam, awayTeam, players] = await Promise.all([
      this.teamRepo.findById(match.homeTeamId),
      this.teamRepo.findById(match.awayTeamId),
      this.playerRepo.findAll(),
    ]);

    const playersMap = new Map(players.map((p) => [p.id, p]));

    const hydratedEvents = (match.events || []).map((e) => ({
      ...e,
      player: playersMap.get(e.playerId),
      assistPlayer: e.assistPlayerId ? playersMap.get(e.assistPlayerId) : undefined,
      team: e.teamId === match.homeTeamId ? homeTeam || undefined : awayTeam || undefined,
    }));

    return {
      ...match,
      homeTeam: homeTeam || undefined,
      awayTeam: awayTeam || undefined,
      events: hydratedEvents,
    };
  }

  public async updateScore(
    matchId: string,
    homeScore: number,
    awayScore: number,
    status: MatchStatus,
    currentMinute: number,
    isClockRunning: boolean
  ): Promise<Match> {
    const updated = await this.matchRepo.updateScore(
      matchId,
      homeScore,
      awayScore,
      status,
      currentMinute,
      isClockRunning
    );

    const hydrated = await this.getMatchById(matchId);

    // Broadcast instant update across all connected devices
    this.publisher.broadcast('MATCH_UPDATE', {
      matchId,
      match: hydrated,
    });

    return hydrated;
  }

  public async recordEvent(data: {
    matchId: string;
    teamId: string;
    playerId: string;
    assistPlayerId?: string | null;
    eventType: EventType;
    minute: number;
    description?: string | null;
  }): Promise<{ event: MatchEvent; match: Match; goalAlert?: any }> {
    const match = await this.matchRepo.findById(data.matchId);
    if (!match) throw AppError.notFound('Match not found');

    const newEvent: MatchEvent = {
      id: `evt-${Date.now()}`,
      matchId: data.matchId,
      teamId: data.teamId,
      playerId: data.playerId,
      assistPlayerId: data.assistPlayerId || null,
      eventType: data.eventType,
      minute: data.minute,
      description: data.description || null,
      createdAt: new Date().toISOString(),
    };

    const savedEvent = await this.matchRepo.addEvent(newEvent);

    let goalAlert = null;
    // Auto increment score on goal
    if (data.eventType === 'goal' || data.eventType === 'penalty_goal') {
      const isHome = match.homeTeamId === data.teamId;
      const nextHomeScore = isHome ? match.homeScore + 1 : match.homeScore;
      const nextAwayScore = !isHome ? match.awayScore + 1 : match.awayScore;

      await this.matchRepo.updateScore(
        match.id,
        nextHomeScore,
        nextAwayScore,
        match.status,
        match.currentMinute,
        match.isClockRunning
      );

      // Increment player goal count
      const player = await this.playerRepo.findById(data.playerId);
      if (player) {
        await this.playerRepo.update({
          ...player,
          goalsCount: (player.goalsCount || 0) + 1,
        });
      }

      const team = await this.teamRepo.findById(data.teamId);
      goalAlert = {
        id: savedEvent.id,
        matchId: match.id,
        team,
        player,
        minute: data.minute,
        homeScore: nextHomeScore,
        awayScore: nextAwayScore,
      };
    }

    const updatedMatch = await this.getMatchById(data.matchId);

    this.publisher.broadcast('EVENT_ADD', {
      event: savedEvent,
      match: updatedMatch,
      alert: goalAlert,
    });

    return { event: savedEvent, match: updatedMatch, goalAlert };
  }

  public async deleteEvent(eventId: string, matchId: string): Promise<void> {
    await this.matchRepo.deleteEvent(eventId);
    const updatedMatch = await this.getMatchById(matchId);

    this.publisher.broadcast('EVENT_DELETE', {
      eventId,
      matchId,
      match: updatedMatch,
    });
  }
}
