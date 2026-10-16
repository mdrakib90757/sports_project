import { drizzle } from 'drizzle-orm/node-postgres';
import pg from 'pg';
import { env } from '../../../config/env.js';
import * as schema from './schema.js';
import { logger } from '../../../shared/logger/logger.js';

const { Pool } = pg;

export let pool: pg.Pool | null = null;
export let db: ReturnType<typeof drizzle<typeof schema>> | null = null;
let isConnected = false;

export async function getDbClient() {
  if (db && isConnected) return db;

  try {
    pool = new Pool({
      connectionString: env.DATABASE_URL,
      max: 10,
      connectionTimeoutMillis: 3000,
    });

    const client = await pool.connect();
    client.release();
    isConnected = true;
    db = drizzle(pool, { schema });
    logger.info('Database connected successfully via Drizzle ORM');
    return db;
  } catch (error: any) {
    logger.warn(`Postgres connection failed: ${error.message}. Operating in resilient memory mode.`);
    isConnected = false;
    db = null;
    return null;
  }
}

export function isDbConnected(): boolean {
  return isConnected;
}
