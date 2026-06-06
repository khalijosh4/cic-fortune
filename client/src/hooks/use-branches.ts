import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@/lib/api'
import { toast } from 'sonner'
import { useLobStore } from '@/stores/lob-store'

export interface Branch {
  id: string
  name: string
  totalMembers: number
  totalPlans: number
  totalActivePlans: number
  totalClaims: number
  location: string
  managerName: string
}

interface BranchesResponse {
  data: Branch[]
  total: number
}

export function useBranches(
  limit = 10,
  offset = 0,
  filters?: any
) {
  const activeLobId = useLobStore((s) => s.activeLob?.id)
  const effectiveFilters = { ...filters, ...(activeLobId ? { lobId: activeLobId } : {}) }
  return useQuery<BranchesResponse>({
    queryKey: ['branches', limit, offset, effectiveFilters],
    queryFn: async () => {
      const response = await api.get('/branches', {
        params: { limit, offset, ...effectiveFilters },
      })
      return response.data
    },
  })
}
export function useBranch(id: string) {
  return useQuery<any>({
    queryKey: ['branches', id],
    queryFn: async () => {
      const response = await api.get(`/branches/${id}`)
      return response.data
    },
  })
}

export function useUpdateBranch(id: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (data: any) => {
      const response = await api.put(`/branches/${id}`, data)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['branches'] })
      toast.success('Branch updated', {
        description: 'The branch information has been successfully updated.',
      })
    },
    onError: (error: any) => {
      toast.error('Update failed', {
        description: error.response?.data?.message || 'An error occurred while updating the branch.',
      })
    },
  })
}
export function useCreateBranch() {
  const queryClient = useQueryClient()
  const activeLobId = useLobStore((s) => s.activeLob?.id)
  return useMutation({
    mutationFn: async (data: any) => {
      const response = await api.post('/branches', { ...data, lobId: activeLobId })
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['branches'] })
      toast.success('Branch created', {
        description: 'The branch has been successfully created.',
      })
    },
    onError: (error: any) => {
      toast.error('Creation failed', {
        description: error.response?.data?.message || 'An error occurred while creating the branch.',
      })
    },
  })
}
export function useDeleteBranch() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await api.delete(`/branches/${id}`)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['branches'] })
      toast.success('Branch deleted', {
        description: 'The branch has been successfully deleted.',
      })
    },
    onError: (error: any) => {
      toast.error('Deletion failed', {
        description: error.response?.data?.message || 'An error occurred while deleting the branch.',
      })
    },
  })
}
