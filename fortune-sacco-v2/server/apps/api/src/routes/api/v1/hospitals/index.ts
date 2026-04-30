import { db, schema } from '@fastify-forge/db';
import { eq, sql } from 'drizzle-orm';
import type { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox';
const { hospital } = schema;

import { 
  CreateHospitalSchema, 
  ListHospitalSchema, 
  UpdateHospitalSchema 
} from '#/schemas/hospital.schema.js';

const hospitalRoutes: FastifyPluginAsyncTypebox = async (fastify) => {
  fastify.get('/', { schema: ListHospitalSchema }, async (request, reply) => {
    const { limit = 10, offset = 0 } = request.query;

    const data = await db.select().from(hospital).limit(limit).offset(offset);
    const countResult = await db.select({ count: sql<number>`count(*)` }).from(hospital);
    const count = countResult[0]?.count ?? 0;

    return reply.send({ data: data as any, total: Number(count) });
  });

  fastify.post('/', { schema: CreateHospitalSchema }, async (request, reply) => {
    if (request.user.role !== 'admin') {
      return reply.forbidden('Only admins can add hospitals');
    }

    const insertResult = await db.insert(hospital).values(request.body as any).returning() as any;
    const newHospital = insertResult[0];
    return reply.code(201).send(newHospital as any);
  });

  fastify.get('/:id', async (request: any, reply) => {
    const [found] = await db.select().from(hospital).where(eq(hospital.id, request.params.id)).limit(1);
    if (!found) return reply.notFound('Hospital not found');
    return reply.send(found as any);
  });

  fastify.put('/:id', { schema: UpdateHospitalSchema }, async (request, reply) => {
    if (request.user.role !== 'admin') {
      return reply.forbidden('Only admins can update hospitals');
    }

    const updateResult = await db.update(hospital)
      .set(request.body as any)
      .where(eq(hospital.id, request.params.id))
      .returning() as any;
    
    const updated = updateResult[0];
    
    if (!updated) return reply.notFound('Hospital not found');
    return reply.send(updated as any);
  });
};

export default hospitalRoutes;
