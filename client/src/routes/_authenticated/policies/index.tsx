import z from 'zod'
import { createFileRoute } from '@tanstack/react-router'
import { Policies } from '@/features/policies'

const policySearchSchema = z.object({
  page: z.number().optional().catch(1),
  pageSize: z.number().optional().catch(20),
  status: z.array(z.string()).optional().catch([]),
  name: z.string().optional().catch(''),
  annualRange: z.array(z.number()).optional().catch([]),
  outpatientRange: z.array(z.number()).optional().catch([]),
  inpatientRange: z.array(z.number()).optional().catch([]),
  maternityRange: z.array(z.number()).optional().catch([]),
})

export const Route = createFileRoute('/_authenticated/policies/')({
  validateSearch: policySearchSchema,
  component: Policies,
})
