import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawn } from 'node:child_process';

import { db, schema } from '@fastify-forge/db';
import bcrypt from 'bcryptjs';
import fp from 'fastify-plugin';

import type { FastifyInstance } from 'fastify';
import type { SpawnOptions } from 'node:child_process';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function spawnAsync(command: string, args: string[], options: SpawnOptions): Promise<{ stdout: string; stderr: string }> {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, { stdio: 'pipe', ...options });
    let stdout = '';
    let stderr = '';
    child.stdout?.on('data', (data: Buffer) => { stdout += data.toString(); });
    child.stderr?.on('data', (data: Buffer) => { stderr += data.toString(); });
    child.on('error', reject);
    child.on('close', (code) => {
      if (code === 0) resolve({ stdout, stderr });
      else reject(new Error(`db:push failed (exit ${code}): ${stderr}`));
    });
  });
}

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

      // Push the current Drizzle schema via async spawn (non-blocking)
      const dbPackagePath = path.resolve(__dirname, '../../../../../packages/db');
      const { stderr } = await spawnAsync('pnpm', ['db:push', '--force'], {
        cwd: dbPackagePath,
        env: process.env,
      });
      if (stderr) fastify.log.warn(`db:push stderr: ${stderr}`);
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

      // Seed default lines of business
      const lobs = [
        { id: 'LOB-HEALTH', name: 'Health Insurance', code: 'HEALTH', description: 'Medical cover including inpatient, outpatient, maternity, dental, and optical', icon: 'HeartPulse', isActive: true },
        { id: 'LOB-MOTOR', name: 'Motor Insurance', code: 'MOTOR', description: 'Comprehensive motor vehicle insurance covering private and commercial vehicles', icon: 'Car', isActive: true },
        { id: 'LOB-LIFE', name: 'Life Insurance', code: 'LIFE', description: 'Life cover with terminal illness, critical illness, and accidental death benefits', icon: 'Heart', isActive: true },
      ];
      for (const lob of lobs) {
        await db.insert(schema.lineOfBusiness).values(lob as any).onConflictDoNothing();
      }

      // Seed default permissions
      const permissions = [
        { id: 'members-create', name: 'members.create', description: 'Create new members', resource: 'members', action: 'create' },
        { id: 'members-read', name: 'members.read', description: 'View members', resource: 'members', action: 'read' },
        { id: 'members-update', name: 'members.update', description: 'Edit members', resource: 'members', action: 'update' },
        { id: 'members-delete', name: 'members.delete', description: 'Delete members', resource: 'members', action: 'delete' },
        { id: 'claims-create', name: 'claims.create', description: 'Create new claims', resource: 'claims', action: 'create' },
        { id: 'claims-read', name: 'claims.read', description: 'View claims', resource: 'claims', action: 'read' },
        { id: 'claims-update', name: 'claims.update', description: 'Edit claims', resource: 'claims', action: 'update' },
        { id: 'claims-delete', name: 'claims.delete', description: 'Delete claims', resource: 'claims', action: 'delete' },
        { id: 'premiums-read', name: 'premiums.read', description: 'View premiums', resource: 'premiums', action: 'read' },
        { id: 'premiums-update', name: 'premiums.update', description: 'Edit premiums', resource: 'premiums', action: 'update' },
        { id: 'premiums-delete', name: 'premiums.delete', description: 'Delete premiums', resource: 'premiums', action: 'delete' },
        { id: 'users-create', name: 'users.create', description: 'Create new users', resource: 'users', action: 'create' },
        { id: 'users-read', name: 'users.read', description: 'View users', resource: 'users', action: 'read' },
        { id: 'users-update', name: 'users.update', description: 'Edit users', resource: 'users', action: 'update' },
        { id: 'users-delete', name: 'users.delete', description: 'Delete users', resource: 'users', action: 'delete' },
        { id: 'users-transfer', name: 'users.transfer', description: 'Transfer users between branches', resource: 'users', action: 'transfer' },
        { id: 'branches-create', name: 'branches.create', description: 'Create new branches', resource: 'branches', action: 'create' },
        { id: 'branches-read', name: 'branches.read', description: 'View branches', resource: 'branches', action: 'read' },
        { id: 'branches-update', name: 'branches.update', description: 'Edit branches', resource: 'branches', action: 'update' },
        { id: 'branches-delete', name: 'branches.delete', description: 'Delete branches', resource: 'branches', action: 'delete' },
        { id: 'hospitals-create', name: 'hospitals.create', description: 'Create new hospitals', resource: 'hospitals', action: 'create' },
        { id: 'hospitals-read', name: 'hospitals.read', description: 'View hospitals', resource: 'hospitals', action: 'read' },
        { id: 'hospitals-update', name: 'hospitals.update', description: 'Edit hospitals', resource: 'hospitals', action: 'update' },
        { id: 'hospitals-delete', name: 'hospitals.delete', description: 'Delete hospitals', resource: 'hospitals', action: 'delete' },
        { id: 'plans-create', name: 'plans.create', description: 'Create new plans', resource: 'plans', action: 'create' },
        { id: 'plans-read', name: 'plans.read', description: 'View plans', resource: 'plans', action: 'read' },
        { id: 'plans-update', name: 'plans.update', description: 'Edit plans', resource: 'plans', action: 'update' },
        { id: 'plans-delete', name: 'plans.delete', description: 'Delete plans', resource: 'plans', action: 'delete' },
        { id: 'audit-logs-read', name: 'audit-logs.read', description: 'View audit logs', resource: 'audit-logs', action: 'read' },
        { id: 'dashboard-read', name: 'dashboard.read', description: 'View dashboard', resource: 'dashboard', action: 'read' },
        { id: 'lobs-create', name: 'lobs.create', description: 'Create new lines of business', resource: 'lobs', action: 'create' },
        { id: 'lobs-read', name: 'lobs.read', description: 'View lines of business', resource: 'lobs', action: 'read' },
        { id: 'lobs-update', name: 'lobs.update', description: 'Edit lines of business', resource: 'lobs', action: 'update' },
        { id: 'lobs-delete', name: 'lobs.delete', description: 'Delete lines of business', resource: 'lobs', action: 'delete' },
      ];
      for (const p of permissions) {
        await db.insert(schema.permission).values(p).onConflictDoNothing();
      }

      // Assign all permissions to admin user
      for (const p of permissions) {
        await db.insert(schema.userPermission).values({ userId: 'SYS-ADMIN-001', permissionId: p.id }).onConflictDoNothing();
      }

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
