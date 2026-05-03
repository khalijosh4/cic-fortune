import { db, schema } from '@fastify-forge/db';
import { eq, sql, and } from 'drizzle-orm';
import type { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox';
const { claim } = schema;

import { 
  CreateClaimSchema, 
  ListClaimSchema, 
  ApproveClaimSchema, 
  RejectClaimSchema,
  UpdateClaimSchema 
} from '#/schemas/claim.schema.js';
import { ClaimsService } from '#/services/claims.service.js';

const claimRoutes: FastifyPluginAsyncTypebox = async (fastify) => {
  fastify.get('/', { schema: ListClaimSchema }, async (request, reply) => {
    const { limit = 10, offset = 0, memberId, hospitalId, status } = request.query;

    const filters = [];
    if (memberId) filters.push(eq(claim.memberId, memberId));
    if (hospitalId) filters.push(eq(claim.hospitalId, hospitalId));
    if (status) filters.push(eq(claim.status, status as any));

    // Role based filtering
    if (request.user.role === 'hospital') {
      filters.push(eq(claim.hospitalId, request.user.hospitalId!));
    }

    const whereClause = filters.length > 0 ? and(...filters) : undefined;

    const data = await db.select().from(claim).where(whereClause).limit(limit).offset(offset);
    const countResult = await db.select({ count: sql<number>`count(*)` }).from(claim).where(whereClause);
    const count = countResult[0]?.count ?? 0;

    return reply.send({ data: data as any, total: Number(count) });
  });

  fastify.post('/', { schema: CreateClaimSchema }, async (request, reply) => {
    // Hospitals or admins can submit claims
    if (request.user.role !== 'admin' && request.user.role !== 'hospital') {
      return reply.forbidden('Only admins or hospitals can submit claims');
    }

    const payload = {
      ...request.body,
      status: 'pending' as any,
    };

    if (request.user.role === 'hospital') {
      payload.hospitalId = request.user.hospitalId!;
    }

    const insertResult = await db.insert(claim).values(payload as any).returning() as any;
    const newClaim = insertResult[0];

    // Evaluate limits automatically
    const evaluation = await ClaimsService.evaluateClaimLimits(newClaim.id);

    return reply.code(201).send({ ...newClaim, evaluation } as any);
  });

  fastify.get('/:id', async (request: any, reply) => {
    const [found] = await db.select().from(claim).where(eq(claim.id, request.params.id)).limit(1);
    if (!found) return reply.notFound('Claim not found');

    const evaluation = await ClaimsService.evaluateClaimLimits(found.id);
    return reply.send({ ...found, evaluation } as any);
  });

  fastify.post('/:id/approve', { schema: ApproveClaimSchema }, async (request, reply) => {
    if (request.user.role !== 'admin') {
      return reply.forbidden('Only admins can approve claims');
    }

    const updated = await ClaimsService.approveClaim(request.params.id, request.body.amountApproved);
    return reply.send(updated as any);
  });

  fastify.post('/:id/reject', { schema: RejectClaimSchema }, async (request, reply) => {
    if (request.user.role !== 'admin') {
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
    if (request.user.role !== 'admin') {
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
    if (request.user.role !== 'admin') {
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
