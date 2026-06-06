import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@/lib/api'
import { toast } from 'sonner'

export interface LineOfBusiness {
  id: string
  name: string
  code: string
  description: string | null
  icon: string | null
  isActive: boolean
  config: { enabledModules: string[] } | null
  createdAt: string | null
  updatedAt: string | null
}

interface LobsResponse {
  data: LineOfBusiness[]
  total: number
}

export function useLobs() {
  return useQuery<LobsResponse>({
    queryKey: ['lobs'],
    queryFn: async () => {
      const response = await api.get('/line-of-business')
      return response.data
    },
  })
}

export function useLob(id: string) {
  return useQuery<any>({
    queryKey: ['lobs', id],
    queryFn: async () => {
      const response = await api.get(`/line-of-business/${id}`)
      return response.data
    },
    enabled: !!id,
  })
}

export function useCreateLob() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (data: any) => {
      const response = await api.post('/line-of-business', data)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lobs'] })
      toast.success('Line of Business created', {
        description: 'The line of business has been successfully created.',
      })
    },
    onError: (error: any) => {
      toast.error('Creation failed', {
        description: error.response?.data?.message || 'An error occurred while creating the line of business.',
      })
    },
  })
}

export function useUpdateLob(id: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (data: any) => {
      const response = await api.put(`/line-of-business/${id}`, data)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lobs'] })
      toast.success('Line of Business updated', {
        description: 'The line of business has been successfully updated.',
      })
    },
    onError: (error: any) => {
      toast.error('Update failed', {
        description: error.response?.data?.message || 'An error occurred while updating the line of business.',
      })
    },
  })
}

export function useDeleteLob() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await api.delete(`/line-of-business/${id}`)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lobs'] })
      toast.success('Line of Business deleted', {
        description: 'The line of business has been successfully deleted.',
      })
    },
    onError: (error: any) => {
      toast.error('Deletion failed', {
        description: error.response?.data?.message || 'An error occurred while deleting the line of business.',
      })
    },
  })
}
