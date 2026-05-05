import z from 'zod'
import { createFileRoute } from '@tanstack/react-router'
import { Members } from '@/features/members'

const memberSearchSchema = z.object({
  page: z.number().optional().catch(1),
  pageSize: z.number().optional().catch(20),
  status: z.array(z.string()).optional().catch([]),
  name: z.string().optional().catch(''),
})

export const Route = createFileRoute('/_authenticated/members/')({
  validateSearch: memberSearchSchema,
  component: Members,
})
