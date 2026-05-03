import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@/lib/api'
import { toast } from 'sonner'

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
export function useClaim(id: string) {
  return useQuery<Claim>({
    queryKey: ['claims', id],
    queryFn: async () => {
      const response = await api.get(`/claims/${id}`)
      return response.data
    },
  })
}

export function useUpdateClaim(id: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (data: Partial<Claim>) => {
      const response = await api.put(`/claims/${id}`, data)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['claims'] })
      toast.success('Claim updated', {
        description: 'The claim information has been successfully updated.',
      })
    },
    onError: (error: any) => {
      toast.error('Update failed', {
        description: error.response?.data?.message || 'An error occurred while updating the claim.',
      })
    },
  })
}
export function useCreateClaim() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (data: any) => {
      const response = await api.post('/claims', data)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['claims'] })
      toast.success('Claim submitted', {
        description: 'The claim has been successfully submitted.',
      })
    },
    onError: (error: any) => {
      toast.error('Submission failed', {
        description: error.response?.data?.message || 'An error occurred while submitting the claim.',
      })
    },
  })
}

export function useDeleteClaim() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await api.delete(`/claims/${id}`)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['claims'] })
      toast.success('Claim deleted', {
        description: 'The claim has been successfully deleted.',
      })
    },
    onError: (error: any) => {
      toast.error('Deletion failed', {
        description: error.response?.data?.message || 'An error occurred while deleting the claim.',
      })
    },
  })
}
