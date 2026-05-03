import { useQuery } from '@tanstack/react-query'
import api from '@/lib/api'

export interface AuditLog {
  id: string
  timestamp?: string | null
  userEmail?: string | null
  userRole?: string | null
  branchName?: string | null
  action: string
  module?: string | null
  ipAddress?: string | null
  status?: string | null
  type?: string | null
}

interface AuditLogsResponse {
  data: AuditLog[]
  total: number
}

export function useAuditLogs(
  limit = 10,
  offset = 0,
  filters?: {
    module?: string
    type?: string
    status?: string
    userRole?: string
    startDate?: string
    endDate?: string
  }
) {
  return useQuery<AuditLogsResponse>({
    queryKey: ['audit-logs', limit, offset, filters],
    queryFn: async () => {
      const response = await api.get('/audit-logs', {
        params: { limit, offset, ...filters },
      })
      return response.data
    },
  })
}
export function useAuditLog(id: string) {
  return useQuery<AuditLog>({
    queryKey: ['audit-logs', id],
    queryFn: async () => {
      const response = await api.get(`/audit-logs/${id}`)
      return response.data
    },
  })
}
