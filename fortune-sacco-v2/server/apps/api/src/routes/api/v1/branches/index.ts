import { db, schema } from '@fastify-forge/db';
import { eq, sql, and } from 'drizzle-orm';
import type { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox';
const { branch, branchStats } = schema;

import { 
  CreateBranchSchema, 
  ListBranchSchema, 
  GetBranchSchema, 
  UpdateBranchSchema 
} from '#/schemas/branch.schema.js';

const branchRoutes: FastifyPluginAsyncTypebox = async (fastify) => {
  fastify.get('/', { schema: ListBranchSchema }, async (request, reply) => {
    const { 
      limit = 10, offset = 0, location, 
      minPolicies, maxPolicies, minActivePolicies, maxActivePolicies 
    } = request.query;

    const filters = [];
    if (location) filters.push(sql`${branch.location} ILIKE ${`%${location}%`}`);
    if (minPolicies) filters.push(sql`${branchStats.totalPolicies} >= ${minPolicies}`);
    if (maxPolicies) filters.push(sql`${branchStats.totalPolicies} <= ${maxPolicies}`);
    if (minActivePolicies) filters.push(sql`${branchStats.totalActivePolicies} >= ${minActivePolicies}`);
    if (maxActivePolicies) filters.push(sql`${branchStats.totalActivePolicies} <= ${maxActivePolicies}`);

    const whereClause = filters.length > 0 ? and(...filters) : undefined;

    const data = await db.select({
      branchId: branchStats.branchId,
      branchName: branchStats.branchName,
      totalMembers: branchStats.totalMembers,
      totalPolicies: branchStats.totalPolicies,
      totalActivePolicies: branchStats.totalActivePolicies,
      totalClaims: branchStats.totalClaims,
      location: branch.location,
      managerName: sql<string>`${schema.user.firstName} || ' ' || ${schema.user.lastName}`.as('manager_name'),
    })
    .from(branchStats)
    .innerJoin(branch, eq(branchStats.branchId, branch.id))
    .innerJoin(schema.user, eq(branch.manager, schema.user.id))
    .where(whereClause)
    .limit(limit)
    .offset(offset);

    const countResult = await db.select({ count: sql<number>`count(*)` })
      .from(branchStats)
      .innerJoin(branch, eq(branchStats.branchId, branch.id))
      .where(whereClause);
    const count = countResult[0]?.count ?? 0;

    return reply.send({ data: data as any, total: Number(count) });
  });

  fastify.post('/', { schema: CreateBranchSchema }, async (request, reply) => {
    // Only admins should be able to create branches
    if (request.user.role !== 'admin') {
      return reply.forbidden('Only admins can create branches');
    }

    const insertResult = await db.insert(branch).values(request.body as any).returning() as any;
    const newBranch = insertResult[0];
    return reply.code(201).send(newBranch as any);
  });

  fastify.get('/:id', { schema: GetBranchSchema }, async (request, reply) => {
    const [foundBranch] = await db.select().from(branch).where(eq(branch.id, request.params.id)).limit(1);
    if (!foundBranch) return reply.notFound('Branch not found');
    return reply.send(foundBranch as any);
  });

  fastify.put('/:id', { schema: UpdateBranchSchema }, async (request, reply) => {
    if (request.user.role !== 'admin') {
      return reply.forbidden('Only admins can update branches');
    }

    const updateResult = await db.update(branch)
      .set(request.body as any)
      .where(eq(branch.id, request.params.id))
      .returning() as any;
    
    const updatedBranch = updateResult[0];
    
    if (!updatedBranch) return reply.notFound('Branch not found');
    return reply.send(updatedBranch as any);
  });

  fastify.delete('/:id', async (request: any, reply) => {
    if (request.user.role !== 'admin') {
      return reply.forbidden('Only admins can delete branches');
    }

    const deleteResult = await db.delete(branch)
      .where(eq(branch.id, request.params.id))
      .returning() as any;
    
    if (deleteResult.length === 0) return reply.notFound('Branch not found');
    return reply.send({ message: 'Branch deleted successfully' });
  });
};

export default branchRoutes;
