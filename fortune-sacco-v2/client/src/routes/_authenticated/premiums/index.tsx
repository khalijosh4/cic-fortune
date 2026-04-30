import { createFileRoute } from '@tanstack/react-router'
import { Premiums } from '@/features/premiums'

export const Route = createFileRoute('/_authenticated/premiums/')({
  component: Premiums,
})
