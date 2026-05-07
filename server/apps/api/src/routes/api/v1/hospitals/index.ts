import { db, schema } from '@fastify-forge/db';
import { eq, sql, and, inArray } from 'drizzle-orm';
import type { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox';
const { hospital } = schema;

import { 
  CreateHospitalSchema, 
  ListHospitalSchema, 
  UpdateHospitalSchema 
} from '#/schemas/hospital.schema.js';
import { getTerritoryFilters, hasAccess } from '#/utils/tebac.util.js';

const hospitalRoutes: FastifyPluginAsyncTypebox = async (fastify) => {
  fastify.get('/', { schema: ListHospitalSchema }, async (request, reply) => {
    const { limit = 10, offset = 0, location, name, 'type[]': types, minClaimLimit, maxClaimLimit, 'claimLimitRange[]': claimLimitRange } = request.query;

    const filters = getTerritoryFilters(request.user, hospital);
    if (location) filters.push(sql`${hospital.location} ILIKE ${`%${location}%`}`);
    if (name) filters.push(sql`${hospital.name} ILIKE ${`%${name}%`}`);
    if (types && types.length > 0) {
      filters.push(inArray(hospital.type, types as any));
    }
    
    if (claimLimitRange?.[0] !== undefined) filters.push(sql`${hospital.claimLimit} >= ${claimLimitRange[0]}`);
    if (claimLimitRange?.[1] !== undefined) filters.push(sql`${hospital.claimLimit} <= ${claimLimitRange[1]}`);
    if (minClaimLimit) filters.push(sql`${hospital.claimLimit} >= ${minClaimLimit}`);
    if (maxClaimLimit) filters.push(sql`${hospital.claimLimit} <= ${maxClaimLimit}`);

    const whereClause = filters.length > 0 ? and(...filters) : undefined;

    const data = await db.select().from(hospital).where(whereClause).limit(limit).offset(offset);
    const countResult = await db.select({ count: sql<number>`count(*)` }).from(hospital).where(whereClause);
    const count = countResult[0]?.count ?? 0;

    return reply.send({ data: data as any, total: Number(count) });
  });

  fastify.post('/', { schema: CreateHospitalSchema }, async (request, reply) => {
    if (!['admin', 'system_admin'].includes(request.user.role)) {
      return reply.forbidden('Only admins can add hospitals');
    }

    const insertResult = await db.insert(hospital).values(request.body as any).returning() as any;
    const newHospital = insertResult[0];
    return reply.code(201).send(newHospital as any);
  });

  fastify.get('/:id', async (request: any, reply) => {
    const [found] = await db.select().from(hospital).where(eq(hospital.id, request.params.id)).limit(1);
    if (!found) return reply.notFound('Hospital not found');
    
    if (!hasAccess(request.user, found)) {
      return reply.forbidden('Access denied to hospital outside your territory');
    }
    
    return reply.send(found as any);
  });

  fastify.put('/:id', { schema: UpdateHospitalSchema }, async (request, reply) => {
    if (!['admin', 'system_admin'].includes(request.user.role)) {
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

  fastify.delete('/:id', async (request: any, reply) => {
    if (!['admin', 'system_admin'].includes(request.user.role)) {
      return reply.forbidden('Only admins can delete hospitals');
    }

    const deleteResult = await db.delete(hospital)
      .where(eq(hospital.id, request.params.id))
      .returning() as any;
    
    if (deleteResult.length === 0) return reply.notFound('Hospital not found');
    return reply.send({ message: 'Hospital deleted successfully' });
  });
};

export default hospitalRoutes;
