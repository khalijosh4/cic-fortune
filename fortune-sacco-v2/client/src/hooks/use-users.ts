import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@/lib/api'
import { toast } from 'sonner'

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
export function useUser(id: string) {
  return useQuery<User>({
    queryKey: ['users', id],
    queryFn: async () => {
      const response = await api.get(`/users/${id}`)
      return response.data
    },
  })
}

export function useUpdateUser(id: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (data: Partial<User>) => {
      const response = await api.put(`/users/${id}`, data)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
      toast.success('User updated', {
        description: 'The user information has been successfully updated.',
      })
    },
    onError: (error: any) => {
      toast.error('Update failed', {
        description: error.response?.data?.message || 'An error occurred while updating the user.',
      })
    },
  })
}
export function useCreateUser() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (data: any) => {
      const response = await api.post('/users', data)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
      toast.success('User created', {
        description: 'The user has been successfully created.',
      })
    },
    onError: (error: any) => {
      toast.error('Creation failed', {
        description: error.response?.data?.message || 'An error occurred while creating the user.',
      })
    },
  })
}

export function useDeleteUser() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await api.delete(`/users/${id}`)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
      toast.success('User deleted', {
        description: 'The user has been successfully deleted.',
      })
    },
    onError: (error: any) => {
      toast.error('Deletion failed', {
        description: error.response?.data?.message || 'An error occurred while deleting the user.',
      })
    },
  })
}
