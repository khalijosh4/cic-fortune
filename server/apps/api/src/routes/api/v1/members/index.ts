import { db, schema } from '@fastify-forge/db';
import { eq, sql, and, getTableColumns, inArray } from 'drizzle-orm';
import type { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox';
import { Type } from '@sinclair/typebox';
const { member } = schema;

import { 
  CreateMemberSchema, 
  ListMemberSchema, 
  UpdateMemberSchema 
} from '#/schemas/member.schema.js';
import { getTerritoryFilters, hasAccess } from '#/utils/tebac.util.js';
import { sendEnrollmentEmail, sendEnrollmentSms } from '#/utils/notification.util.js';

const memberRoutes: FastifyPluginAsyncTypebox = async (fastify) => {
  fastify.get('/', { schema: ListMemberSchema }, async (request, reply) => {
    const { 
      limit = 10, offset = 0, branchId, policyId, 
      coverType, 'coverType[]': coverTypes,
      minPremiumRate, maxPremiumRate, 'premiumRange[]': premiumRange,
      status, 'status[]': statuses,
      name, branchName
    } = request.query;

    const filters = getTerritoryFilters(request.user, member);
    if (branchId) {
      filters.push(eq(member.branchId, branchId));
    }
    
    if (policyId) filters.push(eq(member.policyId, policyId));
    
    if (coverType) filters.push(eq(member.coverType, coverType as any));
    if (coverTypes && coverTypes.length > 0) {
      filters.push(inArray(member.coverType, coverTypes as any));
    }

    if (status) filters.push(eq(member.status, status as any));
    if (statuses && statuses.length > 0) {
      filters.push(inArray(member.status, statuses as any));
    }

    if (premiumRange?.[0] !== undefined) filters.push(sql`${member.premiumRate} >= ${premiumRange[0]}`);
    if (premiumRange?.[1] !== undefined) filters.push(sql`${member.premiumRate} <= ${premiumRange[1]}`);
    if (minPremiumRate) filters.push(sql`${member.premiumRate} >= ${minPremiumRate}`);
    if (maxPremiumRate) filters.push(sql`${member.premiumRate} <= ${maxPremiumRate}`);
    
    if (name) {
      filters.push(sql`(${member.firstName} || ' ' || ${member.lastName}) ILIKE ${`%${name}%`}`);
    }
    if (branchName) {
      filters.push(sql`${schema.branch.name} ILIKE ${`%${branchName}%`}`);
    }

    const whereClause = filters.length > 0 ? and(...filters) : undefined;

    const data = await db.select({
      ...getTableColumns(member),
      branchName: schema.branch.name,
    })
    .from(member)
    .leftJoin(schema.branch, eq(member.branchId, schema.branch.id))
    .where(whereClause)
    .limit(limit)
    .offset(offset);

    const countResult = await db.select({ count: sql<number>`count(*)` })
      .from(member)
      .where(whereClause);
    const count = countResult[0]?.count ?? 0;

    return reply.send({ data: data as any, total: Number(count) });
  });

  fastify.put('/bulk-status', {
    schema: {
      body: Type.Object({
        ids: Type.Array(Type.String()),
        status: Type.String(),
      }),
    }
  }, async (request, reply) => {
    const { ids, status: newStatus } = request.body;
    
    await db.update(member)
      .set({ status: newStatus } as any)
      .where(sql`${member.id} IN ${ids}`);
    
    return reply.send({ message: 'Bulk status update successful' });
  });

  fastify.post('/', { schema: CreateMemberSchema }, async (request, reply) => {
    const userRole = (request as any).user.role;
    if (!['admin', 'system_admin', 'branch_manager', 'claims_officer'].includes(userRole)) {
      return reply.code(403).send({ error: 'Forbidden' } as any);
    }

    const payload: any = { ...request.body };

    if (!payload.email && !payload.phoneNumber) {
      return reply.code(400).send({ error: 'Bad Request', message: 'An email address or phone number is required' } as any);
    }

    // TeBAC: force branch assignment for branch staff
    if (['branch_manager', 'claims_officer'].includes(userRole)) {
      payload.branchId = (request as any).user.branchId;
    }

    // Premium Calculation
    const [rates] = await db.select().from(schema.premiumRate).limit(1);
    if (!rates) return reply.code(500).send({ error: 'Premium rates not configured' } as any);
    
    const dCount = payload.dependentsCount || 0;
    let premiumRate = Number(rates.m0);
    if (dCount === 1) premiumRate = Number(rates.m1);
    else if (dCount === 2) premiumRate = Number(rates.m2);
    else if (dCount === 3) premiumRate = Number(rates.m3);
    else if (dCount === 4) premiumRate = Number(rates.m4);
    else if (dCount === 5) premiumRate = Number(rates.m5);
    else if (dCount >= 6) premiumRate = Number(rates.m6) + ((dCount - 6) * Number(rates.extra));

    payload.premiumRate = premiumRate.toString();

    const insertResult = await db.insert(member).values({
      ...payload,
      usedAnnualLimit: '0',
      usedOutpatientLimit: '0',
      usedInpatientLimit: '0',
      usedMaternityLimit: '0',
    } as any).returning() as any;
    const newMember = insertResult[0];

    // Fetch branch and policy names for the notification
    let branchName = 'Unknown Branch';
    let policyName = 'Insurance Policy';

    if (newMember.branchId) {
      const [branchRecord] = await db.select({ name: schema.branch.name }).from(schema.branch).where(eq(schema.branch.id, newMember.branchId)).limit(1);
      if (branchRecord) branchName = branchRecord.name;
    }

    if (newMember.policyId) {
      const [policyRecord] = await db.select({ name: schema.policy.name }).from(schema.policy).where(eq(schema.policy.id, newMember.policyId)).limit(1);
      if (policyRecord) policyName = policyRecord.name;
    }

    const memberDetails = {
      ...newMember,
      branchName,
      policyName
    };

    // Send notifications asynchronously (don't block the response)
    if (newMember.email && fastify.config.MAILERSEND_API_TOKEN) {
      sendEnrollmentEmail(newMember.email, memberDetails, fastify.config.MAILERSEND_API_TOKEN).catch((err: any) => {
        fastify.log.error({ err, email: newMember.email }, 'Failed to send enrollment email');
      });
    }

    if (newMember.phoneNumber && fastify.config.TWILIO_ACCOUNT_SID && fastify.config.TWILIO_AUTH_TOKEN && fastify.config.TWILIO_PHONE_NUMBER) {
      sendEnrollmentSms(newMember.phoneNumber, memberDetails, fastify.config.TWILIO_ACCOUNT_SID, fastify.config.TWILIO_AUTH_TOKEN, fastify.config.TWILIO_PHONE_NUMBER).catch((err: any) => {
        fastify.log.error({ err, phone: newMember.phoneNumber }, 'Failed to send enrollment SMS');
      });
    }

    return reply.code(201).send(newMember as any);
  });

  fastify.get('/:id', async (request: any, reply) => {
    const [found] = await db.select().from(member).where(eq(member.id, request.params.id)).limit(1);
    if (!found) return reply.notFound('Member not found');
    
    if (!hasAccess(request.user, found)) {
      return reply.forbidden('Access denied to member outside your territory');
    }
    
    return reply.send(found as any);
  });

  fastify.put('/:id', { schema: UpdateMemberSchema }, async (request, reply) => {
    const userRole = (request as any).user.role;

    const [existing] = await db.select().from(member).where(eq(member.id, request.params.id)).limit(1);
    if (!existing) return reply.notFound('Member not found');

    if (!hasAccess(request.user, existing)) {
      return reply.forbidden('Cannot edit member outside your territory');
    }

    const updateData: any = { ...request.body };

    // Field-level Security
    if (userRole === 'claims_officer') {
      delete updateData.dependentsCount;
      delete updateData.coverType;
    }

    // Recalculate Premium if dependents count changed
    if (updateData.dependentsCount !== undefined && updateData.dependentsCount !== existing.dependentsCount) {
      const [rates] = await db.select().from(schema.premiumRate).limit(1);
      if (rates) {
        const dCount = updateData.dependentsCount;
        let premiumRate = Number(rates.m0);
        if (dCount === 1) premiumRate = Number(rates.m1);
        else if (dCount === 2) premiumRate = Number(rates.m2);
        else if (dCount === 3) premiumRate = Number(rates.m3);
        else if (dCount === 4) premiumRate = Number(rates.m4);
        else if (dCount === 5) premiumRate = Number(rates.m5);
        else if (dCount >= 6) premiumRate = Number(rates.m6) + ((dCount - 6) * Number(rates.extra));
        updateData.premiumRate = premiumRate.toString();
      }
    }

    const updateResult = await db.update(member)
      .set(updateData as any)
      .where(eq(member.id, request.params.id))
      .returning() as any;
    
    const updated = updateResult[0];
    return reply.send(updated as any);
  });

  fastify.post('/:id/resend-notification', async (request: any, reply) => {
    const [found] = await db.select().from(member).where(eq(member.id, request.params.id)).limit(1);
    if (!found) return reply.notFound('Member not found');
    
    if (!hasAccess(request.user, found)) {
      return reply.forbidden('Access denied to member outside your territory');
    }

    // Fetch branch and policy names
    let branchName = 'Unknown Branch';
    let policyName = 'Insurance Policy';

    if (found.branchId) {
      const [branchRecord] = await db.select({ name: schema.branch.name }).from(schema.branch).where(eq(schema.branch.id, found.branchId)).limit(1);
      if (branchRecord) branchName = branchRecord.name;
    }

    if (found.policyId) {
      const [policyRecord] = await db.select({ name: schema.policy.name }).from(schema.policy).where(eq(schema.policy.id, found.policyId)).limit(1);
      if (policyRecord) policyName = policyRecord.name;
    }

    const memberDetails = {
      ...found,
      branchName,
      policyName
    };

    let emailPromise: Promise<any> = Promise.resolve();
    let smsPromise: Promise<any> = Promise.resolve();

    if (found.email && fastify.config.MAILERSEND_API_TOKEN) {
      emailPromise = sendEnrollmentEmail(found.email, memberDetails, fastify.config.MAILERSEND_API_TOKEN);
    }

    if (found.phoneNumber && fastify.config.TWILIO_ACCOUNT_SID && fastify.config.TWILIO_AUTH_TOKEN && fastify.config.TWILIO_PHONE_NUMBER) {
      smsPromise = sendEnrollmentSms(found.phoneNumber, memberDetails, fastify.config.TWILIO_ACCOUNT_SID, fastify.config.TWILIO_AUTH_TOKEN, fastify.config.TWILIO_PHONE_NUMBER);
    }

    try {
      await Promise.all([emailPromise, smsPromise]);
      return reply.send({ message: 'Notifications resent successfully' });
    } catch (err: any) {
      fastify.log.error({ err, memberId: found.id }, 'Failed to resend notifications');
      return reply.code(500).send({ 
        error: 'Failed to resend notifications', 
        message: err.message || 'An error occurred while sending notifications' 
      });
    }
  });

  fastify.delete('/:id', async (request: any, reply) => {
    const [existing] = await db.select().from(member).where(eq(member.id, request.params.id)).limit(1);
    if (!existing) return reply.notFound('Member not found');

    if (!hasAccess(request.user, existing)) {
      return reply.forbidden('Access denied to member outside your territory');
    }

    if (!['admin', 'system_admin'].includes(request.user.role)) {
      return reply.forbidden('Only admins can delete members');
    }

    const deleteResult = await db.delete(member)
      .where(eq(member.id, request.params.id))
      .returning() as any;
    
    if (deleteResult.length === 0) return reply.notFound('Member not found');
    return reply.send({ message: 'Member deleted successfully' });
  });
};

export default memberRoutes;
