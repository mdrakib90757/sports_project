import { IPlayerRepository } from '../../../domain/repositories/index.js';
import { Player } from '../../../domain/entities/index.js';
import { PlayerLevel, SquadRole } from '../../../domain/enums/index.js';
import { initialPlayers } from '../drizzle/seedData.js';
import { db, isDbConnected } from '../drizzle/client.js';
import { players } from '../drizzle/schema.js';
import { eq } from 'drizzle-orm';

export class PlayerRepository implements IPlayerRepository {
  private inMemoryPlayers: Player[] = [...initialPlayers];

  public async findAll(): Promise<Player[]> {
    if (isDbConnected() && db) {
      try {
        const rows = await db.select().from(players);
        return rows.map((r) => ({
          id: r.id,
          teamId: r.teamId,
          name: r.name,
          nameBn: r.nameBn,
          phone: r.phone,
          jerseyNumber: r.jerseyNumber || undefined,
          position: r.position as any,
          photoUrl: r.photoUrl,
          isCaptain: r.isCaptain || false,
          nationality: r.nationality,
          nationalityBn: r.nationalityBn || undefined,
          level: r.level as PlayerLevel,
          extraCategoryTag: r.extraCategoryTag,
          squadRole: (r.squadRole as SquadRole) || 'MAIN',
          goalsCount: r.goalsCount,
          assistsCount: r.assistsCount,
          yellowCards: r.yellowCards,
          redCards: r.redCards,
          appearances: r.appearances || 0,
          isRegistered: r.isRegistered || false,
        }));
      } catch {
        // Fallback to memory
      }
    }
    return [...this.inMemoryPlayers];
  }

  public async findById(id: string): Promise<Player | null> {
    const list = await this.findAll();
    return list.find((p) => p.id === id) || null;
  }

  public async findByTeamId(teamId: string): Promise<Player[]> {
    const list = await this.findAll();
    return list.filter((p) => p.teamId === teamId);
  }

  public async findByPhone(phone: string): Promise<Player | null> {
    const list = await this.findAll();
    return list.find((p) => p.phone === phone) || null;
  }

  public async create(player: Player): Promise<Player> {
    this.inMemoryPlayers.push(player);
    if (isDbConnected() && db) {
      try {
        await db.insert(players).values({
          id: player.id,
          teamId: player.teamId,
          name: player.name,
          nameBn: player.nameBn,
          phone: player.phone,
          jerseyNumber: player.jerseyNumber,
          position: player.position,
          photoUrl: player.photoUrl,
          isCaptain: player.isCaptain,
          nationality: player.nationality,
          nationalityBn: player.nationalityBn,
          level: player.level,
          extraCategoryTag: player.extraCategoryTag,
          squadRole: player.squadRole || 'MAIN',
          goalsCount: player.goalsCount,
          assistsCount: player.assistsCount,
          yellowCards: player.yellowCards,
          redCards: player.redCards,
          appearances: player.appearances,
          isRegistered: player.isRegistered,
        });
      } catch {
        // Log & keep memory
      }
    }
    return player;
  }

  public async update(player: Player): Promise<Player> {
    const idx = this.inMemoryPlayers.findIndex((p) => p.id === player.id);
    if (idx !== -1) {
      this.inMemoryPlayers[idx] = { ...this.inMemoryPlayers[idx], ...player };
    }
    if (isDbConnected() && db) {
      try {
        await db.update(players).set({
          teamId: player.teamId,
          name: player.name,
          nameBn: player.nameBn,
          phone: player.phone,
          jerseyNumber: player.jerseyNumber,
          position: player.position,
          photoUrl: player.photoUrl,
          isCaptain: player.isCaptain,
          nationality: player.nationality,
          nationalityBn: player.nationalityBn,
          level: player.level,
          extraCategoryTag: player.extraCategoryTag,
          squadRole: player.squadRole,
          goalsCount: player.goalsCount,
          assistsCount: player.assistsCount,
          yellowCards: player.yellowCards,
          redCards: player.redCards,
          appearances: player.appearances,
        }).where(eq(players.id, player.id));
      } catch {
        // Log & keep memory
      }
    }
    return player;
  }

  public async updateLevel(id: string, level: PlayerLevel, extraCategoryTag?: string | null): Promise<Player> {
    const player = await this.findById(id);
    if (!player) throw new Error('Player not found');
    const updated = { ...player, level, extraCategoryTag: extraCategoryTag || null };
    return this.update(updated);
  }

  public async updateSquadRole(id: string, squadRole: SquadRole): Promise<Player> {
    const player = await this.findById(id);
    if (!player) throw new Error('Player not found');
    const updated = { ...player, squadRole };
    return this.update(updated);
  }

  public async assignToTeam(id: string, teamId: string | null): Promise<Player> {
    const player = await this.findById(id);
    if (!player) throw new Error('Player not found');
    const updated = { ...player, teamId };
    return this.update(updated);
  }
}
