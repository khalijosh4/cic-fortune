import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@/lib/api'
import { toast } from 'sonner'

export interface Member {
  id: string
  firstName: string
  lastName: string
  branchId?: string | null
  policyId?: string | null
  coverType?: string | null
  dependentsCount?: number | null
  premiumRate: string
  status?: string | null
  usedAnnualLimit?: string | null
  usedOutpatientLimit?: string | null
  usedInpatientLimit?: string | null
  usedMaternityLimit?: string | null
  branchName?: string | null
}

interface MembersResponse {
  data: Member[]
  total: number
}

export function useMembers(
  limit = 10, 
  offset = 0, 
  filters?: { 
    branchId?: string; 
    policyId?: string;
    coverType?: string;
    minPremiumRate?: number;
    maxPremiumRate?: number;
    status?: string;
  }
) {
  return useQuery<MembersResponse>({
    queryKey: ['members', limit, offset, filters],
    queryFn: async () => {
      const response = await api.get('/members', {
        params: { limit, offset, ...filters },
      })
      return response.data
    },
  })
}

export function useBulkUpdateMembers() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ ids, status }: { ids: string[]; status: string }) => {
      const response = await api.put('/members/bulk-status', { ids, status })
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['members'] })
      toast.success('Members updated', {
        description: 'Selected members have been successfully updated.',
      })
    },
    onError: (error: any) => {
      toast.error('Update failed', {
        description: error.response?.data?.message || 'An error occurred during bulk update.',
      })
    },
  })
}
export function useMember(id: string) {
  return useQuery<Member>({
    queryKey: ['members', id],
    queryFn: async () => {
      const response = await api.get(`/members/${id}`)
      return response.data
    },
  })
}

export function useUpdateMember(id: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (data: Partial<Member>) => {
      const response = await api.put(`/members/${id}`, data)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['members'] })
      toast.success('Member updated', {
        description: 'The member information has been successfully updated.',
      })
    },
    onError: (error: any) => {
      toast.error('Update failed', {
        description: error.response?.data?.message || 'An error occurred while updating the member.',
      })
    },
  })
}

export function useCreateMember() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (data: any) => {
      const response = await api.post('/members', data)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['members'] })
      toast.success('Member created', {
        description: 'The member has been successfully created.',
      })
    },
    onError: (error: any) => {
      toast.error('Creation failed', {
        description: error.response?.data?.message || 'An error occurred while creating the member.',
      })
    },
  })
}

export function useDeleteMember() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await api.delete(`/members/${id}`)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['members'] })
      toast.success('Member deleted', {
        description: 'The member has been successfully deleted.',
      })
    },
    onError: (error: any) => {
      toast.error('Deletion failed', {
        description: error.response?.data?.message || 'An error occurred while deleting the member.',
      })
    },
  })
}
