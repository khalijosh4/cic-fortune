import { db, schema } from '@fastify-forge/db';
import { eq, sql, and, gte, lte, getTableColumns, inArray } from 'drizzle-orm';
import type { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox';
import { Type } from '@sinclair/typebox';
const { claim, member } = schema;

import { 
  CreateClaimSchema, 
  ListClaimSchema, 
  ApproveClaimSchema, 
  RejectClaimSchema,
  UpdateClaimSchema 
} from '#/schemas/claim.schema.js';
import { ClaimsService } from '#/services/claims.service.js';
import { hasAccess } from '#/utils/tebac.util.js';

const claimRoutes: FastifyPluginAsyncTypebox = async (fastify) => {
  fastify.get('/stats', async (request, reply) => {
    const roleFilters = [];
    if (['branch_manager', 'claims_officer', 'user'].includes(request.user.role)) {
      roleFilters.push(eq(member.branchId, (request as any).user.branchId!));
    } else if (request.user.role === 'hospital') {
      roleFilters.push(eq(claim.hospitalId, request.user.hospitalId!));
    }
    const whereClause = roleFilters.length > 0 ? and(...roleFilters) : undefined;

    const [stats] = await db.select({
      total: sql<number>`count(${claim.id})`,
      approved: sql<number>`count(${claim.id}) filter (where ${claim.status} = 'approved')`,
      pending: sql<number>`count(${claim.id}) filter (where ${claim.status} = 'pending')`,
      rejected: sql<number>`count(${claim.id}) filter (where ${claim.status} = 'rejected')`,
      totalAmountClaimed: sql<number>`sum(${claim.amountClaimed})`,
      totalAmountApproved: sql<number>`sum(${claim.amountApproved})`,
    })
    .from(claim)
    .leftJoin(member, eq(claim.memberId, member.id))
    .where(whereClause);

    return reply.send({
      total: Number(stats?.total || 0),
      approved: Number(stats?.approved || 0),
      pending: Number(stats?.pending || 0),
      rejected: Number(stats?.rejected || 0),
      totalAmountClaimed: Number(stats?.totalAmountClaimed || 0),
      totalAmountApproved: Number(stats?.totalAmountApproved || 0),
    });
  });

  fastify.get('/', { schema: ListClaimSchema }, async (request, reply) => {
    const { 
      limit = 10, offset = 0, memberId, hospitalId, status, 'status[]': statuses,
      minAmountClaimed, maxAmountClaimed, 'claimedRange[]': claimedRange,
      minAmountApproved, maxAmountApproved, 'approvedRange[]': approvedRange,
      startDate, endDate, 'timestampRange[]': timestampRange, name
    } = request.query;

    const filters = [];
    if (memberId) filters.push(eq(claim.memberId, memberId));
    if (hospitalId) filters.push(eq(claim.hospitalId, hospitalId));
    
    if (status) filters.push(eq(claim.status, status as any));
    if (statuses && statuses.length > 0) {
      filters.push(inArray(claim.status, statuses as any));
    }

    if (claimedRange?.[0] !== undefined) filters.push(sql`${claim.amountClaimed} >= ${claimedRange[0]}`);
    if (claimedRange?.[1] !== undefined) filters.push(sql`${claim.amountClaimed} <= ${claimedRange[1]}`);
    if (minAmountClaimed) filters.push(sql`${claim.amountClaimed} >= ${minAmountClaimed}`);
    if (maxAmountClaimed) filters.push(sql`${claim.amountClaimed} <= ${maxAmountClaimed}`);
    
    if (approvedRange?.[0] !== undefined) filters.push(sql`${claim.amountApproved} >= ${approvedRange[0]}`);
    if (approvedRange?.[1] !== undefined) filters.push(sql`${claim.amountApproved} <= ${approvedRange[1]}`);
    if (minAmountApproved) filters.push(sql`${claim.amountApproved} >= ${minAmountApproved}`);
    if (maxAmountApproved) filters.push(sql`${claim.amountApproved} <= ${maxAmountApproved}`);
    
    if (timestampRange?.[0]) filters.push(gte(claim.createdAt, new Date(timestampRange[0])));
    if (timestampRange?.[1]) filters.push(lte(claim.createdAt, new Date(timestampRange[1])));
    if (startDate) filters.push(gte(claim.createdAt, new Date(startDate)));
    if (endDate) filters.push(lte(claim.createdAt, new Date(endDate)));
    
    if (name) {
      filters.push(sql`(${member.firstName} || ' ' || ${member.lastName}) ILIKE ${`%${name}%`}`);
    }

    // Role based filtering (TeBAC)
    // Note: For branch staff, we need to join with member to filter by branchId
    // Our utility handles direct columns, but for claims we need member branch
    if (['branch_manager', 'claims_officer', 'user'].includes(request.user.role)) {
       filters.push(eq(member.branchId, (request as any).user.branchId!));
    } else if (request.user.role === 'hospital') {
       filters.push(eq(claim.hospitalId, request.user.hospitalId!));
    }

    const whereClause = filters.length > 0 ? and(...filters) : undefined;

    const data = await db.select({
      ...getTableColumns(claim),
      memberName: sql`${member.firstName} || ' ' || ${member.lastName}`,
    })
    .from(claim)
    .leftJoin(member, eq(claim.memberId, member.id))
    .where(whereClause)
    .limit(limit)
    .offset(offset);

    const countResult = await db.select({ count: sql<number>`count(*)` })
      .from(claim)
      .leftJoin(member, eq(claim.memberId, member.id))
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
    if (!['admin', 'system_admin'].includes(request.user.role)) {
      return reply.forbidden('Only admins can update bulk status');
    }

    const { ids, status: newStatus } = request.body;
    
    await db.update(claim)
      .set({ status: newStatus } as any)
      .where(sql`${claim.id} IN ${ids}`);
    
    return reply.send({ message: 'Bulk status update successful' });
  });

  fastify.post('/', { schema: CreateClaimSchema }, async (request, reply) => {
    // Hospitals or admins can submit claims
    if (!['admin', 'system_admin'].includes(request.user.role) && request.user.role !== 'hospital') {
      return reply.forbidden('Only admins or hospitals can submit claims');
    }

    const payload = {
      ...request.body,
      status: 'pending' as any,
    };

    if (request.user.role === 'hospital') {
      payload.hospitalId = request.user.hospitalId!;
    }

    const { generateStructuredClaimId } = await import('#/utils/id-generator.util.js');
    const id = await generateStructuredClaimId();

    const insertResult = await db.insert(claim).values({
      ...payload,
      id,
    } as any).returning() as any;
    const newClaim = insertResult[0];

    // Evaluate limits automatically
    const evaluation = await ClaimsService.evaluateClaimLimits(newClaim.id);

    return reply.code(201).send({ ...newClaim, evaluation } as any);
  });

  fastify.get('/:id', async (request: any, reply) => {
    const [found] = await db.select({
      ...getTableColumns(claim),
      branchId: member.branchId,
    })
    .from(claim)
    .leftJoin(member, eq(claim.memberId, member.id))
    .where(eq(claim.id, request.params.id))
    .limit(1);
    
    if (!found) return reply.notFound('Claim not found');

    if (!hasAccess(request.user, found)) {
      return reply.forbidden('Access denied to claim outside your territory');
    }

    const evaluation = await ClaimsService.evaluateClaimLimits(found.id);
    return reply.send({ ...found, evaluation } as any);
  });

  fastify.post('/:id/approve', { schema: ApproveClaimSchema }, async (request, reply) => {
    if (!['admin', 'system_admin'].includes(request.user.role)) {
      return reply.forbidden('Only admins can approve claims');
    }

    const updated = await ClaimsService.approveClaim(request.params.id, request.body.amountApproved);
    return reply.send(updated as any);
  });

  fastify.post('/:id/reject', { schema: RejectClaimSchema }, async (request, reply) => {
    if (!['admin', 'system_admin'].includes(request.user.role)) {
      return reply.forbidden('Only admins can reject claims');
    }

    const updateResult = await db.update(claim)
      .set({ status: 'rejected' } as any)
      .where(eq(claim.id, request.params.id))
      .returning() as any;
    
    const updated = updateResult[0];
    
    if (!updated) return reply.notFound('Claim not found');
    return reply.send(updated as any);
  });

  fastify.put('/:id', { schema: UpdateClaimSchema }, async (request, reply) => {
    if (!['admin', 'system_admin'].includes(request.user.role)) {
      return reply.forbidden('Only admins can update claims');
    }

    const updateResult = await db.update(claim)
      .set(request.body as any)
      .where(eq(claim.id, request.params.id))
      .returning() as any;
    
    const updated = updateResult[0];
    
    if (!updated) return reply.notFound('Claim not found');
    return reply.send(updated as any);
  });

  fastify.delete('/:id', async (request: any, reply) => {
    if (!['admin', 'system_admin'].includes(request.user.role)) {
      return reply.forbidden('Only admins can delete claims');
    }

    const deleteResult = await db.delete(claim)
      .where(eq(claim.id, request.params.id))
      .returning() as any;
    
    if (deleteResult.length === 0) return reply.notFound('Claim not found');
    return reply.send({ message: 'Claim deleted successfully' });
  });
};

export default claimRoutes;
