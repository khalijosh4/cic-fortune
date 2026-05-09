import { Type } from '@sinclair/typebox';

export const DashboardStatsSchema = Type.Object({
  totalPremiums: Type.Number(),
  activeMembers: Type.Number(),
  approvedClaims: Type.Number(),
  pendingClaims: Type.Number(),
  premiumsTrend: Type.Number(),
  membersTrend: Type.Number(),
  claimsTrend: Type.Number(),
  pendingTrend: Type.Number(),
  createdAt: Type.Optional(Type.Union([Type.String(), Type.Null()]))
});

export const RecentClaimSchema = Type.Object({
  id: Type.String(),
  member: Type.String(),
  email: Type.String(),
  amount: Type.Number(),
  status: Type.String(),
  diagnosis: Type.String()
});

export const ChartDataSchema = Type.Object({
  month: Type.String(),
  claims: Type.Number(),
  premiums: Type.Number()
});

export const DashboardResponseSchema = {
  response: {
    200: Type.Object({
      stats: DashboardStatsSchema,
      recentClaims: Type.Array(RecentClaimSchema),
      chartData: Type.Array(ChartDataSchema)
    })
  }
};

export const BranchDashboardStatsSchema = Type.Object({
  branchName: Type.String(),
  branchLocation: Type.String(),
  totalMembers: Type.Number(),
  activeMembers: Type.Number(),
  totalPremiums: Type.Number(),
  pendingPremiums: Type.Number(),
  approvedClaims: Type.Number(),
  pendingClaims: Type.Number(),
  rejectedClaims: Type.Number(),
  membersTrend: Type.Number(),
  premiumsTrend: Type.Number(),
});

const ErrorResponseSchema = Type.Object({
  message: Type.String(),
});

export const BranchDashboardResponseSchema = {
  response: {
    200: Type.Object({
      stats: BranchDashboardStatsSchema,
      recentMembers: Type.Array(Type.Object({
        id: Type.String(),
        name: Type.String(),
        status: Type.String(),
        planName: Type.Optional(Type.Union([Type.String(), Type.Null()])),
      })),
      recentClaims: Type.Array(Type.Object({
        id: Type.String(),
        member: Type.String(),
        amount: Type.Number(),
        status: Type.String(),
        diagnosis: Type.String(),
      })),
      chartData: Type.Array(ChartDataSchema),
    }),
    403: ErrorResponseSchema,
    404: ErrorResponseSchema,
  }
};

export const HospitalDashboardStatsSchema = Type.Object({
  hospitalName: Type.String(),
  totalClaims: Type.Number(),
  approvedClaims: Type.Number(),
  rejectedClaims: Type.Number(),
  pendingClaims: Type.Number(),
  claimLimit: Type.Number(),
  claimLimitUsed: Type.Number(),
});

export const HospitalDashboardResponseSchema = {
  response: {
    200: Type.Object({
      stats: HospitalDashboardStatsSchema,
      recentClaims: Type.Array(Type.Object({
        id: Type.String(),
        member: Type.String(),
        amount: Type.Number(),
        status: Type.String(),
        diagnosis: Type.String(),
      })),
    }),
    403: ErrorResponseSchema,
    404: ErrorResponseSchema,
  }
};
