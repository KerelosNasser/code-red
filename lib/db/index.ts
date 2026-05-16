import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";

// This file configures the connection for the application
// Use a singleton pattern to avoid multiple connections in dev

const globalForDb = globalThis as unknown as {
  conn: Pool | undefined;
};

const conn = globalForDb.conn ?? new Pool({
  connectionString: process.env.DATABASE_URL,
});

conn.on('error', (err) => {
  console.error('Unexpected error on idle DB client', err.message);
});

if (process.env.NODE_ENV !== "production") globalForDb.conn = conn;

export const db = drizzle(conn, { schema });
