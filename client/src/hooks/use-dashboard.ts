import { useQuery } from '@tanstack/react-query'
import api from '@/lib/api'

export interface DashboardData {
  stats: {
    totalPremiums: number
    activeMembers: number
    approvedClaims: number
    pendingClaims: number
    premiumsTrend: number
    membersTrend: number
    claimsTrend: number
    pendingTrend: number
  }
  recentClaims: {
    id: string
    member: string
    email: string
    amount: number
    status: string
    diagnosis: string
  }[]
  chartData: {
    month: string
    claims: number
    premiums: number
  }[]
}

export function useDashboard() {
  return useQuery<DashboardData>({
    queryKey: ['dashboard'],
    queryFn: async () => {
      const response = await api.get('/dashboard')
      return response.data
    },
  })
}
