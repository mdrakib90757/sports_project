import { IOfficialRepository } from '../../../domain/repositories/index.js';
import { Official } from '../../../domain/entities/index.js';
import { initialOfficials } from '../drizzle/seedData.js';
import { db, isDbConnected } from '../drizzle/client.js';
import { officials } from '../drizzle/schema.js';
import { eq } from 'drizzle-orm';

export class OfficialRepository implements IOfficialRepository {
  private inMemoryOfficials: Official[] = [...initialOfficials];

  public async findAll(): Promise<Official[]> {
    if (isDbConnected() && db) {
      try {
        const rows = await db.select().from(officials);
        return rows.map((r) => ({
          id: r.id,
          name: r.name,
          nameBn: r.nameBn,
          titleEn: r.titleEn,
          titleBn: r.titleBn,
          descriptionBn: r.descriptionBn,
          photoUrl: r.photoUrl,
          displayOrder: r.displayOrder,
        })).sort((a, b) => a.displayOrder - b.displayOrder);
      } catch {
        // Fallback to memory
      }
    }
    return [...this.inMemoryOfficials].sort((a, b) => a.displayOrder - b.displayOrder);
  }

  public async findById(id: string): Promise<Official | null> {
    const list = await this.findAll();
    return list.find((o) => o.id === id) || null;
  }

  public async create(official: Official): Promise<Official> {
    this.inMemoryOfficials.push(official);
    if (isDbConnected() && db) {
      try {
        await db.insert(officials).values({
          id: official.id,
          name: official.name,
          nameBn: official.nameBn,
          titleEn: official.titleEn,
          titleBn: official.titleBn,
          descriptionBn: official.descriptionBn,
          photoUrl: official.photoUrl,
          displayOrder: official.displayOrder,
        });
      } catch {
        // Log & keep memory
      }
    }
    return official;
  }

  public async update(official: Official): Promise<Official> {
    const idx = this.inMemoryOfficials.findIndex((o) => o.id === official.id);
    if (idx !== -1) {
      this.inMemoryOfficials[idx] = { ...this.inMemoryOfficials[idx], ...official };
    }
    if (isDbConnected() && db) {
      try {
        await db.update(officials).set({
          name: official.name,
          nameBn: official.nameBn,
          titleEn: official.titleEn,
          titleBn: official.titleBn,
          descriptionBn: official.descriptionBn,
          photoUrl: official.photoUrl,
          displayOrder: official.displayOrder,
        }).where(eq(officials.id, official.id));
      } catch {
        // Log & keep memory
      }
    }
    return official;
  }

  public async delete(id: string): Promise<void> {
    this.inMemoryOfficials = this.inMemoryOfficials.filter((o) => o.id !== id);
    if (isDbConnected() && db) {
      try {
        await db.delete(officials).where(eq(officials.id, id));
      } catch {
        // Log & keep memory
      }
    }
  }
}
