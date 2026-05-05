import z from 'zod'
import { createFileRoute } from '@tanstack/react-router'
import { AuditLogs } from '@/features/audit-logs'

const auditLogSearchSchema = z.object({
  page: z.number().optional().catch(1),
  pageSize: z.number().optional().catch(20),
  action: z.string().optional().catch(''),
  status: z.array(z.string()).optional().catch([]),
  module: z.array(z.string()).optional().catch([]),
})

export const Route = createFileRoute('/_authenticated/audit-logs/')({
  validateSearch: auditLogSearchSchema,
  component: AuditLogs,
})
