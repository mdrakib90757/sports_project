import { ITeamRepository } from '../../../domain/repositories/index.js';
import { Team } from '../../../domain/entities/index.js';
import { initialTeams } from '../drizzle/seedData.js';
import { db, isDbConnected } from '../drizzle/client.js';
import { teams } from '../drizzle/schema.js';
import { eq } from 'drizzle-orm';

export class TeamRepository implements ITeamRepository {
  private inMemoryTeams: Team[] = [...initialTeams];

  public async findAll(): Promise<Team[]> {
    if (isDbConnected() && db) {
      try {
        const rows = await db.select().from(teams);
        return rows.map((r) => ({
          id: r.id,
          name: r.name,
          nameBn: r.nameBn,
          shortName: r.shortName,
          logoUrl: r.logoUrl,
          primaryColor: r.primaryColor,
          secondaryColor: r.secondaryColor,
          groupName: r.groupName as any,
          city: r.city,
          cityBn: r.cityBn,
          coach: r.coach,
          coachBn: r.coachBn || undefined,
          stadium: r.stadium,
          stadiumBn: r.stadiumBn || undefined,
          captainId: r.captainId,
          captainPin: r.captainPin,
        }));
      } catch {
        // Fallback to memory
      }
    }
    return [...this.inMemoryTeams];
  }

  public async findById(id: string): Promise<Team | null> {
    const list = await this.findAll();
    return list.find((t) => t.id === id) || null;
  }

  public async create(team: Team): Promise<Team> {
    this.inMemoryTeams.push(team);
    if (isDbConnected() && db) {
      try {
        await db.insert(teams).values({
          id: team.id,
          name: team.name,
          nameBn: team.nameBn,
          shortName: team.shortName,
          logoUrl: team.logoUrl,
          primaryColor: team.primaryColor,
          secondaryColor: team.secondaryColor,
          groupName: team.groupName,
          city: team.city,
          cityBn: team.cityBn,
          coach: team.coach,
          coachBn: team.coachBn,
          stadium: team.stadium,
          stadiumBn: team.stadiumBn,
          captainId: team.captainId,
          captainPin: team.captainPin,
        });
      } catch {
        // Log & keep memory
      }
    }
    return team;
  }

  public async update(team: Team): Promise<Team> {
    const idx = this.inMemoryTeams.findIndex((t) => t.id === team.id);
    if (idx !== -1) {
      this.inMemoryTeams[idx] = { ...this.inMemoryTeams[idx], ...team };
    }
    if (isDbConnected() && db) {
      try {
        await db.update(teams).set({
          name: team.name,
          nameBn: team.nameBn,
          shortName: team.shortName,
          logoUrl: team.logoUrl,
          primaryColor: team.primaryColor,
          secondaryColor: team.secondaryColor,
          groupName: team.groupName,
          city: team.city,
          cityBn: team.cityBn,
          coach: team.coach,
          coachBn: team.coachBn,
          stadium: team.stadium,
          stadiumBn: team.stadiumBn,
          captainId: team.captainId,
          captainPin: team.captainPin,
        }).where(eq(teams.id, team.id));
      } catch {
        // Log & keep memory
      }
    }
    return team;
  }
}
