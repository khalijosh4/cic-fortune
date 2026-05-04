import { db, schema } from '@fastify-forge/db';
import { eq, sql, and, getTableColumns } from 'drizzle-orm';
import type { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox';
import { Type } from '@sinclair/typebox';
const { member } = schema;

import { 
  CreateMemberSchema, 
  ListMemberSchema, 
  UpdateMemberSchema 
} from '#/schemas/member.schema.js';
import { getTerritoryFilters, hasAccess } from '#/utils/tebac.util.js';

const memberRoutes: FastifyPluginAsyncTypebox = async (fastify) => {
  fastify.get('/', { schema: ListMemberSchema }, async (request, reply) => {
    const { 
      limit = 10, offset = 0, branchId, policyId, 
      coverType, minPremiumRate, maxPremiumRate, status 
    } = request.query;

    const filters = getTerritoryFilters(request.user, member);
    if (branchId) {
      filters.push(eq(member.branchId, branchId));
    }
    
    if (policyId) filters.push(eq(member.policyId, policyId));
    if (coverType) filters.push(eq(member.coverType, coverType as any));
    if (status) filters.push(eq(member.status, status as any));
    if (minPremiumRate) filters.push(sql`${member.premiumRate} >= ${minPremiumRate}`);
    if (maxPremiumRate) filters.push(sql`${member.premiumRate} <= ${maxPremiumRate}`);

    const whereClause = filters.length > 0 ? and(...filters) : undefined;

    const data = await db.select({
      ...getTableColumns(member),
      branchName: schema.branch.name,
    })
    .from(member)
    .leftJoin(schema.branch, eq(member.branchId, schema.branch.id))
    .where(whereClause)
    .limit(limit)
    .offset(offset);

    const countResult = await db.select({ count: sql<number>`count(*)` })
      .from(member)
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
  }, async (request, reply) => {
    const { ids, status: newStatus } = request.body;
    
    await db.update(member)
      .set({ status: newStatus } as any)
      .where(sql`${member.id} IN ${ids}`);
    
    return reply.send({ message: 'Bulk status update successful' });
  });

  fastify.post('/', { schema: CreateMemberSchema }, async (request, reply) => {
    const userRole = (request as any).user.role;
    if (!['admin', 'system_admin', 'branch_manager', 'claims_officer'].includes(userRole)) {
      return reply.code(403).send({ error: 'Forbidden' } as any);
    }

    const payload: any = { ...request.body };

    // TeBAC: force branch assignment for branch staff
    if (['branch_manager', 'claims_officer'].includes(userRole)) {
      payload.branchId = (request as any).user.branchId;
    }

    // Premium Calculation
    const [rates] = await db.select().from(schema.premiumRate).limit(1);
    if (!rates) return reply.code(500).send({ error: 'Premium rates not configured' } as any);
    
    const dCount = payload.dependentsCount || 0;
    let premiumRate = Number(rates.m0);
    if (dCount === 1) premiumRate = Number(rates.m1);
    else if (dCount === 2) premiumRate = Number(rates.m2);
    else if (dCount === 3) premiumRate = Number(rates.m3);
    else if (dCount === 4) premiumRate = Number(rates.m4);
    else if (dCount === 5) premiumRate = Number(rates.m5);
    else if (dCount >= 6) premiumRate = Number(rates.m6) + ((dCount - 6) * Number(rates.extra));

    payload.premiumRate = premiumRate.toString();

    const insertResult = await db.insert(member).values({
      ...payload,
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
    
    if (!hasAccess(request.user, found)) {
      return reply.forbidden('Access denied to member outside your territory');
    }
    
    return reply.send(found as any);
  });

  fastify.put('/:id', { schema: UpdateMemberSchema }, async (request, reply) => {
    const userRole = (request as any).user.role;
    const userBranch = (request as any).user.branchId;

    const [existing] = await db.select().from(member).where(eq(member.id, request.params.id)).limit(1);
    if (!existing) return reply.notFound('Member not found');

    if (!hasAccess(request.user, existing)) {
      return reply.forbidden('Cannot edit member outside your territory');
    }

    const updateData: any = { ...request.body };

    // Field-level Security
    if (userRole === 'claims_officer') {
      delete updateData.dependentsCount;
      delete updateData.coverType;
    }

    // Recalculate Premium if dependents count changed
    if (updateData.dependentsCount !== undefined && updateData.dependentsCount !== existing.dependentsCount) {
      const [rates] = await db.select().from(schema.premiumRate).limit(1);
      if (rates) {
        const dCount = updateData.dependentsCount;
        let premiumRate = Number(rates.m0);
        if (dCount === 1) premiumRate = Number(rates.m1);
        else if (dCount === 2) premiumRate = Number(rates.m2);
        else if (dCount === 3) premiumRate = Number(rates.m3);
        else if (dCount === 4) premiumRate = Number(rates.m4);
        else if (dCount === 5) premiumRate = Number(rates.m5);
        else if (dCount >= 6) premiumRate = Number(rates.m6) + ((dCount - 6) * Number(rates.extra));
        updateData.premiumRate = premiumRate.toString();
      }
    }

    const updateResult = await db.update(member)
      .set(updateData as any)
      .where(eq(member.id, request.params.id))
      .returning() as any;
    
    const updated = updateResult[0];
    return reply.send(updated as any);
  });

  fastify.delete('/:id', async (request: any, reply) => {
    const [existing] = await db.select().from(member).where(eq(member.id, request.params.id)).limit(1);
    if (!existing) return reply.notFound('Member not found');

    if (!hasAccess(request.user, existing)) {
      return reply.forbidden('Access denied to member outside your territory');
    }

    if (!['admin', 'system_admin'].includes(request.user.role)) {
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
