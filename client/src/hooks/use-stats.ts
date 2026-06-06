import { useQuery } from '@tanstack/react-query'
import api from '@/lib/api'
import { useLobStore } from '@/stores/lob-store'

// Plans
export interface PlanStats {
  total: number
  avgInpatient: number
  avgOutpatient: number
  avgMaternity: number
}
export function usePlanStats() {
  const activeLobId = useLobStore((s) => s.activeLob?.id)
  const params = activeLobId ? { lobId: activeLobId } : {}
  return useQuery<PlanStats>({
    queryKey: ['plans', 'stats', activeLobId],
    queryFn: async () => (await api.get('/plans/stats', { params })).data,
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
  const activeLobId = useLobStore((s) => s.activeLob?.id)
  const params = activeLobId ? { lobId: activeLobId } : {}
  return useQuery<PremiumStats>({
    queryKey: ['premiums', 'stats', activeLobId],
    queryFn: async () => (await api.get('/premiums/stats', { params })).data,
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
  const activeLobId = useLobStore((s) => s.activeLob?.id)
  const params = activeLobId ? { lobId: activeLobId } : {}
  return useQuery<MemberStats>({
    queryKey: ['members', 'stats', activeLobId],
    queryFn: async () => (await api.get('/members/stats', { params })).data,
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
  const activeLobId = useLobStore((s) => s.activeLob?.id)
  const params = activeLobId ? { lobId: activeLobId } : {}
  return useQuery<BranchStats>({
    queryKey: ['branches', 'stats', activeLobId],
    queryFn: async () => (await api.get('/branches/stats', { params })).data,
  })
}

// Hospitals
export interface HospitalStats {
  total: number
  byType: Record<string, number>
}
export function useHospitalStats() {
  const activeLobId = useLobStore((s) => s.activeLob?.id)
  const params = activeLobId ? { lobId: activeLobId } : {}
  return useQuery<HospitalStats>({
    queryKey: ['hospitals', 'stats', activeLobId],
    queryFn: async () => (await api.get('/hospitals/stats', { params })).data,
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
  const activeLobId = useLobStore((s) => s.activeLob?.id)
  const params = activeLobId ? { lobId: activeLobId } : {}
  return useQuery<ClaimStats>({
    queryKey: ['claims', 'stats', activeLobId],
    queryFn: async () => (await api.get('/claims/stats', { params })).data,
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
  const activeLobId = useLobStore((s) => s.activeLob?.id)
  const params = activeLobId ? { lobId: activeLobId } : {}
  return useQuery<AuditLogStats>({
    queryKey: ['audit-logs', 'stats', activeLobId],
    queryFn: async () => (await api.get('/audit-logs/stats', { params })).data,
  })
}
