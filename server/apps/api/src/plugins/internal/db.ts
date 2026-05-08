import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

import { db, schema } from '@fastify-forge/db';
import bcrypt from 'bcryptjs';
import fp from 'fastify-plugin';

import type { FastifyInstance } from 'fastify';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function dbPlugin(fastify: FastifyInstance) {
  fastify.decorate('db', db);
  fastify.addHook('onClose', async () => {
    await db.$client.end();
  });

  // Auto-reset database if DB_AUTO_RESET=true AND NODE_ENV=development
  if (fastify.config.DB_AUTO_RESET && fastify.config.NODE_ENV === 'development') {
    fastify.log.warn('⚠️  DB_AUTO_RESET is enabled — dropping and recreating all tables...');

    try {
      // Nuke the public schema entirely — no data preservation needed
      await db.$client.query('DROP SCHEMA public CASCADE');
      await db.$client.query('CREATE SCHEMA public');
      await db.$client.query('GRANT ALL ON SCHEMA public TO postgres');
      await db.$client.query('GRANT ALL ON SCHEMA public TO public');
      fastify.log.info('Schema dropped and recreated.');

      // Push the current Drizzle schema directly via pnpm binary (no shell required)
      const dbPackagePath = path.resolve(__dirname, '../../../../../packages/db');
      const result = spawnSync('pnpm', ['db:push', '--force'], {
        cwd: dbPackagePath,
        stdio: 'pipe',
        env: process.env,
      });

      if (result.error) throw result.error;
      if (result.status !== 0) {
        const stderr = result.stderr?.toString() || 'unknown error';
        throw new Error(`db:push failed (exit ${result.status}): ${stderr}`);
      }
      fastify.log.info('Tables recreated via db:push.');

      // Insert the admin user — fresh schema, no conflicts possible
      const hashedPassword = await bcrypt.hash('Admin@2024', 10);
      await db.insert(schema.user).values({
        id: 'SYS-ADMIN-001',
        firstName: 'System',
        lastName: 'Administrator',
        email: 'admin@fortunesacco.co.ke',
        password: hashedPassword,
        role: 'admin',
        mustChangePassword: false,
      } as any);

      fastify.log.info('✅ DB_AUTO_RESET complete. Admin: admin@fortunesacco.co.ke / Admin@2024');
    } catch (err) {
      // Log failure but do NOT crash — server continues booting with existing DB state
      fastify.log.error({ err }, '⚠️  DB_AUTO_RESET failed. Server will continue with existing database state.');
    }
  }
}

export default fp(dbPlugin, {
  name: 'db-plugin',
  dependencies: ['@fastify/env'],
});
