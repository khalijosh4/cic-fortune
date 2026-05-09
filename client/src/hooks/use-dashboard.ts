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

export interface BranchDashboardData {
  stats: {
    branchName: string
    branchLocation: string
    totalMembers: number
    activeMembers: number
    totalPremiums: number
    pendingPremiums: number
    approvedClaims: number
    pendingClaims: number
    rejectedClaims: number
    membersTrend: number
    premiumsTrend: number
  }
  recentMembers: {
    id: string
    name: string
    status: string
    planName: string | null
    createdAt: string | null
  }[]
  recentClaims: {
    id: string
    member: string
    amount: number
    status: string
    diagnosis: string
    createdAt: string | null
  }[]
  chartData: {
    month: string
    claims: number
    premiums: number
  }[]
}

export interface HospitalDashboardData {
  stats: {
    hospitalName: string
    totalClaims: number
    approvedClaims: number
    rejectedClaims: number
    pendingClaims: number
    claimLimit: number
    claimLimitUsed: number
  }
  recentClaims: {
    id: string
    member: string
    amount: number
    status: string
    diagnosis: string
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

export function useBranchDashboard() {
  return useQuery<BranchDashboardData>({
    queryKey: ['dashboard', 'branch'],
    queryFn: async () => {
      const response = await api.get('/dashboard/branch')
      return response.data
    },
  })
}

export function useHospitalDashboard() {
  return useQuery<HospitalDashboardData>({
    queryKey: ['dashboard', 'hospital'],
    queryFn: async () => {
      const response = await api.get('/dashboard/hospital')
      return response.data
    },
  })
}
