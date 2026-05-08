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

      // 1.5 Get raw data for charts
      const allClaims = await db.select({ 
        amountClaimed: schema.claim.amountClaimed, 
        createdAt: schema.claim.createdAt 
      }).from(schema.claim);

      const allPremiums = await db.select({ 
        amountPaid: schema.premium.amountPaid, 
        createdAt: schema.premium.dueDate 
      }).from(schema.premium);

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
        })),
        chartData: generateChartData(allClaims, allPremiums)
      };
    } catch (err) {
      app.log.error(err);
      throw err;
    }
  });
};

function generateChartData(claims: any[], premiums: any[]) {
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const now = new Date();
  const result = [];
  
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthName = months[d.getMonth()];
    
    const monthClaims = claims
      .filter(c => c.createdAt && new Date(c.createdAt).getMonth() === d.getMonth() && new Date(c.createdAt).getFullYear() === d.getFullYear())
      .reduce((sum, c) => sum + Number(c.amountClaimed || 0), 0);
      
    const monthPremiums = premiums
      .filter(p => p.createdAt && new Date(p.createdAt).getMonth() === d.getMonth() && new Date(p.createdAt).getFullYear() === d.getFullYear())
      .reduce((sum, p) => sum + Number(p.amountPaid || 0), 0);
      
    result.push({ month: monthName, claims: monthClaims, premiums: monthPremiums });
  }
  return result;
}

export default dashboardRoute;
