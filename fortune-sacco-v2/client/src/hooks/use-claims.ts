import { useQuery } from '@tanstack/react-query'
import api from '@/lib/api'

export interface Claim {
  id: string
  memberId?: string | null
  hospitalId?: string | null
  policyId?: string | null
  amountClaimed: string
  amountApproved?: string | null
  status?: string | null
  diagnosis?: string | null
  createdAt?: string | null
}

interface ClaimsResponse {
  data: Claim[]
  total: number
}

export function useClaims(limit = 10, offset = 0, filters?: { status?: string; memberId?: string }) {
  return useQuery<ClaimsResponse>({
    queryKey: ['claims', limit, offset, filters],
    queryFn: async () => {
      const response = await api.get('/claims', {
        params: { limit, offset, ...filters },
      })
      return response.data
    },
  })
}
