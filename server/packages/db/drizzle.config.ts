import { defineConfig } from 'drizzle-kit';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { config } from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

config({ path: resolve(__dirname, '../../apps/api/.env') });

export default defineConfig({
  schema: './src/schema.ts',
  out: './migrations',
  dialect: 'postgresql',
  dbCredentials: {
    host: process.env.POSTGRES_HOST as string,
    port: Number(process.env.POSTGRES_PORT),
    database: process.env.POSTGRES_DB as string,
    user: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
    // Explicitly set ssl based on presence of DB_CA
    ssl: process.env.DB_CA ? {
      rejectUnauthorized: true,
      ca: process.env.DB_CA,
    } : {
      rejectUnauthorized: false,
    },
  }
});