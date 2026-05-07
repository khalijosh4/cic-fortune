import z from 'zod'
import { createFileRoute } from '@tanstack/react-router'
import { Branches } from '@/features/branches'

const branchSearchSchema = z.object({
  page: z.number().optional().catch(1),
  pageSize: z.number().optional().catch(20),
  branchName: z.string().optional().catch(''),
  location: z.string().optional().catch(''),
  plansRange: z.array(z.number()).optional().catch([]),
  activePlansRange: z.array(z.number()).optional().catch([]),
})

export const Route = createFileRoute('/_authenticated/branches/')({
  validateSearch: branchSearchSchema,
  component: Branches,
})
