import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@/lib/api'
import { toast } from 'sonner'

export interface Permission {
  id: string
  name: string
  description?: string | null
  resource: string
  action: string
}

const RESOURCE_LABELS: Record<string, string> = {
  members: 'Members',
  claims: 'Claims',
  premiums: 'Premiums',
  users: 'Users',
  branches: 'Branches',
  hospitals: 'Hospitals',
  plans: 'Plans',
  'audit-logs': 'Audit Logs',
  dashboard: 'Dashboard',
}

const ACTION_LABELS: Record<string, string> = {
  create: 'Create',
  read: 'View',
  update: 'Edit',
  delete: 'Delete',
  transfer: 'Transfer',
}

export function getResourceLabel(resource: string): string {
  return RESOURCE_LABELS[resource] || resource
}

export function getActionLabel(action: string): string {
  return ACTION_LABELS[action] || action
}

export function groupPermissionsByResource(
  permissions: Permission[]
): Record<string, Permission[]> {
  return permissions.reduce<Record<string, Permission[]>>((acc, p) => {
    if (!acc[p.resource]) acc[p.resource] = []
    acc[p.resource].push(p)
    return acc
  }, {})
}

export function usePermissions() {
  return useQuery<{ data: Permission[] }>({
    queryKey: ['permissions'],
    queryFn: async () => {
      const response = await api.get('/permissions')
      return response.data
    },
  })
}

export function useUserPermissions(userId: string, enabled = true) {
  return useQuery<string[]>({
    queryKey: ['permissions', 'user', userId],
    queryFn: async () => {
      const response = await api.get(`/permissions/user/${userId}`)
      return response.data
    },
    enabled: enabled && !!userId,
  })
}

export function useUpdateUserPermissions(userId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (permissionIds: string[]) => {
      const response = await api.put(`/permissions/user/${userId}`, { permissionIds })
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['permissions', 'user', userId] })
      toast.success('Permissions updated')
    },
    onError: (error: any) => {
      toast.error('Failed to update permissions', {
        description: error.response?.data?.message || 'An error occurred.',
      })
    },
  })
}
