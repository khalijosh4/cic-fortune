import { useQuery } from '@tanstack/react-query'
import api from '@/lib/api'

export interface Member {
  id: string
  firstName: string
  lastName: string
  branchId?: string | null
  policyId?: string | null
  coverType?: string | null
  premiumRate: string
  status?: string | null
  usedAnnualLimit?: string | null
  usedOutpatientLimit?: string | null
  usedInpatientLimit?: string | null
  usedMaternityLimit?: string | null
}

interface MembersResponse {
  data: Member[]
  total: number
}

export function useMembers(limit = 10, offset = 0, filters?: { branchId?: string; policyId?: string }) {
  return useQuery<MembersResponse>({
    queryKey: ['members', limit, offset, filters],
    queryFn: async () => {
      const response = await api.get('/members', {
        params: { limit, offset, ...filters },
      })
      return response.data
    },
  })
}
