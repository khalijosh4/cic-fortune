import { useQuery } from '@tanstack/react-query'
import api from '@/lib/api'

export interface Branch {
  branchId: string
  branchName: string
  totalMembers: number
  totalPolicies: number
  totalActivePolicies: number
  totalClaims: number
}

interface BranchesResponse {
  data: Branch[]
  total: number
}

export function useBranches(limit = 10, offset = 0) {
  return useQuery<BranchesResponse>({
    queryKey: ['branches', limit, offset],
    queryFn: async () => {
      const response = await api.get('/branches', {
        params: { limit, offset },
      })
      return response.data
    },
  })
}
