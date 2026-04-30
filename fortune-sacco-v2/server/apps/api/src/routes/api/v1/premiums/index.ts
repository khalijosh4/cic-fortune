import { db, schema } from '@fastify-forge/db';
import { eq, sql, and } from 'drizzle-orm';
import type { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox';
const { premium } = schema;

import { 
  CreatePremiumSchema, 
  ListPremiumSchema, 
  PayPremiumSchema 
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
};

export default premiumRoutes;
