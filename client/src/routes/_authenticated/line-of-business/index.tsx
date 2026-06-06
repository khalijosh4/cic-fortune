import z from 'zod'
import { createFileRoute } from '@tanstack/react-router'
import { LineOfBusinessList } from '@/features/line-of-business'

const lobSearchSchema = z.object({
  page: z.number().optional().catch(1),
  pageSize: z.number().optional().catch(20),
  name: z.string().optional().catch(''),
})

export const Route = createFileRoute('/_authenticated/line-of-business/')({
  validateSearch: lobSearchSchema,
  component: LineOfBusinessList,
})
