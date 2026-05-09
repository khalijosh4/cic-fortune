import { getRouteApi } from '@tanstack/react-router'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { useUsers } from '@/hooks/use-users'
import { useAuthStore } from '@/stores/auth-store'
import { getFeatureFlags } from '@/lib/permissions'
import { QueryError } from '@/components/query-error'
import { UsersTable } from './components/users-table'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'

const route = getRouteApi('/_authenticated/users/')

export function Users() {
  const search = route.useSearch()
  const navigate = route.useNavigate()
  const { auth } = useAuthStore()
  const permissions = getFeatureFlags(auth.user?.role as any, 'users')

  const page = search.page || 1
  const pageSize = search.pageSize || 20

  const { data, isLoading, error } = useUsers(pageSize, (page - 1) * pageSize, search)

  return (
    <>
      <Header fixed>
        <Search className='me-auto' />
        <ThemeSwitch />
        <ProfileDropdown />
      </Header>

      <Main className='flex flex-1 flex-col gap-4 sm:gap-6'>
        <div className='flex flex-wrap items-end justify-between gap-2'>
          <div>
            <h2 className='text-2xl font-bold tracking-tight'>User Management</h2>
            <p className='text-muted-foreground'>
              Manage employee accounts and their system roles.
            </p>
          </div>
          {permissions.canCreate && (
            <Button className='space-x-1' onClick={() => navigate({ to: '/users/new' })}>
              <span>New User</span> <Plus size={18} />
            </Button>
          )}
        </div>
        {data && (
          <p className='text-sm text-muted-foreground'>
            {data.total.toLocaleString()} total users
          </p>
        )}

        {isLoading ? (
          <div className='flex h-64 w-full items-center justify-center'>
            <div className='flex flex-col items-center gap-2'>
              <div className='h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent' />
              <p className='text-sm text-muted-foreground'>Loading users...</p>
            </div>
          </div>
        ) : error ? (
          <QueryError error={error} />
        ) : (
          <UsersTable data={data?.data || []} total={data?.total || 0} search={search} navigate={navigate} />
        )}
      </Main>
    </>
  )
}
