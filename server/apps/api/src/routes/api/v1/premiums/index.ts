import { db, schema } from '@fastify-forge/db';
import { eq, sql, and, gte, lte, getTableColumns } from 'drizzle-orm';
import type { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox';
import { Type } from '@sinclair/typebox';
const { premium, member } = schema;

import { 
  CreatePremiumSchema, 
  ListPremiumSchema, 
  PayPremiumSchema,
  GetPremiumSchema,
  UpdatePremiumSchema 
} from '#/schemas/premium.schema.js';
import { PremiumService } from '#/services/premium.service.js';
import { hasAccess } from '#/utils/tebac.util.js';

const premiumRoutes: FastifyPluginAsyncTypebox = async (fastify) => {
  fastify.get('/stats', async (request, reply) => {
    const filters = [];
    const { lobId } = request.query as any;
    if (lobId) filters.push(eq(premium.lobId, lobId));

    if (['branch_manager', 'claims_officer', 'user'].includes((request as any).user.role)) {
      filters.push(eq(member.branchId, (request as any).user.branchId!));
    }
    const whereClause = filters.length > 0 ? and(...filters) : undefined;

    const [stats] = await db.select({
      totalDue: sql<number>`sum(${premium.amountDue})`,
      totalPaid: sql<number>`sum(${premium.amountPaid})`,
      count: sql<number>`count(*)`,
    })
    .from(premium)
    .leftJoin(member, eq(premium.memberId, member.id))
    .where(whereClause);

    const totalDue = Number(stats?.totalDue || 0);
    const totalPaid = Number(stats?.totalPaid || 0);
    const outstanding = totalDue - totalPaid;
    const collectionRate = totalDue > 0 ? Math.round((totalPaid / totalDue) * 100) : 0;

    return reply.send({ totalDue, totalPaid, outstanding, collectionRate, total: Number(stats?.count || 0) });
  });

  fastify.get('/', { schema: ListPremiumSchema }, async (request, reply) => {
    const { 
      limit = 10, offset = 0, memberId, lobId, status, 'status[]': statuses,
      minAmountDue, maxAmountDue, 'amountDueRange[]': amountDueRange,
      minAmountPaid, maxAmountPaid, 'amountPaidRange[]': amountPaidRange,
      startDate, endDate, 'dueDateRange[]': dueDateRange, name
    } = request.query;

    const filters = [];
    if (lobId) filters.push(eq(premium.lobId, lobId));
    if (memberId) filters.push(eq(premium.memberId, memberId));
    
    const applyStatusFilter = (s: string) => {
      if (s === 'paid') return sql`${premium.amountPaid} IS NOT NULL AND ${premium.amountPaid} >= ${premium.amountDue}`;
      if (s === 'unpaid') return sql`${premium.amountPaid} IS NULL OR ${premium.amountPaid} < ${premium.amountDue}`;
      return null;
    };

    if (status) {
      const f = applyStatusFilter(status);
      if (f) filters.push(f);
    }
    if (statuses && statuses.length > 0) {
      const statusFilters = statuses.map(applyStatusFilter).filter((f): f is NonNullable<ReturnType<typeof applyStatusFilter>> => f !== null);
      if (statusFilters.length > 0) {
        filters.push(sql`(${sql.join(statusFilters, sql` OR `)})`);
      }
    }

    if (amountDueRange?.[0] !== undefined) filters.push(sql`${premium.amountDue} >= ${amountDueRange[0]}`);
    if (amountDueRange?.[1] !== undefined) filters.push(sql`${premium.amountDue} <= ${amountDueRange[1]}`);
    if (minAmountDue) filters.push(sql`${premium.amountDue} >= ${minAmountDue}`);
    if (maxAmountDue) filters.push(sql`${premium.amountDue} <= ${maxAmountDue}`);
    
    if (amountPaidRange?.[0] !== undefined) filters.push(sql`${premium.amountPaid} >= ${amountPaidRange[0]}`);
    if (amountPaidRange?.[1] !== undefined) filters.push(sql`${premium.amountPaid} <= ${amountPaidRange[1]}`);
    if (minAmountPaid) filters.push(sql`${premium.amountPaid} >= ${minAmountPaid}`);
    if (maxAmountPaid) filters.push(sql`${premium.amountPaid} <= ${maxAmountPaid}`);
    
    if (dueDateRange?.[0]) filters.push(gte(premium.dueDate, new Date(dueDateRange[0])));
    if (dueDateRange?.[1]) filters.push(lte(premium.dueDate, new Date(dueDateRange[1])));
    if (startDate) filters.push(gte(premium.dueDate, new Date(startDate)));
    if (endDate) filters.push(lte(premium.dueDate, new Date(endDate)));
    
    if (name) {
      filters.push(sql`(${member.firstName} || ' ' || ${member.lastName}) ILIKE ${`%${name}%`}`);
    }

    // TeBAC filtering
    if (['branch_manager', 'claims_officer', 'user'].includes((request as any).user.role)) {
      filters.push(eq(member.branchId, (request as any).user.branchId!));
    }

    const whereClause = filters.length > 0 ? and(...filters) : undefined;

    const data = await db.select({
      ...getTableColumns(premium),
      memberName: sql`${member.firstName} || ' ' || ${member.lastName}`,
    })
    .from(premium)
    .leftJoin(member, eq(premium.memberId, member.id))
    .where(whereClause)
    .limit(limit)
    .offset(offset);

    const countResult = await db.select({ count: sql<number>`count(*)` })
      .from(premium)
      .leftJoin(member, eq(premium.memberId, member.id))
      .where(whereClause);
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
    if (!['admin', 'system_admin'].includes(request.user.role)) {
      return reply.forbidden('Only admins can update bulk status');
    }

    const { ids, status: newStatus } = request.body;
    
    await db.update(premium)
      .set({ paymentMethod: newStatus } as any)
      .where(sql`${premium.id} IN ${ids}`);
    
    return reply.send({ message: 'Bulk status update successful' });
  });

  fastify.post('/', { schema: CreatePremiumSchema }, async (request, reply) => {
    if (!['admin', 'system_admin'].includes(request.user.role)) {
      return reply.forbidden('Only admins can generate premiums');
    }

    const { memberId, dueDate, lobId } = request.body as any;
    const newPremium = await PremiumService.generatePremium(memberId, new Date(dueDate));
    // Set lobId on the new premium
    const premiumLobId = lobId || (request.user as any).lobIds?.[0];
    if (premiumLobId && newPremium) {
      await db.update(premium).set({ lobId: premiumLobId } as any).where(eq(premium.id, (newPremium as any).id));
    }
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
    const [found] = await db.select({
      ...getTableColumns(premium),
      branchId: member.branchId,
    })
    .from(premium)
    .leftJoin(member, eq(premium.memberId, member.id))
    .where(eq(premium.id, request.params.id))
    .limit(1);

    if (!found) return reply.notFound('Premium record not found');
    
    if (!hasAccess(request.user, found)) {
      return reply.forbidden('Access denied to premium record outside your territory');
    }
    
    return reply.send(found as any);
  });

  fastify.put('/:id', { schema: UpdatePremiumSchema }, async (request, reply) => {
    if (!['admin', 'system_admin'].includes(request.user.role)) {
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
    if (!['admin', 'system_admin'].includes(request.user.role)) {
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
