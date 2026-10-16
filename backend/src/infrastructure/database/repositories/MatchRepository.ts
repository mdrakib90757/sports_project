import { IMatchRepository } from '../../../domain/repositories/index.js';
import { Match, MatchEvent, MatchLineupItem } from '../../../domain/entities/index.js';
import { MatchStatus } from '../../../domain/enums/index.js';
import { initialMatches, initialEvents } from '../drizzle/seedData.js';
import { db, isDbConnected } from '../drizzle/client.js';
import { matches, matchEvents } from '../drizzle/schema.js';
import { eq } from 'drizzle-orm';

export class MatchRepository implements IMatchRepository {
  private inMemoryMatches: Match[] = [...initialMatches];
  private inMemoryEvents: MatchEvent[] = [...initialEvents];
  private inMemoryLineups: MatchLineupItem[] = [];

  public async findAll(): Promise<Match[]> {
    if (isDbConnected() && db) {
      try {
        const rows = await db.select().from(matches);
        return rows.map((r) => ({
          id: r.id,
          tournamentId: r.tournamentId,
          homeTeamId: r.homeTeamId,
          awayTeamId: r.awayTeamId,
          homeScore: r.homeScore,
          awayScore: r.awayScore,
          status: r.status as MatchStatus,
          currentMinute: r.currentMinute,
          minuteOffsetSeconds: r.minuteOffsetSeconds,
          isClockRunning: r.isClockRunning,
          matchDate: r.matchDate,
          venue: r.venue,
          venueBn: r.venueBn,
          round: r.round,
          roundBn: r.roundBn,
          stage: r.stage as any,
          bracketSlot: r.bracketSlot,
          winnerTeamId: r.winnerTeamId,
        }));
      } catch {
        // Fallback to memory
      }
    }
    return [...this.inMemoryMatches];
  }

  public async findById(id: string): Promise<Match | null> {
    const list = await this.findAll();
    const match = list.find((m) => m.id === id);
    if (!match) return null;

    const events = await this.getEventsByMatchId(id);
    const lineups = await this.getLineupsByMatchId(id);
    return {
      ...match,
      events,
      lineups,
    };
  }

  public async updateScore(
    id: string,
    homeScore: number,
    awayScore: number,
    status: MatchStatus,
    currentMinute: number,
    isClockRunning: boolean
  ): Promise<Match> {
    const idx = this.inMemoryMatches.findIndex((m) => m.id === id);
    if (idx !== -1) {
      this.inMemoryMatches[idx] = {
        ...this.inMemoryMatches[idx],
        homeScore,
        awayScore,
        status,
        currentMinute,
        isClockRunning,
      };
    }
    if (isDbConnected() && db) {
      try {
        await db.update(matches).set({
          homeScore,
          awayScore,
          status,
          currentMinute,
          isClockRunning,
        }).where(eq(matches.id, id));
      } catch {
        // Log & keep memory
      }
    }
    const updated = await this.findById(id);
    return updated!;
  }

  public async addEvent(event: MatchEvent): Promise<MatchEvent> {
    this.inMemoryEvents.unshift(event);
    if (isDbConnected() && db) {
      try {
        await db.insert(matchEvents).values({
          id: event.id,
          matchId: event.matchId,
          teamId: event.teamId,
          playerId: event.playerId,
          assistPlayerId: event.assistPlayerId,
          eventType: event.eventType,
          minute: event.minute,
          extraMinute: event.extraMinute,
          description: event.description,
          subInPlayerId: event.subInPlayerId,
        });
      } catch {
        // Log & keep memory
      }
    }
    return event;
  }

  public async deleteEvent(eventId: string): Promise<void> {
    this.inMemoryEvents = this.inMemoryEvents.filter((e) => e.id !== eventId);
    if (isDbConnected() && db) {
      try {
        await db.delete(matchEvents).where(eq(matchEvents.id, eventId));
      } catch {
        // Log & keep memory
      }
    }
  }

  public async getEventsByMatchId(matchId: string): Promise<MatchEvent[]> {
    if (isDbConnected() && db) {
      try {
        const rows = await db.select().from(matchEvents).where(eq(matchEvents.matchId, matchId));
        return rows.map((r) => ({
          id: r.id,
          matchId: r.matchId,
          teamId: r.teamId,
          playerId: r.playerId,
          assistPlayerId: r.assistPlayerId,
          eventType: r.eventType as any,
          minute: r.minute,
          extraMinute: r.extraMinute,
          description: r.description,
          subInPlayerId: r.subInPlayerId,
          createdAt: r.createdAt ? r.createdAt.toISOString() : new Date().toISOString(),
        }));
      } catch {
        // Fallback to memory
      }
    }
    return this.inMemoryEvents.filter((e) => e.matchId === matchId);
  }

  public async getLineupsByMatchId(matchId: string): Promise<MatchLineupItem[]> {
    return this.inMemoryLineups.filter((l) => l.matchId === matchId);
  }
}
