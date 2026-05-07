import z from 'zod'
import { createFileRoute } from '@tanstack/react-router'
import { Claims } from '@/features/claims'

const claimSearchSchema = z.object({
  page: z.number().optional().catch(1),
  pageSize: z.number().optional().catch(20),
  status: z.array(z.string()).optional().catch([]),
  claimId: z.string().optional().catch(''),
  claimedRange: z.array(z.number()).optional().catch([]),
  approvedRange: z.array(z.number()).optional().catch([]),
  name: z.string().optional().catch(''),
})

export const Route = createFileRoute('/_authenticated/claims/')({
  validateSearch: claimSearchSchema,
  component: Claims,
})
