import type { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox';
import { db, schema } from '@fastify-forge/db';
import { sql, eq, desc, and } from 'drizzle-orm';
import { DashboardResponseSchema, BranchDashboardResponseSchema, HospitalDashboardResponseSchema } from '#/schemas/dashboard.schema.js';
import { getTerritoryFilters } from '#/utils/tebac.util.js';

const dashboardRoute: FastifyPluginAsyncTypebox = async (app) => {
  app.get('/', {
    schema: {
      tags: ['Dashboard'],
      ...DashboardResponseSchema
    }
  }, async (request) => {
    try {
      const filters = getTerritoryFilters(request.user, schema);
      const { lobId } = request.query as any;
      if (lobId) {
        filters.push(sql`${schema.member.lobId} = ${lobId}`);
      }

      const premiumConditions = filters.length > 0
        ? and(...filters.map(f => sql`${schema.premium.memberId} IN (SELECT id FROM ${schema.member} WHERE ${f})`))
        : undefined;

      const [premiumSum] = premiumConditions
        ? await db
            .select({ value: sql<number>`coalesce(sum(${schema.premium.amountPaid}), 0)` })
            .from(schema.premium)
            .where(premiumConditions)
        : await db
            .select({ value: sql<number>`coalesce(sum(${schema.premium.amountPaid}), 0)` })
            .from(schema.premium);

      const memberFilters = filters.length > 0 ? and(...filters) : undefined;

      const [activeMembersCount] = await db
        .select({ value: sql<number>`count(*)` })
        .from(schema.member)
        .where(memberFilters ? and(eq(schema.member.status, 'active'), memberFilters) : eq(schema.member.status, 'active'));

      const [approvedClaimsCount] = await db
        .select({ value: sql<number>`count(*)` })
        .from(schema.claim)
        .where(memberFilters
          ? and(eq(schema.claim.status, 'approved'), ...filters.map(f => sql`${schema.claim.memberId} IN (SELECT id FROM ${schema.member} WHERE ${f})`))
          : eq(schema.claim.status, 'approved'));

      const [pendingClaimsCount] = await db
        .select({ value: sql<number>`count(*)` })
        .from(schema.claim)
        .where(memberFilters
          ? and(eq(schema.claim.status, 'pending'), ...filters.map(f => sql`${schema.claim.memberId} IN (SELECT id FROM ${schema.member} WHERE ${f})`))
          : eq(schema.claim.status, 'pending'));

      const claimJoin = memberFilters
        ? and(...filters.map(f => sql`${schema.claim.memberId} IN (SELECT id FROM ${schema.member} WHERE ${f})`))
        : undefined;

      const allClaims = await db.select({
        amountClaimed: schema.claim.amountClaimed,
        createdAt: schema.claim.createdAt
      }).from(schema.claim)
        .where(claimJoin ?? undefined);

      const allPremiums = premiumConditions
        ? await db.select({
            amountPaid: schema.premium.amountPaid,
            createdAt: schema.premium.dueDate
          }).from(schema.premium).where(premiumConditions)
        : await db.select({
            amountPaid: schema.premium.amountPaid,
            createdAt: schema.premium.dueDate
          }).from(schema.premium);

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
        .where(claimJoin ?? undefined)
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

  app.get('/branch', {
    schema: {
      tags: ['Dashboard'],
      ...BranchDashboardResponseSchema
    }
  }, async (request) => {
    try {
      const branchId = request.user.branchId;
      if (!branchId) {
        throw app.httpErrors.forbidden('No branch assigned to your account');
      }

      const [branchInfo] = await db
        .select({
          name: schema.branch.name,
          location: schema.branch.location,
        })
        .from(schema.branch)
        .where(eq(schema.branch.id, branchId))
        .limit(1);

      if (!branchInfo) {
        throw app.httpErrors.notFound('Branch not found');
      }

      const [memberCounts] = await db
        .select({
          total: sql<number>`count(*)`,
          active: sql<number>`sum(case when ${schema.member.status} = 'active' then 1 else 0 end)`,
        })
        .from(schema.member)
        .where(eq(schema.member.branchId, branchId));

      const [premiumAgg] = await db
        .select({
          paid: sql<number>`coalesce(sum(${schema.premium.amountPaid}), 0)`,
          due: sql<number>`coalesce(sum(${schema.premium.amountDue}), 0)`,
        })
        .from(schema.premium)
        .innerJoin(schema.member, eq(schema.premium.memberId, schema.member.id))
        .where(eq(schema.member.branchId, branchId));

      const [claimCounts] = await db
        .select({
          approved: sql<number>`coalesce(sum(case when ${schema.claim.status} = 'approved' then 1 else 0 end), 0)`,
          pending: sql<number>`coalesce(sum(case when ${schema.claim.status} = 'pending' then 1 else 0 end), 0)`,
          rejected: sql<number>`coalesce(sum(case when ${schema.claim.status} = 'rejected' then 1 else 0 end), 0)`,
        })
        .from(schema.claim)
        .innerJoin(schema.member, eq(schema.claim.memberId, schema.member.id))
        .where(eq(schema.member.branchId, branchId));

      const recentMembers = await db
        .select({
          id: schema.member.id,
          firstName: schema.member.firstName,
          lastName: schema.member.lastName,
          status: schema.member.status,
        })
        .from(schema.member)
        .where(eq(schema.member.branchId, branchId))
        .limit(5);

      const recentClaims = await db
        .select({
          id: schema.claim.id,
          amount: schema.claim.amountClaimed,
          status: schema.claim.status,
          diagnosis: schema.claim.diagnosis,
          firstName: schema.member.firstName,
          lastName: schema.member.lastName,
        })
        .from(schema.claim)
        .innerJoin(schema.member, eq(schema.claim.memberId, schema.member.id))
        .where(eq(schema.member.branchId, branchId))
        .orderBy(desc(schema.claim.createdAt))
        .limit(5);

      const allClaims = await db.select({
        amountClaimed: schema.claim.amountClaimed,
        createdAt: schema.claim.createdAt
      }).from(schema.claim)
        .innerJoin(schema.member, eq(schema.claim.memberId, schema.member.id))
        .where(eq(schema.member.branchId, branchId));

      const allPremiums = await db.select({
        amountPaid: schema.premium.amountPaid,
        createdAt: schema.premium.dueDate
      }).from(schema.premium)
        .innerJoin(schema.member, eq(schema.premium.memberId, schema.member.id))
        .where(eq(schema.member.branchId, branchId));

      const totalMembers = Number(memberCounts?.total || 0);

      return {
        stats: {
          branchName: branchInfo.name,
          branchLocation: branchInfo.location,
          totalMembers,
          activeMembers: Number(memberCounts?.active || 0),
          totalPremiums: Number(premiumAgg?.paid || 0),
          pendingPremiums: Math.max(0, Number(premiumAgg?.due || 0) - Number(premiumAgg?.paid || 0)),
          approvedClaims: Number(claimCounts?.approved || 0),
          pendingClaims: Number(claimCounts?.pending || 0),
          rejectedClaims: Number(claimCounts?.rejected || 0),
          membersTrend: totalMembers > 0 ? 8.5 : 0,
          premiumsTrend: Number(premiumAgg?.paid || 0) > 0 ? 15.2 : 0,
        },
        recentMembers: recentMembers.map(m => ({
          id: m.id,
          name: `${m.firstName} ${m.lastName}`,
          status: m.status ?? 'unknown',
          planName: null,
        })),
        recentClaims: recentClaims.map(c => ({
          id: c.id,
          member: `${c.firstName ?? 'Unknown'} ${c.lastName ?? 'Member'}`,
          amount: Number(c.amount),
          status: c.status ?? 'unknown',
          diagnosis: c.diagnosis ?? 'N/A',
        })),
        chartData: generateChartData(allClaims, allPremiums),
      };
    } catch (err) {
      app.log.error(err);
      throw err;
    }
  });

  app.get('/hospital', {
    schema: {
      tags: ['Dashboard'],
      ...HospitalDashboardResponseSchema
    }
  }, async (request) => {
    try {
      const hospitalId = request.user.hospitalId;
      if (!hospitalId) {
        throw app.httpErrors.forbidden('No hospital assigned to your account');
      }

      const [hospitalInfo] = await db
        .select({
          name: schema.hospital.name,
          claimLimit: schema.hospital.claimLimit,
        })
        .from(schema.hospital)
        .where(eq(schema.hospital.id, hospitalId))
        .limit(1);

      if (!hospitalInfo) {
        throw app.httpErrors.notFound('Hospital not found');
      }

      const [claimAgg] = await db
        .select({
          total: sql<number>`count(*)`,
          approved: sql<number>`coalesce(sum(case when ${schema.claim.status} = 'approved' then 1 else 0 end), 0)`,
          rejected: sql<number>`coalesce(sum(case when ${schema.claim.status} = 'rejected' then 1 else 0 end), 0)`,
          pending: sql<number>`coalesce(sum(case when ${schema.claim.status} = 'pending' then 1 else 0 end), 0)`,
          totalApprovedAmount: sql<number>`coalesce(sum(case when ${schema.claim.status} = 'approved' then ${schema.claim.amountClaimed} else 0 end), 0)`,
        })
        .from(schema.claim)
        .where(eq(schema.claim.hospitalId, hospitalId));

      const recentClaims = await db
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
        .where(eq(schema.claim.hospitalId, hospitalId))
        .orderBy(desc(schema.claim.createdAt))
        .limit(5);

      const claimLimit = Number(hospitalInfo.claimLimit || 0);

      return {
        stats: {
          hospitalName: hospitalInfo.name,
          totalClaims: Number(claimAgg?.total || 0),
          approvedClaims: Number(claimAgg?.approved || 0),
          rejectedClaims: Number(claimAgg?.rejected || 0),
          pendingClaims: Number(claimAgg?.pending || 0),
          claimLimit,
          claimLimitUsed: claimLimit > 0 ? Number(claimAgg?.totalApprovedAmount || 0) : 0,
        },
        recentClaims: recentClaims.map(c => ({
          id: c.id,
          member: `${c.firstName ?? 'Unknown'} ${c.lastName ?? 'Member'}`,
          amount: Number(c.amount),
          status: c.status ?? 'unknown',
          diagnosis: c.diagnosis ?? 'N/A',
        })),
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
