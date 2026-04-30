import { db, schema } from '@fastify-forge/db';
import { eq, sql } from 'drizzle-orm';
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
    const { limit = 10, offset = 0 } = request.query;

    const data = await db.select()
      .from(branchStats)
      .limit(limit)
      .offset(offset);

    const countResult = await db.select({ count: sql<number>`count(*)` }).from(branch);
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
};

export default branchRoutes;
