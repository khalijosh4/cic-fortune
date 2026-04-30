import { useQuery } from '@tanstack/react-query'
import api from '@/lib/api'

export interface Hospital {
  id: string
  name: string
  location?: string | null
  type?: string | null
  claimLimit?: string | null
}

interface HospitalsResponse {
  data: Hospital[]
  total: number
}

export function useHospitals(limit = 10, offset = 0, filters?: { type?: string }) {
  return useQuery<HospitalsResponse>({
    queryKey: ['hospitals', limit, offset, filters],
    queryFn: async () => {
      const response = await api.get('/hospitals', {
        params: { limit, offset, ...filters },
      })
      return response.data
    },
  })
}
