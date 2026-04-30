import { useQuery } from '@tanstack/react-query'
import api from '@/lib/api'

export interface User {
  id: string
  firstName: string
  middleName?: string | null
  lastName: string
  email?: string | null
  phoneNumber?: string | null
  role: 'admin' | 'user' | 'hospital'
  branchId?: string | null
  hospitalId?: string | null
  createdAt?: string | null
  updatedAt?: string | null
}

interface UsersResponse {
  data: User[]
  total: number
}

export function useUsers(limit = 10, offset = 0, filters?: { role?: string; branchId?: string }) {
  return useQuery<UsersResponse>({
    queryKey: ['users', limit, offset, filters],
    queryFn: async () => {
      const response = await api.get('/users', {
        params: { limit, offset, ...filters },
      })
      return response.data
    },
  })
}
