/**
 * @package @umbra/db
 * Database client, schema exports, and query helpers
 */

import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

export * from "./schema";

// Singleton connection — reused across serverless invocations
let _db: ReturnType<typeof drizzle> | null = null;

export function getDb() {
  if (_db) return _db;

  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL environment variable is required");
  }

  const client = postgres(connectionString, {
    max: 10,
    idle_timeout: 20,
    connect_timeout: 10,
  });

  _db = drizzle(client, { schema });
  return _db;
}

export type Db = ReturnType<typeof getDb>;
export { schema };
