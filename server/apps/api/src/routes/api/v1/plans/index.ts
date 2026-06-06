import { db, schema } from '@fastify-forge/db';
import { eq, sql, and } from 'drizzle-orm';
import type { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox';
const { premiumRate } = schema;

import { 
  CreatePlanSchema, 
  ListPlanSchema, 
  UpdatePlanSchema 
} from '#/schemas/plan.schema.js';

const planRoutes: FastifyPluginAsyncTypebox = async (fastify) => {
  fastify.get('/stats', async (request, reply) => {
    const { lobId } = request.query as any;
    const conditions = [];
    if (lobId) conditions.push(eq(premiumRate.lobId, lobId));
    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const [stats] = await db.select({
      total: sql<number>`count(*)`,
      avgInpatient: sql<number>`avg(${premiumRate.inpatientLimit})`,
      avgOutpatient: sql<number>`avg(${premiumRate.outpatientLimit})`,
      avgMaternity: sql<number>`avg(${premiumRate.maternityLimit})`,
    }).from(premiumRate).where(whereClause);

    return reply.send({
      total: Number(stats?.total || 0),
      avgInpatient: Number(stats?.avgInpatient || 0),
      avgOutpatient: Number(stats?.avgOutpatient || 0),
      avgMaternity: Number(stats?.avgMaternity || 0),
    });
  });

  fastify.get('/', { schema: ListPlanSchema }, async (request, reply) => {
    const { 
      limit = 10, offset = 0, planName, lobId
    } = request.query;

    const filters = [];
    if (lobId) filters.push(eq(premiumRate.lobId, lobId));
    if (planName) filters.push(sql`${premiumRate.planName} ILIKE ${`%${planName}%`}`);

    const whereClause = filters.length > 0 ? and(...filters) : undefined;

    const data = await db.select().from(premiumRate).where(whereClause).limit(limit).offset(offset);
    const countResult = await db.select({ count: sql<number>`count(*)` }).from(premiumRate).where(whereClause);
    const count = countResult[0]?.count ?? 0;

    return reply.send({ data: data as any, total: Number(count) });
  });

  fastify.post('/', { schema: CreatePlanSchema }, async (request, reply) => {
    if (!['admin', 'system_admin'].includes(request.user.role) && request.user.role !== 'system_admin') {
      return reply.forbidden('Only admins can create plans');
    }

    const { generateStructuredPlanId } = await import('#/utils/id-generator.util.js');
    const id = await generateStructuredPlanId((request.body as any).planName);

    const insertResult = await db.insert(premiumRate).values({
      ...(request.body as any),
      id,
      lobId: (request.body as any).lobId || (request.user as any).lobIds?.[0],
    } as any).returning() as any;
    const newPlan = insertResult[0];
    return reply.code(201).send(newPlan as any);
  });

  fastify.get('/:id', async (request: any, reply) => {
    const [found] = await db.select().from(premiumRate).where(eq(premiumRate.id, request.params.id)).limit(1);
    if (!found) return reply.notFound('Plan not found');
    return reply.send(found as any);
  });

  fastify.put('/:id', { schema: UpdatePlanSchema }, async (request, reply) => {
    if (!['admin', 'system_admin'].includes(request.user.role) && request.user.role !== 'system_admin') {
      return reply.forbidden('Only admins can update plans');
    }

    const updateResult = await db.update(premiumRate)
      .set(request.body as any)
      .where(eq(premiumRate.id, request.params.id))
      .returning() as any;
    
    const updated = updateResult[0];
    
    if (!updated) return reply.notFound('Plan not found');
    return reply.send(updated as any);
  });

  fastify.delete('/:id', async (request: any, reply) => {
    if (!['admin', 'system_admin'].includes(request.user.role) && request.user.role !== 'system_admin') {
      return reply.forbidden('Only admins can delete plans');
    }

    const deleteResult = await db.delete(premiumRate)
      .where(eq(premiumRate.id, request.params.id))
      .returning() as any;
    
    if (deleteResult.length === 0) return reply.notFound('Plan not found');
    return reply.send({ message: 'Plan deleted successfully' });
  });
};

export default planRoutes;
