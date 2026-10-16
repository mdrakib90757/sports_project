import { IPlayerRepository, ITeamRepository } from '../../../domain/repositories/index.js';
import { Player, Team } from '../../../domain/entities/index.js';
import { PlayerLevel, PlayerPosition, SquadRole } from '../../../domain/enums/index.js';
import { AppError } from '../../../shared/errors/AppError.js';

export interface TopScorerItem {
  rank: number;
  player: Player;
  team?: Team;
  goals: number;
  assists: number;
  penalties: number;
  matches: number;
}

export class PlayerUseCases {
  constructor(
    private playerRepo: IPlayerRepository,
    private teamRepo: ITeamRepository
  ) {}

  public async getPlayers(teamId?: string, level?: PlayerLevel): Promise<Player[]> {
    let list = await this.playerRepo.findAll();
    if (teamId && teamId !== 'all') {
      list = list.filter((p) => p.teamId === teamId);
    }
    if (level) {
      list = list.filter((p) => p.level === level);
    }
    return list;
  }

  public async getTopScorers(): Promise<TopScorerItem[]> {
    const [players, teams] = await Promise.all([
      this.playerRepo.findAll(),
      this.teamRepo.findAll(),
    ]);

    const teamsMap = new Map(teams.map((t) => [t.id, t]));

    const sorted = [...players]
      .filter((p) => p.goalsCount > 0)
      .sort((a, b) => {
        if (b.goalsCount !== a.goalsCount) return b.goalsCount - a.goalsCount;
        return b.assistsCount - a.assistsCount;
      });

    return sorted.map((player, index) => ({
      rank: index + 1,
      player,
      team: player.teamId ? teamsMap.get(player.teamId) : undefined,
      goals: player.goalsCount,
      assists: player.assistsCount,
      penalties: 0,
      matches: player.appearances || 3,
    }));
  }

  public async registerPlayer(data: {
    name: string;
    nameBn?: string;
    phone: string;
    position: PlayerPosition;
    photoUrl?: string;
  }): Promise<Player> {
    const existing = await this.playerRepo.findByPhone(data.phone);
    if (existing) {
      throw AppError.conflict('A player with this phone number is already registered.');
    }

    const newPlayer: Player = {
      id: `ply-${Date.now()}`,
      name: data.name,
      nameBn: data.nameBn || data.name,
      phone: data.phone,
      position: data.position,
      photoUrl: data.photoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
      nationality: 'Bangladesh',
      nationalityBn: 'বাংলাদেশ',
      level: 'B',
      goalsCount: 0,
      assistsCount: 0,
      yellowCards: 0,
      redCards: 0,
      isRegistered: true,
      createdAt: new Date().toISOString(),
    };

    return this.playerRepo.create(newPlayer);
  }

  public async assignLevel(playerId: string, level: PlayerLevel, extraCategoryTag?: string | null): Promise<Player> {
    return this.playerRepo.updateLevel(playerId, level, extraCategoryTag);
  }

  public async setSquadRole(playerId: string, squadRole: SquadRole): Promise<Player> {
    return this.playerRepo.updateSquadRole(playerId, squadRole);
  }
}
