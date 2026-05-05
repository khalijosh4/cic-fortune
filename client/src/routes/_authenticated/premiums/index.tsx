import z from 'zod'
import { createFileRoute } from '@tanstack/react-router'
import { Premiums } from '@/features/premiums'

const premiumSearchSchema = z.object({
  page: z.number().optional().catch(1),
  pageSize: z.number().optional().catch(20),
  paymentId: z.string().optional().catch(''),
})

export const Route = createFileRoute('/_authenticated/premiums/')({
  validateSearch: premiumSearchSchema,
  component: Premiums,
})
