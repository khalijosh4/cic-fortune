import { drizzle } from 'drizzle-orm/node-postgres';
import pg from 'pg';

import * as schema from './schema.js';
export * from './schema.js';
export { schema };

export const pool = new pg.Pool({
  host: process.env.POSTGRES_HOST,
  port: Number(process.env.POSTGRES_PORT),
  database: process.env.POSTGRES_DB,
  user: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  max: 10,
ssl: process.env.DB_CA ? {
    rejectUnauthorized: true,
    ca: process.env.DB_CA,
  } : false,
});

export const db = drizzle({ client: pool, schema });
