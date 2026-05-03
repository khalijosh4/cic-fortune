import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@/lib/api'
import { toast } from 'sonner'

export interface Hospital {
  id: string
  name: string
  location?: string | null
  type?: string | null
  claimLimit?: string | null
}

interface HospitalsResponse {
  data: Hospital[]
  total: number
}

export function useHospitals(
  limit = 10, 
  offset = 0, 
  filters?: { 
    type?: string;
    location?: string;
    minClaimLimit?: number;
    maxClaimLimit?: number;
  }
) {
  return useQuery<HospitalsResponse>({
    queryKey: ['hospitals', limit, offset, filters],
    queryFn: async () => {
      const response = await api.get('/hospitals', {
        params: { limit, offset, ...filters },
      })
      return response.data
    },
  })
}
export function useHospital(id: string) {
  return useQuery<Hospital>({
    queryKey: ['hospitals', id],
    queryFn: async () => {
      const response = await api.get(`/hospitals/${id}`)
      return response.data
    },
  })
}

export function useUpdateHospital(id: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (data: Partial<Hospital>) => {
      const response = await api.put(`/hospitals/${id}`, data)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hospitals'] })
      toast.success('Hospital updated', {
        description: 'The hospital information has been successfully updated.',
      })
    },
    onError: (error: any) => {
      toast.error('Update failed', {
        description: error.response?.data?.message || 'An error occurred while updating the hospital.',
      })
    },
  })
}
export function useCreateHospital() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (data: any) => {
      const response = await api.post('/hospitals', data)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hospitals'] })
      toast.success('Hospital created', {
        description: 'The hospital has been successfully created.',
      })
    },
    onError: (error: any) => {
      toast.error('Creation failed', {
        description: error.response?.data?.message || 'An error occurred while creating the hospital.',
      })
    },
  })
}
export function useDeleteHospital() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await api.delete(`/hospitals/${id}`)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hospitals'] })
      toast.success('Hospital deleted', {
        description: 'The hospital has been successfully deleted.',
      })
    },
    onError: (error: any) => {
      toast.error('Deletion failed', {
        description: error.response?.data?.message || 'An error occurred while deleting the hospital.',
      })
    },
  })
}
