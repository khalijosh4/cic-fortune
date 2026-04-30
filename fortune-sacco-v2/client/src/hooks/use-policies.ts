import { useQuery } from '@tanstack/react-query'
import api from '@/lib/api'

export interface Policy {
  id: string
  name: string
  annualLimit: string
  outpatientLimit?: string | null
  inpatientLimit?: string | null
  maternityLimit?: string | null
  status?: string | null
}

interface PoliciesResponse {
  data: Policy[]
  total: number
}

export function usePolicies(limit = 10, offset = 0, filters?: { status?: string }) {
  return useQuery<PoliciesResponse>({
    queryKey: ['policies', limit, offset, filters],
    queryFn: async () => {
      const response = await api.get('/policies', {
        params: { limit, offset, ...filters },
      })
      return response.data
    },
  })
}
