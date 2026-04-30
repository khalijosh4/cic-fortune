import { Type } from '@sinclair/typebox';

export const DashboardStatsSchema = Type.Object({
  totalPremiums: Type.Number(),
  activeMembers: Type.Number(),
  approvedClaims: Type.Number(),
  pendingClaims: Type.Number(),
  premiumsTrend: Type.Number(),
  membersTrend: Type.Number(),
  claimsTrend: Type.Number(),
  pendingTrend: Type.Number()
});

export const RecentClaimSchema = Type.Object({
  id: Type.String(),
  member: Type.String(),
  email: Type.String(),
  amount: Type.Number(),
  status: Type.String(),
  diagnosis: Type.String()
});

export const DashboardResponseSchema = {
  response: {
    200: Type.Object({
      stats: DashboardStatsSchema,
      recentClaims: Type.Array(RecentClaimSchema)
    })
  }
};
