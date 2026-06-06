import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@/lib/api'
import { toast } from 'sonner'
import { useLobStore } from '@/stores/lob-store'

export interface Plan {
  id: string
  planName: string
  inpatientLimit: string
  outpatientLimit: string
  maternityLimit?: string | null
  dentalLimit?: string | null
  opticalLimit?: string | null
  lastExpenseLimit?: string | null
  m0: string
  m1: string
  m2: string
  m3: string
  m4: string
  m5: string
  m6: string
  extra: string
}

interface PlansResponse {
  data: Plan[]
  total: number
}

export function usePlans(
  limit = 10,
  offset = 0,
  filters?: any
) {
  const activeLobId = useLobStore((s) => s.activeLob?.id)
  const effectiveFilters = { ...filters, ...(activeLobId ? { lobId: activeLobId } : {}) }
  return useQuery<PlansResponse>({
    queryKey: ['plans', limit, offset, effectiveFilters],
    queryFn: async () => {
      const response = await api.get('/plans', {
        params: { limit, offset, ...effectiveFilters },
      })
      return response.data
    },
  })
}
export function usePlan(id: string) {
  return useQuery<Plan>({
    queryKey: ['plans', id],
    queryFn: async () => {
      const response = await api.get(`/plans/${id}`)
      return response.data
    },
    enabled: !!id,
  })
}

export function useUpdatePlan(id: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (data: Partial<Plan>) => {
      const response = await api.put(`/plans/${id}`, data)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['plans'] })
      toast.success('Plan updated', {
        description: 'The plan information has been successfully updated.',
      })
    },
    onError: (error: any) => {
      toast.error('Update failed', {
        description: error.response?.data?.message || 'An error occurred while updating the plan.',
      })
    },
  })
}

export function useCreatePlan() {
  const queryClient = useQueryClient()
  const activeLobId = useLobStore((s) => s.activeLob?.id)
  return useMutation({
    mutationFn: async (data: any) => {
      const response = await api.post('/plans', { ...data, lobId: activeLobId })
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['plans'] })
      toast.success('Plan created', {
        description: 'The plan has been successfully created.',
      })
    },
    onError: (error: any) => {
      toast.error('Creation failed', {
        description: error.response?.data?.message || 'An error occurred while creating the plan.',
      })
    },
  })
}

export function useDeletePlan() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await api.delete(`/plans/${id}`)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['plans'] })
      toast.success('Plan deleted', {
        description: 'The plan has been successfully deleted.',
      })
    },
    onError: (error: any) => {
      toast.error('Deletion failed', {
        description: error.response?.data?.message || 'An error occurred while deleting the plan.',
      })
    },
  })
}
