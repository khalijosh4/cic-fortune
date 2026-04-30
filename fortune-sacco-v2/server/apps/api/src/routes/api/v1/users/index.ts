import { db, schema } from '@fastify-forge/db';
import { eq, sql, and } from 'drizzle-orm';
import type { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox';
import bcrypt from 'bcryptjs';

const { user } = schema;

import { 
  CreateUserSchema, 
  ListUserSchema, 
  UpdateUserSchema 
} from '#/schemas/user.schema.js';

const userRoutes: FastifyPluginAsyncTypebox = async (fastify) => {
  fastify.get('/', { schema: ListUserSchema }, async (request, reply) => {
    const { limit = 10, offset = 0, role, branchId } = request.query;

    const filters = [];
    if (role) filters.push(eq(user.role, role as any));
    if (branchId) filters.push(eq(user.branchId, branchId));

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
    }).from(user).where(whereClause).limit(limit).offset(offset);
    
    const countResult = await db.select({ count: sql<number>`count(*)` }).from(user).where(whereClause);
    const count = countResult[0]?.count ?? 0;

    return reply.send({ data: data as any, total: Number(count) });
  });

  fastify.post('/', { schema: CreateUserSchema }, async (request, reply) => {
    const { password, ...rest } = request.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const insertResult = await db.insert(user).values({
      ...rest,
      password: hashedPassword,
    } as any).returning() as any;
    
    const newUser = insertResult[0];
    return reply.code(201).send(newUser as any);
  });

  fastify.get('/:id', async (request: any, reply) => {
    const [found] = await db.select().from(user).where(eq(user.id, request.params.id)).limit(1);
    if (!found) return reply.notFound('User not found');
    return reply.send(found as any);
  });

  fastify.put('/:id', { schema: UpdateUserSchema }, async (request, reply) => {
    const updateResult = await db.update(user)
      .set(request.body as any)
      .where(eq(user.id, request.params.id))
      .returning() as any;
    
    const updated = updateResult[0];
    
    if (!updated) return reply.notFound('User not found');
    return reply.send(updated as any);
  });
};

export default userRoutes;
