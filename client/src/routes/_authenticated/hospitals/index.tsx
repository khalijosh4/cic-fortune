import z from 'zod'
import { createFileRoute } from '@tanstack/react-router'
import { Hospitals } from '@/features/hospitals'

const hospitalSearchSchema = z.object({
  page: z.number().optional().catch(1),
  pageSize: z.number().optional().catch(20),
  type: z.array(z.string()).optional().catch([]),
  name: z.string().optional().catch(''),
})

export const Route = createFileRoute('/_authenticated/hospitals/')({
  validateSearch: hospitalSearchSchema,
  component: Hospitals,
})
