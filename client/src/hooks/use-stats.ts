import { useQuery } from '@tanstack/react-query'
import api from '@/lib/api'

// Plans
export interface PlanStats {
  total: number
  avgInpatient: number
  avgOutpatient: number
  avgMaternity: number
}
export function usePlanStats() {
  return useQuery<PlanStats>({
    queryKey: ['plans', 'stats'],
    queryFn: async () => (await api.get('/plans/stats')).data,
  })
}

// Premiums
export interface PremiumStats {
  total: number
  totalDue: number
  totalPaid: number
  outstanding: number
  collectionRate: number
}
export function usePremiumStats() {
  return useQuery<PremiumStats>({
    queryKey: ['premiums', 'stats'],
    queryFn: async () => (await api.get('/premiums/stats')).data,
  })
}

// Members
export interface MemberStats {
  total: number
  active: number
  pending: number
  expired: number
}
export function useMemberStats() {
  return useQuery<MemberStats>({
    queryKey: ['members', 'stats'],
    queryFn: async () => (await api.get('/members/stats')).data,
  })
}

// Branches
export interface BranchStats {
  total: number
  totalMembers: number
  totalClaims: number
  avgMembers: number
}
export function useBranchStats() {
  return useQuery<BranchStats>({
    queryKey: ['branches', 'stats'],
    queryFn: async () => (await api.get('/branches/stats')).data,
  })
}

// Hospitals
export interface HospitalStats {
  total: number
  byType: Record<string, number>
}
export function useHospitalStats() {
  return useQuery<HospitalStats>({
    queryKey: ['hospitals', 'stats'],
    queryFn: async () => (await api.get('/hospitals/stats')).data,
  })
}

// Claims
export interface ClaimStats {
  total: number
  approved: number
  pending: number
  rejected: number
  totalAmountClaimed: number
  totalAmountApproved: number
}
export function useClaimStats() {
  return useQuery<ClaimStats>({
    queryKey: ['claims', 'stats'],
    queryFn: async () => (await api.get('/claims/stats')).data,
  })
}

// Audit Logs
export interface AuditLogStats {
  total: number
  success: number
  error: number
  successRate: number
}
export function useAuditLogStats() {
  return useQuery<AuditLogStats>({
    queryKey: ['audit-logs', 'stats'],
    queryFn: async () => (await api.get('/audit-logs/stats')).data,
  })
}
