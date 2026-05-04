import { Client } from 'pg';
import { execSync } from 'child_process';
import dotenv from 'dotenv';
import path from 'path';

// Try to load .env from apps/api
dotenv.config({ path: path.resolve(process.cwd(), '../../apps/api/.env') });

async function checkDatabaseConnection() {
  const { POSTGRES_HOST, POSTGRES_PORT, POSTGRES_DB, POSTGRES_USER, POSTGRES_PASSWORD } = process.env;
  
  if (!POSTGRES_HOST || !POSTGRES_DB || !POSTGRES_USER) {
    console.error('ERROR: Database configuration variables are missing.');
    console.error('Recommended steps:');
    console.error('1. Ensure you have an .env file at apps/api/.env');
    console.error('2. Ensure it contains POSTGRES_HOST, POSTGRES_PORT, POSTGRES_DB, POSTGRES_USER, and POSTGRES_PASSWORD variables');
    process.exit(1);
  }

  const client = new Client({
    host: POSTGRES_HOST,
    port: Number(POSTGRES_PORT) || 5432,
    database: POSTGRES_DB,
    user: POSTGRES_USER,
    password: POSTGRES_PASSWORD,
  ssl: DB_CA ? {
      rejectUnauthorized: true,
      ca: DB_CA,
    } : false,
  });
  
  try {
    console.log('Checking database connection...');
    await client.connect();
    await client.query('SELECT 1');
    console.log('Database connection successful.');
    await client.end();
  } catch (error) {
    console.error('ERROR: Failed to connect to the database.');
    console.error(error instanceof Error ? error.message : String(error));
    console.error('\nRecommended steps:');
    console.error('1. Check if your PostgreSQL server is running.');
    console.error('2. Verify that the credentials in your .env file are correct.');
    console.error('3. Ensure the database specified in POSTGRES_DB actually exists.');
    process.exit(1);
  }
}

async function runCommand(command: string, name: string) {
  console.log(`\nRunning ${name}...`);
  try {
    execSync(command, { stdio: 'inherit' });
    console.log(`${name} completed successfully.`);
  } catch (error) {
    console.error(`ERROR: Failed to run ${name}.`);
    process.exit(1);
  }
}

async function buildDatabase() {
  await checkDatabaseConnection();
  
  // Run generate
  await runCommand('pnpm run db:generate', 'Drizzle Generate');
  
  // Run push
  await runCommand('pnpm run db:push', 'Drizzle Push');
  
  // Run seed
  await runCommand('pnpm run db:seed', 'Database Seed');
  
  console.log('\nDatabase build complete!');
}

buildDatabase();
