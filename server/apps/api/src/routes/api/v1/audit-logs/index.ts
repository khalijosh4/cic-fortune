import { db, schema } from '@fastify-forge/db';
import { eq, sql, and, desc, gte, lte, inArray } from 'drizzle-orm';
import type { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox';

const { auditLog } = schema;

import { 
  ListAuditLogSchema,
  GetAuditLogSchema
} from '#/schemas/audit-log.schema.js';


const auditLogRoutes: FastifyPluginAsyncTypebox = async (fastify) => {
  fastify.get('/stats', async (request, reply) => {
    const filters = [];
    if (['branch_manager', 'claims_officer', 'user'].includes(request.user.role) && request.user.branchId) {
      const [branchRecord] = await db.select().from(schema.branch).where(eq(schema.branch.id, request.user.branchId)).limit(1);
      if (branchRecord) filters.push(eq(auditLog.branchName, branchRecord.name));
    }
    const whereClause = filters.length > 0 ? and(...filters) : undefined;

    const [stats] = await db.select({
      total: sql<number>`count(*)`,
      success: sql<number>`count(*) filter (where ${auditLog.status} = 'success')`,
      error: sql<number>`count(*) filter (where ${auditLog.status} = 'error')`,
    }).from(auditLog).where(whereClause);

    const total = Number(stats?.total || 0);
    const success = Number(stats?.success || 0);
    const error = Number(stats?.error || 0);

    return reply.send({
      total,
      success,
      error,
      successRate: total > 0 ? Math.round((success / total) * 100) : 0,
    });
  });

  fastify.get('/', { schema: ListAuditLogSchema }, async (request, reply) => {
    const { 
      limit = 10, offset = 0, 
      module, 'module[]': modules,
      type, 'type[]': types,
      status, 'status[]': statuses,
      userRole, 'userRole[]': userRoles,
      startDate, endDate, 'timestampRange[]': timestampRange,
      action
    } = request.query;

    const filters = [];
    
    // TeBAC filtering for audit logs
    if (['branch_manager', 'claims_officer', 'user'].includes(request.user.role) && request.user.branchId) {
      const [branch] = await db.select().from(schema.branch).where(eq(schema.branch.id, request.user.branchId)).limit(1);
      if (branch) {
        filters.push(eq(auditLog.branchName, branch.name));
      }
    }

    if (module) filters.push(eq(auditLog.module, module));
    if (modules && modules.length > 0) {
      filters.push(inArray(auditLog.module, modules as any));
    }

    if (type) filters.push(eq(auditLog.type, type));
    if (types && types.length > 0) {
      filters.push(inArray(auditLog.type, types as any));
    }

    if (status) filters.push(eq(auditLog.status, status));
    if (statuses && statuses.length > 0) {
      filters.push(inArray(auditLog.status, statuses as any));
    }

    if (userRole) filters.push(eq(auditLog.userRole, userRole));
    if (userRoles && userRoles.length > 0) {
      filters.push(inArray(auditLog.userRole, userRoles as any));
    }

    if (timestampRange?.[0]) filters.push(gte(auditLog.timestamp, new Date(timestampRange[0])));
    if (timestampRange?.[1]) filters.push(lte(auditLog.timestamp, new Date(timestampRange[1])));
    if (startDate) filters.push(gte(auditLog.timestamp, new Date(startDate)));
    if (endDate) filters.push(lte(auditLog.timestamp, new Date(endDate)));

    if (action) filters.push(sql`${auditLog.action} ILIKE ${`%${action}%`}`);

    const whereClause = filters.length > 0 ? and(...filters) : undefined;

    const data = await db.select().from(auditLog).where(whereClause).orderBy(desc(auditLog.timestamp)).limit(limit).offset(offset);
    const countResult = await db.select({ count: sql<number>`count(*)` }).from(auditLog).where(whereClause);
    const count = countResult[0]?.count ?? 0;

    return reply.send({ data: data as any, total: Number(count) });
  });

  fastify.get('/:id', { schema: GetAuditLogSchema }, async (request, reply) => {
    const [found] = await db.select().from(auditLog).where(eq(auditLog.id, request.params.id)).limit(1);
    if (!found) return reply.notFound('Audit log entry not found');

    // TeBAC check for detail view
    if (['branch_manager', 'claims_officer', 'user'].includes(request.user.role) && request.user.branchId) {
      const [branch] = await db.select().from(schema.branch).where(eq(schema.branch.id, request.user.branchId)).limit(1);
      if (branch && found.branchName !== branch.name) {
        return reply.forbidden('Access denied to audit log outside your territory');
      }
    }

    return reply.send(found as any);
  });

  fastify.post('/', async (request, reply) => {
    const { 
      module, 
      type, 
      action, 
      entityId, 
      entityType, 
      details, 
      status
    } = request.body as any;
    const newLog = await db.insert(auditLog).values({
      module,
      type,
      action,
      entityId,
      entityType,
      details,
      status,
      userEmail: request.user.email,
      userRole: request.user.role,
      branchName: request.user.branchName,
      timestamp: new Date(),
    }).returning();
    return reply.code(201).send(newLog[0] as any);
  });
};

export default auditLogRoutes;
