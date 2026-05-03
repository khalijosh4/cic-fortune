import { db, schema } from '@fastify-forge/db';
import { eq, sql } from 'drizzle-orm';
import type { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox';
const { policy } = schema;

import { 
  CreatePolicySchema, 
  ListPolicySchema, 
  UpdatePolicySchema 
} from '#/schemas/policy.schema.js';

const policyRoutes: FastifyPluginAsyncTypebox = async (fastify) => {
  fastify.get('/', { schema: ListPolicySchema }, async (request, reply) => {
    const { limit = 10, offset = 0 } = request.query;

    const data = await db.select().from(policy).limit(limit).offset(offset);
    const countResult = await db.select({ count: sql<number>`count(*)` }).from(policy);
    const count = countResult[0]?.count ?? 0;

    return reply.send({ data: data as any, total: Number(count) });
  });

  fastify.post('/', { schema: CreatePolicySchema }, async (request, reply) => {
    if (request.user.role !== 'admin') {
      return reply.forbidden('Only admins can create policies');
    }

    const insertResult = await db.insert(policy).values(request.body as any).returning() as any;
    const newPolicy = insertResult[0];
    return reply.code(201).send(newPolicy as any);
  });

  fastify.get('/:id', async (request: any, reply) => {
    const [found] = await db.select().from(policy).where(eq(policy.id, request.params.id)).limit(1);
    if (!found) return reply.notFound('Policy not found');
    return reply.send(found as any);
  });

  fastify.put('/:id', { schema: UpdatePolicySchema }, async (request, reply) => {
    if (request.user.role !== 'admin') {
      return reply.forbidden('Only admins can update policies');
    }

    const updateResult = await db.update(policy)
      .set(request.body as any)
      .where(eq(policy.id, request.params.id))
      .returning() as any;
    
    const updated = updateResult[0];
    
    if (!updated) return reply.notFound('Policy not found');
    return reply.send(updated as any);
  });

  fastify.delete('/:id', async (request: any, reply) => {
    if (request.user.role !== 'admin') {
      return reply.forbidden('Only admins can delete policies');
    }

    const deleteResult = await db.delete(policy)
      .where(eq(policy.id, request.params.id))
      .returning() as any;
    
    if (deleteResult.length === 0) return reply.notFound('Policy not found');
    return reply.send({ message: 'Policy deleted successfully' });
  });
};

export default policyRoutes;
