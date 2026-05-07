import z from 'zod'
import { createFileRoute } from '@tanstack/react-router'
import { Plans } from '@/features/plans'

const planSearchSchema = z.object({
  page: z.number().optional().catch(1),
  pageSize: z.number().optional().catch(20),
  planName: z.string().optional().catch(''),
  outpatientRange: z.array(z.number()).optional().catch([]),
  inpatientRange: z.array(z.number()).optional().catch([]),
  maternityRange: z.array(z.number()).optional().catch([]),
})

export const Route = createFileRoute('/_authenticated/plans/')({
  validateSearch: planSearchSchema,
  component: Plans,
})
