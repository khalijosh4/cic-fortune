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
import { getTerritoryFilters, hasAccess } from '#/utils/tebac.util.js';
import { generateStructuredBranchId } from '#/utils/id-generator.util.js';

const branchRoutes: FastifyPluginAsyncTypebox = async (fastify) => {
  fastify.get('/stats', async (request, reply) => {
    const [stats] = await db.select({
      total: sql<number>`count(${branch.id})`,
      totalMembers: sql<number>`sum(${branchStats.totalMembers})`,
      totalClaims: sql<number>`sum(${branchStats.totalClaims})`,
    })
    .from(branchStats)
    .innerJoin(branch, eq(branchStats.id, branch.id));

    const total = Number(stats?.total || 0);
    const totalMembers = Number(stats?.totalMembers || 0);
    const totalClaims = Number(stats?.totalClaims || 0);

    return reply.send({
      total,
      totalMembers,
      totalClaims,
      avgMembers: total > 0 ? Math.round(totalMembers / total) : 0,
    });
  });

  fastify.get('/', { schema: ListBranchSchema }, async (request, reply) => {
    const { 
      limit = 10, offset = 0, location, branchName,
      minPlans, maxPlans, 'plansRange[]': plansRange,
      minActivePlans, maxActivePlans, 'activePlansRange[]': activePlansRange,
    } = request.query;

    const filters = getTerritoryFilters(request.user, branch);
    if (location) filters.push(sql`${branch.location} ILIKE ${`%${location}%`}`);
    if (branchName) filters.push(sql`${branch.name} ILIKE ${`%${branchName}%`}`);
    
    if (plansRange?.[0] !== undefined) filters.push(sql`${branchStats.totalPlans} >= ${plansRange[0]}`);
    if (plansRange?.[1] !== undefined) filters.push(sql`${branchStats.totalPlans} <= ${plansRange[1]}`);
    if (minPlans) filters.push(sql`${branchStats.totalPlans} >= ${minPlans}`);
    if (maxPlans) filters.push(sql`${branchStats.totalPlans} <= ${maxPlans}`);
    
    if (activePlansRange?.[0] !== undefined) filters.push(sql`${branchStats.totalActivePlans} >= ${activePlansRange[0]}`);
    if (activePlansRange?.[1] !== undefined) filters.push(sql`${branchStats.totalActivePlans} <= ${activePlansRange[1]}`);
    if (minActivePlans) filters.push(sql`${branchStats.totalActivePlans} >= ${minActivePlans}`);
    if (maxActivePlans) filters.push(sql`${branchStats.totalActivePlans} <= ${maxActivePlans}`);

    const whereClause = filters.length > 0 ? and(...filters) : undefined;

    const data = await db.select({
      branchId: branchStats.id,
      branchName: branchStats.name,
      totalMembers: branchStats.totalMembers,
      totalPlans: branchStats.totalPlans,
      totalActivePlans: branchStats.totalActivePlans,
      totalClaims: branchStats.totalClaims,
      location: branch.location,
      managerName: sql<string>`${schema.user.firstName} || ' ' || ${schema.user.lastName}`.as('manager_name'),
    })
    .from(branchStats)
    .innerJoin(branch, eq(branchStats.id, branch.id))
    .leftJoin(schema.user, eq(branch.manager, schema.user.id))
    .where(whereClause)
    .limit(limit)
    .offset(offset);

    const countResult = await db.select({ count: sql<number>`count(*)` })
      .from(branchStats)
      .leftJoin(branch, eq(branchStats.id, branch.id))
      .where(whereClause);
    const count = countResult[0]?.count ?? 0;

    return reply.send({ data: data as any, total: Number(count) });
  });

  fastify.post('/', { schema: CreateBranchSchema }, async (request, reply) => {
    // Only admins should be able to create branches
    if (!['admin', 'system_admin'].includes(request.user.role)) {
      return reply.forbidden('Only admins can create branches');
    }

    const { name, manager: managerId } = request.body as any;
    const structuredId = await generateStructuredBranchId(name);

    const insertResult = await db.insert(branch).values({
      ...request.body,
      structuredId,
    } as any).returning() as any;
    
    const newBranch = insertResult[0];

    // If a manager was assigned during creation, update the user's details
    if (managerId && newBranch) {
      const { generateStructuredUserId } = await import('#/utils/id-generator.util.js');
      const newUserStructuredId = await generateStructuredUserId(newBranch.id);
      
      await db.update(schema.user)
        .set({
          branchId: newBranch.id,
          role: 'branch_manager',
          structuredId: newUserStructuredId,
        } as any)
        .where(eq(schema.user.id, managerId));
    }

    return reply.code(201).send(newBranch as any);
  });

  fastify.get('/:id', { schema: GetBranchSchema }, async (request, reply) => {
    const [foundBranch] = await db.select().from(branch).where(eq(branch.id, request.params.id)).limit(1);
    if (!foundBranch) return reply.notFound('Branch not found');
    
    if (!hasAccess(request.user, foundBranch)) {
      return reply.forbidden('Access denied to branch outside your territory');
    }
    
    return reply.send(foundBranch as any);
  });

  fastify.put('/:id', { schema: UpdateBranchSchema }, async (request, reply) => {
    if (!['admin', 'system_admin'].includes(request.user.role)) {
      return reply.forbidden('Only admins can update branches');
    }

    const { manager: newManagerId } = request.body as any;

    const updateResult = await db.update(branch)
      .set(request.body as any)
      .where(eq(branch.id, request.params.id))
      .returning() as any;
    
    const updatedBranch = updateResult[0];
    if (!updatedBranch) return reply.notFound('Branch not found');

    // If a manager was assigned/changed, update the user's details
    if (newManagerId) {
      const { generateStructuredUserId } = await import('#/utils/id-generator.util.js');
      const newStructuredId = await generateStructuredUserId(request.params.id);
      
      await db.update(schema.user)
        .set({
          branchId: request.params.id,
          role: 'branch_manager',
          structuredId: newStructuredId,
        } as any)
        .where(eq(schema.user.id, newManagerId));
    }

    return reply.send(updatedBranch as any);
  });

  fastify.delete('/:id', async (request: any, reply) => {
    if (!['admin', 'system_admin'].includes(request.user.role)) {
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
