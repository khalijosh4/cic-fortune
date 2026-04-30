import { useQuery } from '@tanstack/react-query'
import api from '@/lib/api'

export interface Premium {
  id: string
  memberId?: string | null
  amountDue: string
  amountPaid?: string | null
  dueDate: string
  paymentMethod?: string | null
}

interface PremiumsResponse {
  data: Premium[]
  total: number
}

export function usePremiums(limit = 10, offset = 0, filters?: { memberId?: string }) {
  return useQuery<PremiumsResponse>({
    queryKey: ['premiums', limit, offset, filters],
    queryFn: async () => {
      const response = await api.get('/premiums', {
        params: { limit, offset, ...filters },
      })
      return response.data
    },
  })
}
