import pg from "pg";

const globalForPg = globalThis as unknown as { pgPool?: pg.Pool };

export function getPool(): pg.Pool {
  if (!globalForPg.pgPool) {
    globalForPg.pgPool = new pg.Pool({ connectionString: process.env.DB_URL });
  }
  return globalForPg.pgPool;
}
