import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from '@shared/schema';

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is required');
}

/**
 * pg v8 treats sslmode=require as verify-full and prints a security warning.
 * Opt into libpq-compatible semantics so Neon/Replit URLs with sslmode=require
 * keep working without the noisy startup warning (and without changing verify-full
 * callers who already opted into the stricter mode).
 */
export function normalizeDatabaseUrl(connectionString: string): string {
  let url: URL;
  try {
    url = new URL(connectionString);
  } catch {
    return connectionString;
  }
  const sslmode = (url.searchParams.get("sslmode") || "").toLowerCase();
  if (
    (sslmode === "require" || sslmode === "prefer" || sslmode === "verify-ca") &&
    !url.searchParams.has("uselibpqcompat")
  ) {
    url.searchParams.set("uselibpqcompat", "true");
  }
  return url.toString();
}

const connectionString = normalizeDatabaseUrl(process.env.DATABASE_URL);

export const pool = new Pool({
  connectionString,
  connectionTimeoutMillis: 10000, // Fail fast on Replit instead of hanging
  idleTimeoutMillis: 30000,
});

export const db = drizzle(pool, { schema });
