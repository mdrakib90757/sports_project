import { IDrawRepository, ITeamRepository, IPlayerRepository } from '../../../domain/repositories/index.js';
import { DrawSession, DrawPick, Team, Player } from '../../../domain/entities/index.js';
import { PlayerLevel } from '../../../domain/enums/index.js';
import { DrawEngine } from '../../../domain/services/DrawEngine.js';
import { CryptoRngAdapter } from '../../../infrastructure/rng/CryptoRngAdapter.js';
import { RealtimePublisher } from '../../../infrastructure/realtime/RealtimePublisher.js';
import { AppError } from '../../../shared/errors/AppError.js';

export class DrawUseCases {
  constructor(
    private drawRepo: IDrawRepository,
    private teamRepo: ITeamRepository,
    private playerRepo: IPlayerRepository,
    private rng: CryptoRngAdapter,
    private publisher: RealtimePublisher
  ) {}

  public async getSessionState(): Promise<{
    session: DrawSession;
    teams: (Team & { squad: Player[]; captainPlayer?: Player })[];
    remainingPool: Player[];
    currentTurn?: { team: Team; roundNumber: number; pickIndex: number; level: PlayerLevel };
    picks: DrawPick[];
  }> {
    let session = await this.drawRepo.getActiveSession();
    if (!session) {
      session = await this.drawRepo.createSession({
        id: 'session-main-1',
        status: 'idle',
        currentLevel: 'A',
        currentRound: 1,
        totalPicks: 0,
        isPractice: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }

    const [teams, allPlayers, picks] = await Promise.all([
      this.teamRepo.findAll(),
      this.playerRepo.findAll(),
      this.drawRepo.getPicks(session.id),
    ]);

    // Registered pool players who are not captains
    const captainsIds = new Set(teams.map((t) => t.captainId).filter(Boolean));
    const poolPlayers = allPlayers.filter((p) => !captainsIds.has(p.id));

    // Determine current level dynamically
    const determinedLevel = DrawEngine.getCurrentLevel(poolPlayers) || 'EXTRA';
    if (session.status === 'active' && session.currentLevel !== determinedLevel) {
      session.currentLevel = determinedLevel;
      await this.drawRepo.updateSession(session);
    }

    // Squad counts & remaining in current level
    const squadCounts = DrawEngine.getTeamSquadCounts(teams, poolPlayers, picks);
    const remainingInCurrentLevel = poolPlayers.filter(
      (p) => p.level === session.currentLevel && !p.teamId
    );

    // Calculate next team turn
    let currentTurn: { team: Team; roundNumber: number; pickIndex: number; level: PlayerLevel } | undefined;
    if (session.status === 'active' && remainingInCurrentLevel.length > 0) {
      const turnQueue = DrawEngine.getTurnQueueForRound(
        teams,
        remainingInCurrentLevel.length,
        squadCounts,
        this.rng
      );
      if (turnQueue.length > 0) {
        currentTurn = {
          team: turnQueue[0],
          roundNumber: session.currentRound,
          pickIndex: picks.length,
          level: session.currentLevel,
        };
      }
    }

    // Hydrate teams with squad and captain record
    const playersMap = new Map(allPlayers.map((p) => [p.id, p]));
    const hydratedTeams = teams.map((team) => ({
      ...team,
      squad: allPlayers.filter((p) => p.teamId === team.id),
      captainPlayer: team.captainId ? playersMap.get(team.captainId) : undefined,
    }));

    return {
      session,
      teams: hydratedTeams,
      remainingPool: remainingInCurrentLevel,
      currentTurn,
      picks,
    };
  }

  public async startSession(isPractice = false): Promise<DrawSession> {
    const [teams, allPlayers] = await Promise.all([
      this.teamRepo.findAll(),
      this.playerRepo.findAll(),
    ]);
    const captainIds = new Set(teams.map((t) => t.captainId).filter(Boolean));
    const unassignedCount = allPlayers.filter((p) => !captainIds.has(p.id) && !p.teamId).length;
    if (unassignedCount === 0) {
      for (const player of allPlayers) {
        if (!captainIds.has(player.id) && player.teamId) {
          await this.playerRepo.assignToTeam(player.id, null);
        }
      }
    }

    const session: DrawSession = {
      id: `session-${Date.now()}`,
      status: 'active',
      currentLevel: 'A',
      currentRound: 1,
      totalPicks: 0,
      isPractice,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const saved = await this.drawRepo.createSession(session);
    this.publisher.broadcast('DRAW_STATE', { session: saved });
    return saved;
  }

  public async nextPick(): Promise<{ pick: DrawPick; session: DrawSession; team: Team; player: Player }> {
    const state = await this.getSessionState();
    if (state.session.status !== 'active') {
      throw AppError.badRequest('Draw session is not active. Please start or resume the session.');
    }

    if (!state.currentTurn || state.remainingPool.length === 0) {
      // Check if all levels finished
      state.session.status = 'completed';
      await this.drawRepo.updateSession(state.session);
      this.publisher.broadcast('DRAW_STATE', { session: state.session });
      throw AppError.badRequest('All players in all levels have been successfully drawn!');
    }

    const { team, roundNumber, pickIndex, level } = state.currentTurn;

    // Execute pick using pure domain engine and crypto RNG
    const { pick, updatedPlayer } = DrawEngine.executePick(
      team,
      level,
      state.remainingPool,
      roundNumber,
      pickIndex,
      state.session.id,
      this.rng
    );

    // Persist to DB before broadcasting animation!
    await this.drawRepo.addPick(pick);
    await this.playerRepo.assignToTeam(updatedPlayer.id, team.id);

    // Broadcast pick to all connected presenter displays & controllers
    this.publisher.broadcast('DRAW_PICK', {
      pick,
      team,
      player: updatedPlayer,
      totalPicks: pickIndex + 1,
    });

    return { pick, session: state.session, team, player: updatedPlayer };
  }

  public async undoLastPick(): Promise<{ undonePick: DrawPick | null }> {
    const session = await this.drawRepo.getActiveSession();
    if (!session) throw AppError.notFound('No active draw session');

    const lastPick = await this.drawRepo.undoLastPick(session.id);
    if (lastPick) {
      await this.playerRepo.assignToTeam(lastPick.playerId, null);
      this.publisher.broadcast('DRAW_UNDO', { pickId: lastPick.id, playerId: lastPick.playerId });
    }
    return { undonePick: lastPick };
  }

  public async resetSession(): Promise<void> {
    const session = await this.drawRepo.getActiveSession();
    const [teams, allPlayers] = await Promise.all([
      this.teamRepo.findAll(),
      this.playerRepo.findAll(),
    ]);
    const captainIds = new Set(teams.map((t) => t.captainId).filter(Boolean));
    for (const player of allPlayers) {
      if (!captainIds.has(player.id) && player.teamId) {
        await this.playerRepo.assignToTeam(player.id, null);
      }
    }
    if (session) {
      await this.drawRepo.resetSession(session.id);
    }
    this.publisher.broadcast('DRAW_RESET', {});
  }
}
