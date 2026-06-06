import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@/lib/api'
import { toast } from 'sonner'
import { useLobStore } from '@/stores/lob-store'

export interface Claim {
  id: string
  memberId?: string | null
  hospitalId?: string | null
  planId?: string | null
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

export function useClaims(
  limit = 10,
  offset = 0,
  filters?: any
) {
  const activeLobId = useLobStore((s) => s.activeLob?.id)
  const effectiveFilters = { ...filters, ...(activeLobId ? { lobId: activeLobId } : {}) }
  return useQuery<ClaimsResponse>({
    queryKey: ['claims', limit, offset, effectiveFilters],
    queryFn: async () => {
      const response = await api.get('/claims', {
        params: { limit, offset, ...effectiveFilters },
      })
      return response.data
    },
  })
}

export function useBulkUpdateClaims() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ ids, status }: { ids: string[]; status: string }) => {
      const response = await api.put('/claims/bulk-status', { ids, status })
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['claims'] })
      toast.success('Claims updated', {
        description: 'Selected claims have been successfully updated.',
      })
    },
    onError: (error: any) => {
      toast.error('Update failed', {
        description: error.response?.data?.message || 'An error occurred during bulk update.',
      })
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
  const activeLobId = useLobStore((s) => s.activeLob?.id)
  return useMutation({
    mutationFn: async (data: any) => {
      const response = await api.post('/claims', { ...data, lobId: activeLobId })
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
