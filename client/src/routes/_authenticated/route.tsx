import { createFileRoute, redirect } from '@tanstack/react-router'
import { AuthenticatedLayout } from '@/components/layout/authenticated-layout'
import { useAuthStore } from '@/stores/auth-store'
import { isRouteAllowed } from '@/lib/permissions'

export const Route = createFileRoute('/_authenticated')({
  beforeLoad: ({ location }) => {
    const { auth } = useAuthStore.getState()
    const user = auth.user
    const token = auth.accessToken

    if (!token || !user) {
      throw redirect({
        to: '/sign-in',
        search: { redirect: location.href },
      })
    }

    if (user.mustChangePassword && location.pathname !== '/settings/security') {
      throw redirect({
        to: '/settings/security',
      })
    }

    const path = location.pathname
    if (!isRouteAllowed(user.permissions, user.role, path)) {
      throw redirect({
        to: '/403',
      })
    }
  },
  component: AuthenticatedLayout,
})
