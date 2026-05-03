import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@/lib/api'
import { toast } from 'sonner'

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
export function usePolicy(id: string) {
  return useQuery<Policy>({
    queryKey: ['policies', id],
    queryFn: async () => {
      const response = await api.get(`/policies/${id}`)
      return response.data
    },
  })
}

export function useUpdatePolicy(id: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (data: Partial<Policy>) => {
      const response = await api.put(`/policies/${id}`, data)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['policies'] })
      toast.success('Policy updated', {
        description: 'The policy information has been successfully updated.',
      })
    },
    onError: (error: any) => {
      toast.error('Update failed', {
        description: error.response?.data?.message || 'An error occurred while updating the policy.',
      })
    },
  })
}

export function useCreatePolicy() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (data: any) => {
      const response = await api.post('/policies', data)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['policies'] })
      toast.success('Policy created', {
        description: 'The policy has been successfully created.',
      })
    },
    onError: (error: any) => {
      toast.error('Creation failed', {
        description: error.response?.data?.message || 'An error occurred while creating the policy.',
      })
    },
  })
}

export function useDeletePolicy() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await api.delete(`/policies/${id}`)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['policies'] })
      toast.success('Policy deleted', {
        description: 'The policy has been successfully deleted.',
      })
    },
    onError: (error: any) => {
      toast.error('Deletion failed', {
        description: error.response?.data?.message || 'An error occurred while deleting the policy.',
      })
    },
  })
}
