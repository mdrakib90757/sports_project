import { IUserRepository } from '../../../domain/repositories/index.js';
import { User } from '../../../domain/entities/index.js';
import { getInitialUsers } from '../drizzle/seedData.js';
import { db, isDbConnected } from '../drizzle/client.js';
import { users } from '../drizzle/schema.js';
import { eq } from 'drizzle-orm';

export class UserRepository implements IUserRepository {
  private inMemoryUsers: User[] = getInitialUsers();

  public async findByEmail(email: string): Promise<User | null> {
    if (isDbConnected() && db) {
      try {
        const rows = await db.select().from(users).where(eq(users.email, email.toLowerCase()));
        if (rows.length > 0) {
          const r = rows[0];
          return {
            id: r.id,
            email: r.email,
            passwordHash: r.passwordHash,
            name: r.name,
            role: r.role as any,
            teamId: r.teamId,
            createdAt: r.createdAt ? r.createdAt.toISOString() : new Date().toISOString(),
          };
        }
      } catch {
        // Fallback to memory
      }
    }
    return this.inMemoryUsers.find((u) => u.email.toLowerCase() === email.toLowerCase()) || null;
  }

  public async findById(id: string): Promise<User | null> {
    if (isDbConnected() && db) {
      try {
        const rows = await db.select().from(users).where(eq(users.id, id));
        if (rows.length > 0) {
          const r = rows[0];
          return {
            id: r.id,
            email: r.email,
            passwordHash: r.passwordHash,
            name: r.name,
            role: r.role as any,
            teamId: r.teamId,
            createdAt: r.createdAt ? r.createdAt.toISOString() : new Date().toISOString(),
          };
        }
      } catch {
        // Fallback to memory
      }
    }
    return this.inMemoryUsers.find((u) => u.id === id) || null;
  }

  public async create(user: User): Promise<User> {
    this.inMemoryUsers.push(user);
    if (isDbConnected() && db) {
      try {
        await db.insert(users).values({
          id: user.id,
          email: user.email.toLowerCase(),
          passwordHash: user.passwordHash || '',
          name: user.name,
          role: user.role,
          teamId: user.teamId,
        });
      } catch {
        // Log & keep memory
      }
    }
    return user;
  }
}
