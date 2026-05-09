import { db, schema } from '@fastify-forge/db';
import { eq } from 'drizzle-orm';
import type { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox';
import { ListPermissionSchema } from '#/schemas/permission.schema.js';

const permissionRoutes: FastifyPluginAsyncTypebox = async (fastify) => {
  fastify.get('/', { schema: ListPermissionSchema }, async (request, reply) => {
    const data = await db.select().from(schema.permission).orderBy(schema.permission.resource, schema.permission.action);
    return reply.send({ data });
  });

  fastify.get('/user/:userId', async (request: any, reply) => {
    const { userId } = request.params;
    const perms = await db.select({ permissionId: schema.userPermission.permissionId })
      .from(schema.userPermission)
      .where(eq(schema.userPermission.userId, userId));
    return reply.send(perms.map(p => p.permissionId));
  });

  fastify.put('/user/:userId', async (request: any, reply) => {
    const { userId } = request.params;
    const { permissionIds } = request.body as { permissionIds: string[] };

    await db.delete(schema.userPermission).where(eq(schema.userPermission.userId, userId));
    if (permissionIds.length > 0) {
      await db.insert(schema.userPermission).values(
        permissionIds.map(permissionId => ({ userId, permissionId }))
      );
    }

    return reply.send({ message: 'Permissions updated' });
  });
};

export default permissionRoutes;
