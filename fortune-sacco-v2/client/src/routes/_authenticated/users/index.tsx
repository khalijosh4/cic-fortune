import z from 'zod'
import { createFileRoute } from '@tanstack/react-router'
import { Users } from '@/features/users'

const userSearchSchema = z.object({
  page: z.number().optional().catch(1),
  pageSize: z.number().optional().catch(20),
  email: z.string().optional().catch(''),
  role: z.array(z.string()).optional().catch([]),
})

export const Route = createFileRoute('/_authenticated/users/')({
  validateSearch: userSearchSchema,
  component: Users,
})
