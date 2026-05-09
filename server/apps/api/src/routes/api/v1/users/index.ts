import { db, schema } from '@fastify-forge/db';
import { eq, sql, and, inArray, or } from 'drizzle-orm';
import type { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox';
import bcrypt from 'bcryptjs';

const { user, userPermission } = schema;

import { 
  CreateUserSchema, 
  ListUserSchema, 
  UpdateUserSchema,
  TransferUserSchema,
} from '#/schemas/user.schema.js';
import { getTerritoryFilters, hasAccess } from '#/utils/tebac.util.js';
import { generateStructuredUserId, generateTemporaryPassword } from '#/utils/id-generator.util.js';
import { sendWelcomeEmail, sendTransferEmail } from '#/utils/notification.util.js';

const userRoutes: FastifyPluginAsyncTypebox = async (fastify) => {
  fastify.get('/', { schema: ListUserSchema }, async (request, reply) => {
    const { limit = 10, offset = 0, role, 'role[]': roles, branchId, 'branchId[]': branchIds, name, email } = request.query;

    const filters = getTerritoryFilters(request.user, user);
    if (role) filters.push(eq(user.role, role as any));
    if (roles && roles.length > 0) {
      filters.push(inArray(user.role, roles as any));
    }
    
    if (branchId) filters.push(eq(user.branchId, branchId));
    if (branchIds && branchIds.length > 0) {
      filters.push(inArray(user.branchId, branchIds as any));
    }

    if (name) {
      filters.push(sql`(${user.firstName} || ' ' || ${user.lastName}) ILIKE ${`%${name}%`}`);
    }
    if (email) {
      filters.push(sql`${user.email} ILIKE ${`%${email}%`}`);
    }

    const whereClause = filters.length > 0 ? and(...filters) : undefined;

    const data = await db.select({
      id: user.id,
      firstName: user.firstName,
      middleName: user.middleName,
      lastName: user.lastName,
      email: user.email,
      phoneNumber: user.phoneNumber,
      role: user.role,
      branchId: user.branchId,
      hospitalId: user.hospitalId,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      branchName: schema.branch.name,
    })
    .from(user)
    .leftJoin(schema.branch, eq(user.branchId, schema.branch.id))
    .where(whereClause)
    .limit(limit)
    .offset(offset);
    
    const countResult = await db.select({ count: sql<number>`count(*)` })
      .from(user)
      .where(whereClause);
    const count = countResult[0]?.count ?? 0;

    return reply.send({ data: data as any, total: Number(count) });
  });

  fastify.get('/available-managers', async (request, reply) => {
    const { currentManagerId } = request.query as any;

    // Find users who are not currently managing any other branch
    const managers = await db.select({
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
      branchId: user.branchId,
    })
    .from(user)
    .leftJoin(schema.branch, eq(user.id, schema.branch.manager))
    .where(
      or(
        sql`${schema.branch.id} IS NULL`, // Not a manager
        currentManagerId ? eq(user.id, currentManagerId) : sql`FALSE` // Or is the current manager
      )
    );

    return reply.send(managers as any);
  });

  fastify.post('/', { schema: CreateUserSchema }, async (request, reply) => {
    const { password: providedPassword, branchId, hospitalId, permissionIds, ...rest } = request.body;
    const newRole = rest.role || 'user';

    // Territory-based enforcement: branch managers can only create users for their branch
    if (['branch_manager', 'claims_officer'].includes(request.user.role)) {
      if (branchId !== request.user.branchId) {
        return reply.forbidden('You can only create users for your assigned branch');
      }
    }

    // Branch managers must be assigned to a branch
    if (newRole === 'branch_manager' && !branchId) {
      return reply.badRequest('Branch ID is required when creating a branch manager');
    }

    const password = providedPassword || generateTemporaryPassword();
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Normalize empty strings to null to avoid FK violation
    const normalizedBranchId = branchId || null;
    const normalizedHospitalId = hospitalId || null;

    // Generate structured ID for primary key
    const id = normalizedBranchId 
      ? await generateStructuredUserId(normalizedBranchId) 
      : `ADM-${new Date().getFullYear()}-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`;

    const insertResult = await db.insert(user).values({
      ...rest,
      id,
      branchId: normalizedBranchId,
      hospitalId: normalizedHospitalId,
      password: hashedPassword,
      mustChangePassword: true,
    } as any).returning() as any;
    
    const newUser = insertResult[0];

    // Auto-assign as branch manager in the branch table
    if (newRole === 'branch_manager' && normalizedBranchId) {
      await db.update(schema.branch)
        .set({ manager: id })
        .where(eq(schema.branch.id, normalizedBranchId));
    }

    // Save assigned permissions
    if (permissionIds && permissionIds.length > 0) {
      await db.insert(userPermission).values(
        permissionIds.map(permissionId => ({ userId: id, permissionId }))
      );
    }

    // Trigger welcome email
    if (newUser.email) {
      try {
        await sendWelcomeEmail(
          newUser.email,
          { 
            firstName: newUser.firstName, 
            lastName: newUser.lastName, 
            id: newUser.id, 
            password: password 
          },
          process.env.MAILERSEND_API_TOKEN!
        );
      } catch (error) {
        fastify.log.error(error, 'Failed to send welcome email');
      }
    }

    return reply.code(201).send(newUser as any);
  });

  fastify.get('/:id', async (request: any, reply) => {
    const [found] = await db.select().from(user).where(eq(user.id, request.params.id)).limit(1);
    if (!found) return reply.notFound('User not found');
    
    if (!hasAccess(request.user, found)) {
      return reply.forbidden('Access denied to user outside your territory');
    }

    const userPerms = await db.select({ name: schema.permission.name })
      .from(schema.permission)
      .innerJoin(userPermission, eq(userPermission.permissionId, schema.permission.id))
      .where(eq(userPermission.userId, request.params.id));

    return reply.send({ ...found, permissions: userPerms.map(p => p.name) } as any);
  });

  fastify.put('/:id', { schema: UpdateUserSchema }, async (request, reply) => {
    const [existing] = await db.select().from(user).where(eq(user.id, request.params.id)).limit(1);
    if (!existing) return reply.notFound('User not found');

    if (!hasAccess(request.user, existing)) {
      return reply.forbidden('Cannot edit user outside your territory');
    }

    const { permissionIds, ...bodyFields } = request.body as any;
    const updates: any = { ...bodyFields };

    // Normalize empty strings to null to avoid FK violation
    if (updates.branchId !== undefined) updates.branchId = updates.branchId || null;
    if (updates.hospitalId !== undefined) updates.hospitalId = updates.hospitalId || null;

    const newRole = updates.role || existing.role;

    // Branch managers must have a branchId
    if (newRole === 'branch_manager' && !updates.branchId && !existing.branchId) {
      return reply.badRequest('Branch ID is required for a branch manager');
    }

    // Re-generate structured ID if branchId is changing
    const effectiveBranchId = updates.branchId || existing.branchId;
    if (updates.branchId && updates.branchId !== existing.branchId) {
      updates.id = await generateStructuredUserId(updates.branchId);
    }

    const updateResult = await db.update(user)
      .set(updates)
      .where(eq(user.id, request.params.id))
      .returning() as any;
    
    const updated = updateResult[0];

    // Save permissions (use the new ID if it was regenerated)
    const effectiveUserId = updates.id || request.params.id;
    if (permissionIds) {
      await db.delete(userPermission).where(eq(userPermission.userId, effectiveUserId));
      if (permissionIds.length > 0) {
        await db.insert(userPermission).values(
          permissionIds.map((permissionId: string) => ({ userId: effectiveUserId, permissionId }))
        );
      }
    }

    // Handle branch manager assignment changes
    if (newRole === 'branch_manager' && effectiveBranchId) {
      // Clear old branch's manager if changing branches
      if (existing.role === 'branch_manager' && existing.branchId && existing.branchId !== effectiveBranchId) {
        await db.update(schema.branch)
          .set({ manager: null })
          .where(eq(schema.branch.id, existing.branchId));
      }
      // Set new branch's manager
      await db.update(schema.branch)
        .set({ manager: request.params.id })
        .where(eq(schema.branch.id, effectiveBranchId));
    } else if (existing.role === 'branch_manager' && newRole !== 'branch_manager') {
      // Clear branch manager when role is removed
      if (existing.branchId) {
        await db.update(schema.branch)
          .set({ manager: null })
          .where(eq(schema.branch.id, existing.branchId));
      }
    }

    return reply.send(updated as any);
  });

  fastify.post('/:id/transfer', { schema: TransferUserSchema }, async (request, reply) => {
    const reqUser = request.user as any;
    if (!reqUser.permissions?.includes('users.transfer')) {
      return reply.forbidden('You do not have permission to transfer users');
    }

    const [existing] = await db.select().from(user).where(eq(user.id, request.params.id)).limit(1);
    if (!existing) return reply.notFound('User not found');

    const { branchId: newBranchId } = request.body;

    // Get branch info
    const [branchInfo] = await db.select({ name: schema.branch.name })
      .from(schema.branch)
      .where(eq(schema.branch.id, newBranchId))
      .limit(1);
    if (!branchInfo) return reply.notFound('Destination branch not found');

    // Clear old branch manager assignment if applicable
    if (existing.branchId) {
      await db.update(schema.branch)
        .set({ manager: null })
        .where(eq(schema.branch.manager, existing.id));
    }

    // Generate new structured ID for new branch
    const newId = await generateStructuredUserId(newBranchId);

    // Update user
    const [updated] = await db.update(user)
      .set({
        branchId: newBranchId,
        id: newId,
      } as any)
      .where(eq(user.id, request.params.id))
      .returning() as any;

    // Update user_permission FK references (the old user ID is now cascade-updated)
    // The cascade onUpdate should handle ID changes in user_permission

    // Send transfer email
    if (updated.email) {
      try {
        await sendTransferEmail(
          updated.email,
          {
            firstName: updated.firstName,
            lastName: updated.lastName,
            id: newId,
            branchName: branchInfo.name,
          },
          process.env.MAILERSEND_API_TOKEN!
        );
      } catch (error) {
        fastify.log.error(error, 'Failed to send transfer email');
      }
    }

    return reply.send({ message: 'User transferred successfully', user: updated as any });
  });

  fastify.delete('/:id', async (request: any, reply) => {
    const reqUser = request.user as any;
    if (!reqUser.permissions?.includes('users.delete')) {
      return reply.forbidden('You do not have permission to delete users');
    }

    const deleteResult = await db.delete(user)
      .where(eq(user.id, request.params.id))
      .returning() as any;
    
    if (deleteResult.length === 0) return reply.notFound('User not found');
    return reply.send({ message: 'User deleted successfully' });
  });
};

export default userRoutes;
