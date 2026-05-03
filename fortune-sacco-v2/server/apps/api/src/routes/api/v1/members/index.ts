import { db, schema } from '@fastify-forge/db';
import { eq, sql, and } from 'drizzle-orm';
import type { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox';
const { member } = schema;

import { 
  CreateMemberSchema, 
  ListMemberSchema, 
  UpdateMemberSchema 
} from '#/schemas/member.schema.js';

const memberRoutes: FastifyPluginAsyncTypebox = async (fastify) => {
  fastify.get('/', { schema: ListMemberSchema }, async (request, reply) => {
    const { limit = 10, offset = 0, branchId, policyId } = request.query;

    const filters = [];
    if (branchId) filters.push(eq(member.branchId, branchId));
    if (policyId) filters.push(eq(member.policyId, policyId));

    const whereClause = filters.length > 0 ? and(...filters) : undefined;

    const data = await db.select().from(member).where(whereClause).limit(limit).offset(offset);
    const countResult = await db.select({ count: sql<number>`count(*)` }).from(member).where(whereClause);
    const count = countResult[0]?.count ?? 0;

    return reply.send({ data: data as any, total: Number(count) });
  });

  fastify.post('/', { schema: CreateMemberSchema }, async (request, reply) => {
    const insertResult = await db.insert(member).values({
      ...request.body,
      usedAnnualLimit: '0',
      usedOutpatientLimit: '0',
      usedInpatientLimit: '0',
      usedMaternityLimit: '0',
    } as any).returning() as any;
    const newMember = insertResult[0];
    return reply.code(201).send(newMember as any);
  });

  fastify.get('/:id', async (request: any, reply) => {
    const [found] = await db.select().from(member).where(eq(member.id, request.params.id)).limit(1);
    if (!found) return reply.notFound('Member not found');
    return reply.send(found as any);
  });

  fastify.put('/:id', { schema: UpdateMemberSchema }, async (request, reply) => {
    const updateResult = await db.update(member)
      .set(request.body as any)
      .where(eq(member.id, request.params.id))
      .returning() as any;
    
    const updated = updateResult[0];
    
    if (!updated) return reply.notFound('Member not found');
    return reply.send(updated as any);
  });

  fastify.delete('/:id', async (request: any, reply) => {
    if (request.user.role !== 'admin') {
      return reply.forbidden('Only admins can delete members');
    }

    const deleteResult = await db.delete(member)
      .where(eq(member.id, request.params.id))
      .returning() as any;
    
    if (deleteResult.length === 0) return reply.notFound('Member not found');
    return reply.send({ message: 'Member deleted successfully' });
  });
};

export default memberRoutes;
