import { IDrawRepository } from '../../../domain/repositories/index.js';
import { DrawSession, DrawPick } from '../../../domain/entities/index.js';
import { PlayerLevel } from '../../../domain/enums/index.js';
import { db, isDbConnected } from '../drizzle/client.js';
import { drawSessions, drawPicks } from '../drizzle/schema.js';
import { eq, desc } from 'drizzle-orm';

export class DrawRepository implements IDrawRepository {
  private activeSession: DrawSession = {
    id: 'session-main-1',
    status: 'idle',
    currentLevel: 'A',
    currentRound: 1,
    totalPicks: 0,
    isPractice: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  private inMemoryPicks: DrawPick[] = [];

  public async getActiveSession(): Promise<DrawSession | null> {
    if (isDbConnected() && db) {
      try {
        const rows = await db.select().from(drawSessions).limit(1);
        if (rows.length > 0) {
          const r = rows[0];
          return {
            id: r.id,
            status: r.status as any,
            currentLevel: r.currentLevel as PlayerLevel,
            currentRound: r.currentRound,
            totalPicks: r.totalPicks,
            isPractice: r.isPractice,
            createdAt: r.createdAt ? r.createdAt.toISOString() : new Date().toISOString(),
            updatedAt: r.updatedAt ? r.updatedAt.toISOString() : new Date().toISOString(),
          };
        }
      } catch {
        // Fallback to memory
      }
    }
    return { ...this.activeSession };
  }

  public async createSession(session: DrawSession): Promise<DrawSession> {
    this.activeSession = { ...session };
    this.inMemoryPicks = [];
    if (isDbConnected() && db) {
      try {
        await db.delete(drawSessions);
        await db.delete(drawPicks);
        await db.insert(drawSessions).values({
          id: session.id,
          status: session.status,
          currentLevel: session.currentLevel,
          currentRound: session.currentRound,
          totalPicks: session.totalPicks,
          isPractice: session.isPractice,
        });
      } catch {
        // Log & keep memory
      }
    }
    return session;
  }

  public async updateSession(session: DrawSession): Promise<DrawSession> {
    this.activeSession = { ...session, updatedAt: new Date().toISOString() };
    if (isDbConnected() && db) {
      try {
        await db.update(drawSessions).set({
          status: session.status,
          currentLevel: session.currentLevel,
          currentRound: session.currentRound,
          totalPicks: session.totalPicks,
          isPractice: session.isPractice,
          updatedAt: new Date(),
        }).where(eq(drawSessions.id, session.id));
      } catch {
        // Log & keep memory
      }
    }
    return this.activeSession;
  }

  public async addPick(pick: DrawPick): Promise<DrawPick> {
    this.inMemoryPicks.push(pick);
    this.activeSession.totalPicks = this.inMemoryPicks.length;
    if (isDbConnected() && db) {
      try {
        await db.insert(drawPicks).values({
          id: pick.id,
          sessionId: pick.sessionId,
          roundNumber: pick.roundNumber,
          pickIndex: pick.pickIndex,
          teamId: pick.teamId,
          playerId: pick.playerId,
          level: pick.level,
          pickedAt: new Date(),
        });
        await this.updateSession(this.activeSession);
      } catch {
        // Log & keep memory
      }
    }
    return pick;
  }

  public async getPicks(sessionId: string): Promise<DrawPick[]> {
    if (isDbConnected() && db) {
      try {
        const rows = await db.select().from(drawPicks).where(eq(drawPicks.sessionId, sessionId));
        return rows.map((r) => ({
          id: r.id,
          sessionId: r.sessionId,
          roundNumber: r.roundNumber,
          pickIndex: r.pickIndex,
          teamId: r.teamId,
          playerId: r.playerId,
          level: r.level as PlayerLevel,
          pickedAt: r.pickedAt ? r.pickedAt.toISOString() : new Date().toISOString(),
        }));
      } catch {
        // Fallback to memory
      }
    }
    return this.inMemoryPicks.filter((p) => p.sessionId === sessionId);
  }

  public async undoLastPick(sessionId: string): Promise<DrawPick | null> {
    const picks = this.inMemoryPicks.filter((p) => p.sessionId === sessionId);
    if (picks.length === 0) return null;
    const lastPick = picks[picks.length - 1];
    this.inMemoryPicks = this.inMemoryPicks.filter((p) => p.id !== lastPick.id);
    this.activeSession.totalPicks = this.inMemoryPicks.length;

    if (isDbConnected() && db) {
      try {
        await db.delete(drawPicks).where(eq(drawPicks.id, lastPick.id));
        await this.updateSession(this.activeSession);
      } catch {
        // Log & keep memory
      }
    }
    return lastPick;
  }

  public async resetSession(sessionId: string): Promise<void> {
    this.inMemoryPicks = this.inMemoryPicks.filter((p) => p.sessionId !== sessionId);
    this.activeSession = {
      ...this.activeSession,
      status: 'idle',
      currentLevel: 'A',
      currentRound: 1,
      totalPicks: 0,
    };
    if (isDbConnected() && db) {
      try {
        await db.delete(drawPicks).where(eq(drawPicks.sessionId, sessionId));
        await this.updateSession(this.activeSession);
      } catch {
        // Log & keep memory
      }
    }
  }
}
