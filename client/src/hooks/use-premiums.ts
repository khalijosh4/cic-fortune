import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@/lib/api'
import { toast } from 'sonner'
import { useLobStore } from '@/stores/lob-store'

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

export function usePremiums(
  limit = 10,
  offset = 0,
  filters?: any
) {
  const activeLobId = useLobStore((s) => s.activeLob?.id)
  const effectiveFilters = { ...filters, ...(activeLobId ? { lobId: activeLobId } : {}) }
  return useQuery<PremiumsResponse>({
    queryKey: ['premiums', limit, offset, effectiveFilters],
    queryFn: async () => {
      const response = await api.get('/premiums', {
        params: { limit, offset, ...effectiveFilters },
      })
      return response.data
    },
  })
}

export function useBulkUpdatePremiums() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ ids, status }: { ids: string[]; status: string }) => {
      const response = await api.put('/premiums/bulk-status', { ids, status })
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['premiums'] })
      toast.success('Premiums updated', {
        description: 'Selected premiums have been successfully updated.',
      })
    },
    onError: (error: any) => {
      toast.error('Update failed', {
        description: error.response?.data?.message || 'An error occurred during bulk update.',
      })
    },
  })
}
export function usePremium(id: string) {
  return useQuery<Premium>({
    queryKey: ['premiums', id],
    queryFn: async () => {
      const response = await api.get(`/premiums/${id}`)
      return response.data
    },
  })
}

export function useUpdatePremium(id: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (data: Partial<Premium>) => {
      const response = await api.put(`/premiums/${id}`, data)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['premiums'] })
      toast.success('Premium updated', {
        description: 'The premium information has been successfully updated.',
      })
    },
    onError: (error: any) => {
      toast.error('Update failed', {
        description: error.response?.data?.message || 'An error occurred while updating the premium.',
      })
    },
  })
}
export function useCreatePremium() {
  const queryClient = useQueryClient()
  const activeLobId = useLobStore((s) => s.activeLob?.id)
  return useMutation({
    mutationFn: async (data: any) => {
      const response = await api.post('/premiums', { ...data, lobId: activeLobId })
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['premiums'] })
      toast.success('Premium generated', {
        description: 'The premium has been successfully generated.',
      })
    },
    onError: (error: any) => {
      toast.error('Generation failed', {
        description: error.response?.data?.message || 'An error occurred while generating the premium.',
      })
    },
  })
}

export function useDeletePremium() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await api.delete(`/premiums/${id}`)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['premiums'] })
      toast.success('Premium deleted', {
        description: 'The premium record has been successfully deleted.',
      })
    },
    onError: (error: any) => {
      toast.error('Deletion failed', {
        description: error.response?.data?.message || 'An error occurred while deleting the premium.',
      })
    },
  })
}
