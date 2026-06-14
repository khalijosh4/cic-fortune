import { db, schema } from '@fastify-forge/db';
import { eq, inArray, sql } from 'drizzle-orm';

import {
  CreateLineOfBusinessSchema,
  UpdateLineOfBusinessSchema,
  ListLineOfBusinessSchema,
  GetLineOfBusinessSchema,
  CreateUserLobSchema,
  UserLobListSchema,
} from '#/schemas/line-of-business.schema.js';

import type { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox';

const { lineOfBusiness, userLob, member, claim } = schema;

function isGlobalRole(role: string): boolean {
  return ['admin', 'system_admin', 'ceo', 'hr'].includes(role);
}

function generateCode(name: string): string {
  return name.toUpperCase().replace(/[^A-Z0-9]+/g, '-').replace(/^-|-$/g, '');
}

const lineOfBusinessRoutes: FastifyPluginAsyncTypebox = async (fastify) => {
  // Get user's associated LOBs
  fastify.get('/my', { schema: UserLobListSchema }, async (request, reply) => {
    const reqUser = request.user as any;

    if (isGlobalRole(reqUser.role)) {
      const data = await db.select().from(lineOfBusiness).orderBy(lineOfBusiness.createdAt);
      return reply.send({ data: data as any });
    }

    const userLobs = await db.select({ lobId: userLob.lobId })
      .from(userLob)
      .where(eq(userLob.userId, reqUser.id));

    if (userLobs.length === 0) {
      return reply.send({ data: [] });
    }

    const lobIds = userLobs.map(l => l.lobId);
    const data = await db.select().from(lineOfBusiness)
      .where(inArray(lineOfBusiness.id, lobIds))
      .orderBy(lineOfBusiness.createdAt);

    return reply.send({ data: data as any });
  });

  // Get LOB summaries (elevated users with lobs.summary permission)
  fastify.get('/summary', async (request, reply) => {
    const reqUser = request.user as any;
    if (!reqUser.permissions?.includes('lobs.summary') && !isGlobalRole(reqUser.role)) {
      return reply.forbidden('You do not have permission to view LOB summaries');
    }

    const lobs = await db.select().from(lineOfBusiness).where(eq(lineOfBusiness.isActive, true));

    const summaries = await Promise.all(lobs.map(async (lob) => {
      const memberCount = await db.select({ count: sql<number>`count(*)` })
        .from(member)
        .where(eq(member.lobId, lob.id));

      const claimCount = await db.select({ count: sql<number>`count(*)` })
        .from(claim)
        .where(eq(claim.lobId, lob.id));

      return {
        id: lob.id,
        name: lob.name,
        code: lob.code,
        icon: lob.icon,
        memberCount: Number(memberCount[0]?.count || 0),
        claimCount: Number(claimCount[0]?.count || 0),
      };
    }));

    return reply.send({ data: summaries });
  });

  // List all LOBs (admin/super users)
  fastify.get('/', { schema: ListLineOfBusinessSchema }, async (request, reply) => {
    const data = await db.select().from(lineOfBusiness).orderBy(lineOfBusiness.createdAt);
    const countResult = await db.select({ count: sql<number>`count(*)` }).from(lineOfBusiness);
    return reply.send({ data: data as any, total: Number(countResult[0]?.count || 0) });
  });

  // Get single LOB
  fastify.get('/:id', { schema: GetLineOfBusinessSchema }, async (request, reply) => {
    const params = request.params as { id: string };
    const [found] = await db.select().from(lineOfBusiness).where(eq(lineOfBusiness.id, params.id)).limit(1);
    if (!found) return reply.notFound('Line of business not found');
    return reply.send(found as any);
  });

  // Create LOB
  fastify.post('/', { schema: CreateLineOfBusinessSchema }, async (request, reply) => {
    const reqUser = request.user as any;
    if (!reqUser.permissions?.includes('lobs.create')) {
      return reply.forbidden('You do not have permission to create lines of business');
    }

    const { name, description, icon } = request.body;
    const code = generateCode(name);
    const id = `LOB-${code}`;

    const [inserted] = await db.insert(lineOfBusiness).values({
      id,
      name,
      code,
      description: description || null,
      icon: icon || null,
      config: { enabledModules: [] },
    } as any).returning() as any;

    return reply.code(201).send(inserted as any);
  });

  // Update LOB
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

  // Delete LOB
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

  // Update user-LOB associations
  fastify.put('/user/:userId', { schema: CreateUserLobSchema }, async (request, reply) => {
    const reqUser = request.user as any;
    if (!reqUser.permissions?.includes('users.update') && !isGlobalRole(reqUser.role)) {
      return reply.forbidden('You do not have permission to manage user LOB assignments');
    }

    const { userId } = request.params;
    const { lobIds } = request.body;

    // Validate all LOB IDs exist
    if (lobIds.length > 0) {
      const existing = await db.select({ id: lineOfBusiness.id })
        .from(lineOfBusiness)
        .where(inArray(lineOfBusiness.id, lobIds));
      if (existing.length !== lobIds.length) {
        return reply.badRequest('One or more LOB IDs are invalid');
      }
    }

    // Replace all user LOB associations
    await db.delete(userLob).where(eq(userLob.userId, userId));

    if (lobIds.length > 0) {
      await db.insert(userLob).values(
        lobIds.map((lobId: string) => ({ userId, lobId }))
      );
    }

    return reply.send({ message: 'User LOB associations updated', lobIds });
  });
};

export default lineOfBusinessRoutes;
