import type { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox';
import { db, schema } from '@fastify-forge/db';
import { sql, eq, desc } from 'drizzle-orm';
import { DashboardResponseSchema } from '#/schemas/dashboard.schema.js';

const dashboardRoute: FastifyPluginAsyncTypebox = async (app) => {
  app.get('/', {
    schema: {
      tags: ['Dashboard'],
      ...DashboardResponseSchema
    }
  }, async () => {
    try {
      // 1. Get Stats
      const [premiumSum] = await db
        .select({ value: sql<number>`sum(${schema.premium.amountPaid})` })
        .from(schema.premium);
      
      const [activeMembersCount] = await db
        .select({ value: sql<number>`count(*)` })
        .from(schema.member)
        .where(eq(schema.member.status, 'active'));

      const [approvedClaimsCount] = await db
        .select({ value: sql<number>`count(*)` })
        .from(schema.claim)
        .where(eq(schema.claim.status, 'approved'));

      const [pendingClaimsCount] = await db
        .select({ value: sql<number>`count(*)` })
        .from(schema.claim)
        .where(eq(schema.claim.status, 'pending'));

      // 2. Get Recent Claims
      const recent = await db
        .select({
          id: schema.claim.id,
          amount: schema.claim.amountClaimed,
          status: schema.claim.status,
          diagnosis: schema.claim.diagnosis,
          firstName: schema.member.firstName,
          lastName: schema.member.lastName,
        })
        .from(schema.claim)
        .leftJoin(schema.member, eq(schema.claim.memberId, schema.member.id))
        .orderBy(desc(schema.claim.createdAt))
        .limit(5);

      return {
        stats: {
          totalPremiums: Number(premiumSum?.value || 0),
          activeMembers: Number(activeMembersCount?.value || 0),
          approvedClaims: Number(approvedClaimsCount?.value || 0),
          pendingClaims: Number(pendingClaimsCount?.value || 0),
          premiumsTrend: 20.1,
          membersTrend: 12.5,
          claimsTrend: 19.0,
          pendingTrend: 5.0
        },
        recentClaims: recent.map(r => ({
          id: r.id,
          member: `${r.firstName ?? 'Unknown'} ${r.lastName ?? 'Member'}`,
          email: 'member@email.com',
          amount: Number(r.amount),
          status: r.status ?? 'unknown',
          diagnosis: r.diagnosis ?? 'N/A'
        }))
      };
    } catch (err) {
      app.log.error(err);
      throw err;
    }
  });
};

export default dashboardRoute;
