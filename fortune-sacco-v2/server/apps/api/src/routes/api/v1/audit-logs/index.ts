import { db, schema } from '@fastify-forge/db';
import { eq, sql, and, desc, gte, lte } from 'drizzle-orm';
import type { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox';

const { auditLog } = schema;

import { 
  ListAuditLogSchema,
  GetAuditLogSchema
} from '#/schemas/audit-log.schema.js';

const auditLogRoutes: FastifyPluginAsyncTypebox = async (fastify) => {
  fastify.get('/', { schema: ListAuditLogSchema }, async (request, reply) => {
    const { limit = 10, offset = 0, module, type, status, userRole, startDate, endDate } = request.query;

    const filters = [];
    if (module) filters.push(eq(auditLog.module, module));
    if (type) filters.push(eq(auditLog.type, type));
    if (status) filters.push(eq(auditLog.status, status));
    if (userRole) filters.push(eq(auditLog.userRole, userRole));
    if (startDate) filters.push(gte(auditLog.timestamp, new Date(startDate)));
    if (endDate) filters.push(lte(auditLog.timestamp, new Date(endDate)));

    const whereClause = filters.length > 0 ? and(...filters) : undefined;

    const data = await db.select().from(auditLog).where(whereClause).orderBy(desc(auditLog.timestamp)).limit(limit).offset(offset);
    const countResult = await db.select({ count: sql<number>`count(*)` }).from(auditLog).where(whereClause);
    const count = countResult[0]?.count ?? 0;

    return reply.send({ data: data as any, total: Number(count) });
  });

  fastify.get('/:id', { schema: GetAuditLogSchema }, async (request, reply) => {
    const [found] = await db.select().from(auditLog).where(eq(auditLog.id, request.params.id)).limit(1);
    if (!found) return reply.notFound('Audit log entry not found');
    return reply.send(found as any);
  });
};

export default auditLogRoutes;
