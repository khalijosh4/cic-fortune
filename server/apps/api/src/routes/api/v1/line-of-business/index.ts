import { db, schema } from '@fastify-forge/db';
import { eq } from 'drizzle-orm';
import type { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox';

import {
  CreateLineOfBusinessSchema,
  UpdateLineOfBusinessSchema,
  ListLineOfBusinessSchema,
  GetLineOfBusinessSchema,
} from '#/schemas/line-of-business.schema.js';

const { lineOfBusiness } = schema;

const lineOfBusinessRoutes: FastifyPluginAsyncTypebox = async (fastify) => {
  fastify.get('/', { schema: ListLineOfBusinessSchema }, async (request, reply) => {
    const data = await db.select().from(lineOfBusiness).orderBy(lineOfBusiness.createdAt);
    const countResult = await db.select({ count: lineOfBusiness.id }).from(lineOfBusiness);
    return reply.send({ data: data as any, total: countResult.length });
  });

  fastify.get('/:id', { schema: GetLineOfBusinessSchema }, async (request, reply) => {
    const params = request.params as { id: string };
    const [found] = await db.select().from(lineOfBusiness).where(eq(lineOfBusiness.id, params.id)).limit(1);
    if (!found) return reply.notFound('Line of business not found');
    return reply.send(found as any);
  });

  fastify.post('/', { schema: CreateLineOfBusinessSchema }, async (request, reply) => {
    const reqUser = request.user as any;
    if (!reqUser.permissions?.includes('lobs.create')) {
      return reply.forbidden('You do not have permission to create lines of business');
    }

    const { name, code, description, icon } = request.body;
    const id = `LOB-${code.toUpperCase().replace(/\s+/g, '-')}`;

    const [inserted] = await db.insert(lineOfBusiness).values({
      id,
      name,
      code,
      description: description || null,
      icon: icon || null,
    } as any).returning() as any;

    return reply.code(201).send(inserted as any);
  });

  fastify.put('/:id', { schema: UpdateLineOfBusinessSchema }, async (request, reply) => {
    const reqUser = request.user as any;
    if (!reqUser.permissions?.includes('lobs.update')) {
      return reply.forbidden('You do not have permission to update lines of business');
    }

    const params = request.params as { id: string };
    const [existing] = await db.select().from(lineOfBusiness).where(eq(lineOfBusiness.id, params.id)).limit(1);
    if (!existing) return reply.notFound('Line of business not found');

    const updates: any = { ...request.body };
    const [updated] = await db.update(lineOfBusiness)
      .set(updates)
      .where(eq(lineOfBusiness.id, params.id))
      .returning() as any;

    return reply.send(updated as any);
  });

  fastify.delete('/:id', async (request, reply) => {
    const reqUser = request.user as any;
    if (!reqUser.permissions?.includes('lobs.delete')) {
      return reply.forbidden('You do not have permission to delete lines of business');
    }

    const params = request.params as { id: string };
    const [deleted] = await db.delete(lineOfBusiness)
      .where(eq(lineOfBusiness.id, params.id))
      .returning() as any;

    if (!deleted) return reply.notFound('Line of business not found');
    return reply.send({ message: 'Line of business deleted successfully' });
  });
};

export default lineOfBusinessRoutes;
