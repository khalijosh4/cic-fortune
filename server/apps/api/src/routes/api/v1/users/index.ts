import { db, schema } from '@fastify-forge/db';
import { eq, sql, and, inArray } from 'drizzle-orm';
import type { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox';
import bcrypt from 'bcryptjs';

const { user } = schema;

import { 
  CreateUserSchema, 
  ListUserSchema, 
  UpdateUserSchema 
} from '#/schemas/user.schema.js';
import { getTerritoryFilters, hasAccess } from '#/utils/tebac.util.js';
import { generateStructuredUserId, generateTemporaryPassword } from '#/utils/id-generator.util.js';
import { sendWelcomeEmail } from '#/utils/notification.util.js';

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

  fastify.post('/', { schema: CreateUserSchema }, async (request, reply) => {
    const { password: providedPassword, branchId, ...rest } = request.body;

    // Territory-based enforcement: branch managers can only create users for their branch
    if (['branch_manager', 'claims_officer'].includes(request.user.role)) {
      if (branchId !== request.user.branchId) {
        return reply.forbidden('You can only create users for your assigned branch');
      }
    }

    const password = providedPassword || generateTemporaryPassword();
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Generate structured ID if branch is provided
    let structuredId = null;
    if (branchId) {
      structuredId = await generateStructuredUserId(branchId);
    }

    const insertResult = await db.insert(user).values({
      ...rest,
      branchId,
      password: hashedPassword,
      structuredId,
      mustChangePassword: true,
    } as any).returning() as any;
    
    const newUser = insertResult[0];

    // Trigger welcome email
    if (newUser.email) {
      try {
        await sendWelcomeEmail(
          newUser.email,
          { 
            firstName: newUser.firstName, 
            lastName: newUser.lastName, 
            structuredId: newUser.structuredId, 
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
    
    return reply.send(found as any);
  });

  fastify.put('/:id', { schema: UpdateUserSchema }, async (request, reply) => {
    const [existing] = await db.select().from(user).where(eq(user.id, request.params.id)).limit(1);
    if (!existing) return reply.notFound('User not found');

    if (!hasAccess(request.user, existing)) {
      return reply.forbidden('Cannot edit user outside your territory');
    }

    const updates: any = { ...request.body };

    // Re-generate structured ID if branchId is changing
    if (updates.branchId && updates.branchId !== existing.branchId) {
      updates.structuredId = await generateStructuredUserId(updates.branchId);
    }

    const updateResult = await db.update(user)
      .set(updates)
      .where(eq(user.id, request.params.id))
      .returning() as any;
    
    const updated = updateResult[0];
    return reply.send(updated as any);
  });

  fastify.delete('/:id', async (request: any, reply) => {
    if (!['admin', 'system_admin'].includes(request.user.role)) {
      return reply.forbidden('Only admins can delete users');
    }

    const deleteResult = await db.delete(user)
      .where(eq(user.id, request.params.id))
      .returning() as any;
    
    if (deleteResult.length === 0) return reply.notFound('User not found');
    return reply.send({ message: 'User deleted successfully' });
  });
};

export default userRoutes;
