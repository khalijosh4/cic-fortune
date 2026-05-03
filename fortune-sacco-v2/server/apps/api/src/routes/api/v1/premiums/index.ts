import { db, schema } from '@fastify-forge/db';
import { eq, sql, and } from 'drizzle-orm';
import type { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox';
const { premium } = schema;

import { 
  CreatePremiumSchema, 
  ListPremiumSchema, 
  PayPremiumSchema,
  GetPremiumSchema,
  UpdatePremiumSchema 
} from '#/schemas/premium.schema.js';
import { PremiumService } from '#/services/premium.service.js';

const premiumRoutes: FastifyPluginAsyncTypebox = async (fastify) => {
  fastify.get('/', { schema: ListPremiumSchema }, async (request, reply) => {
    const { limit = 10, offset = 0, memberId } = request.query;

    const filters = [];
    if (memberId) filters.push(eq(premium.memberId, memberId));

    const whereClause = filters.length > 0 ? and(...filters) : undefined;

    const data = await db.select().from(premium).where(whereClause).limit(limit).offset(offset);
    const countResult = await db.select({ count: sql<number>`count(*)` }).from(premium).where(whereClause);
    const count = countResult[0]?.count ?? 0;

    return reply.send({ data: data as any, total: Number(count) });
  });

  fastify.post('/', { schema: CreatePremiumSchema }, async (request, reply) => {
    if (request.user.role !== 'admin') {
      return reply.forbidden('Only admins can generate premiums');
    }

    const { memberId, dueDate } = request.body;
    const newPremium = await PremiumService.generatePremium(memberId, new Date(dueDate));
    return reply.code(201).send(newPremium as any);
  });

  fastify.post('/:id/pay', { schema: PayPremiumSchema }, async (request, reply) => {
    const updated = await PremiumService.recordPayment(
      request.params.id, 
      request.body.amountPaid, 
      request.body.paymentMethod
    );
    return reply.send(updated as any);
  });
  
  fastify.get('/:id', { schema: GetPremiumSchema }, async (request, reply) => {
    const [found] = await db.select().from(premium).where(eq(premium.id, request.params.id)).limit(1);
    if (!found) return reply.notFound('Premium record not found');
    return reply.send(found as any);
  });

  fastify.put('/:id', { schema: UpdatePremiumSchema }, async (request, reply) => {
    if (request.user.role !== 'admin') {
      return reply.forbidden('Only admins can update premiums');
    }

    const updateResult = await db.update(premium)
      .set(request.body as any)
      .where(eq(premium.id, request.params.id))
      .returning() as any;
    
    const updated = updateResult[0];
    
    if (!updated) return reply.notFound('Premium record not found');
    return reply.send(updated as any);
  });

  fastify.delete('/:id', async (request: any, reply) => {
    if (request.user.role !== 'admin') {
      return reply.forbidden('Only admins can delete premiums');
    }

    const deleteResult = await db.delete(premium)
      .where(eq(premium.id, request.params.id))
      .returning() as any;
    
    if (deleteResult.length === 0) return reply.notFound('Premium record not found');
    return reply.send({ message: 'Premium record deleted successfully' });
  });
};

export default premiumRoutes;
