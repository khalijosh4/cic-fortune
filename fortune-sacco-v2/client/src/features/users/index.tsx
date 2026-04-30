import { getRouteApi } from '@tanstack/react-router'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { useUsers } from '@/hooks/use-users'
import { GeneralError } from '@/features/errors/general-error'
import { UsersTable } from './components/users-table'

const route = getRouteApi('/_authenticated/users/')

export function Users() {
  const search = route.useSearch()
  const navigate = route.useNavigate()

  const page = search.page || 1
  const pageSize = search.pageSize || 20

  const { data, isLoading, error } = useUsers(pageSize, (page - 1) * pageSize)

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
              Manage employees and their access roles.
            </p>
          </div>
          {data && (
            <p className='text-sm text-muted-foreground'>
              {data.total.toLocaleString()} total users
            </p>
          )}
        </div>

        {isLoading ? (
          <div className='flex h-64 w-full items-center justify-center'>
            <div className='flex flex-col items-center gap-2'>
              <div className='h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent' />
              <p className='text-sm text-muted-foreground'>Loading users...</p>
            </div>
          </div>
        ) : error ? (
          <GeneralError />
        ) : (
          <UsersTable data={data?.data || []} search={search} navigate={navigate} />
        )}
      </Main>
    </>
  )
}
