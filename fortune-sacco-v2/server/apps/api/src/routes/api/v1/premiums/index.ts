import { db, schema } from '@fastify-forge/db';
import { eq, sql, and, gte, lte } from 'drizzle-orm';
import type { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox';
import { Type } from '@sinclair/typebox';
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
    const { 
      limit = 10, offset = 0, memberId, status,
      minAmountDue, maxAmountDue, minAmountPaid, maxAmountPaid,
      startDate, endDate
    } = request.query;

    const filters = [];
    if (memberId) filters.push(eq(premium.memberId, memberId));
    if (status) {
      if (status === 'paid') filters.push(sql`${premium.amountPaid} IS NOT NULL AND ${premium.amountPaid} >= ${premium.amountDue}`);
      else if (status === 'unpaid') filters.push(sql`${premium.amountPaid} IS NULL OR ${premium.amountPaid} < ${premium.amountDue}`);
    }
    if (minAmountDue) filters.push(sql`${premium.amountDue} >= ${minAmountDue}`);
    if (maxAmountDue) filters.push(sql`${premium.amountDue} <= ${maxAmountDue}`);
    if (minAmountPaid) filters.push(sql`${premium.amountPaid} >= ${minAmountPaid}`);
    if (maxAmountPaid) filters.push(sql`${premium.amountPaid} <= ${maxAmountPaid}`);
    if (startDate) filters.push(gte(premium.dueDate, new Date(startDate)));
    if (endDate) filters.push(lte(premium.dueDate, new Date(endDate)));

    const whereClause = filters.length > 0 ? and(...filters) : undefined;

    const data = await db.select().from(premium).where(whereClause).limit(limit).offset(offset);
    const countResult = await db.select({ count: sql<number>`count(*)` }).from(premium).where(whereClause);
    const count = countResult[0]?.count ?? 0;

    return reply.send({ data: data as any, total: Number(count) });
  });

  fastify.put('/bulk-status', {
    schema: {
      body: Type.Object({
        ids: Type.Array(Type.String()),
        status: Type.String(),
      }),
    }
  }, async (request: any, reply) => {
    if (request.user.role !== 'admin') {
      return reply.forbidden('Only admins can update bulk status');
    }

    const { ids, status: newStatus } = request.body;
    
    // For premiums, status is derived; we update paymentMethod as a marker
    // A more complete implementation would update a dedicated status field
    await db.update(premium)
      .set({ paymentMethod: newStatus } as any)
      .where(sql`${premium.id} IN ${ids}`);
    
    return reply.send({ message: 'Bulk status update successful' });
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
