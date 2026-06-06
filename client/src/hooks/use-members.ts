import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@/lib/api'
import { toast } from 'sonner'
import { useLobStore } from '@/stores/lob-store'

export interface Member {
  id: string
  firstName: string
  lastName: string
  email?: string | null
  phoneNumber?: string | null
  branchId?: string | null
  planId?: string | null
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
  filters?: any
) {
  const activeLobId = useLobStore((s) => s.activeLob?.id)
  const effectiveFilters = { ...filters, ...(activeLobId ? { lobId: activeLobId } : {}) }
  return useQuery<MembersResponse>({
    queryKey: ['members', limit, offset, effectiveFilters],
    queryFn: async () => {
      const response = await api.get('/members', {
        params: { limit, offset, ...effectiveFilters },
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
  const activeLobId = useLobStore((s) => s.activeLob?.id)
  return useMutation({
    mutationFn: async (data: any) => {
      const response = await api.post('/members', { ...data, lobId: activeLobId })
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

export function useResendNotification() {
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await api.post(`/members/${id}/resend-notification`)
      return response.data
    },
    onSuccess: () => {
      toast.success('Notification sent', {
        description: 'The enrollment notification has been resent.',
      })
    },
    onError: (error: any) => {
      toast.error('Send failed', {
        description: error.response?.data?.message || 'An error occurred while resending the notification.',
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
