import { getRouteApi } from '@tanstack/react-router'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { useClaims } from '@/hooks/use-claims'
import { GeneralError } from '@/features/errors/general-error'
import { ClaimsTable } from './components/claims-table'

const route = getRouteApi('/_authenticated/claims/')

export function Claims() {
  const search = route.useSearch()
  const navigate = route.useNavigate()

  const page = search.page || 1
  const pageSize = search.pageSize || 20
  
  const { data, isLoading, error } = useClaims(pageSize, (page - 1) * pageSize)

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
            <h2 className='text-2xl font-bold tracking-tight'>Claims</h2>
            <p className='text-muted-foreground'>
              View and manage all insurance claims.
            </p>
          </div>
          {data && (
            <p className='text-sm text-muted-foreground'>
              {data.total.toLocaleString()} total claims
            </p>
          )}
        </div>

        {isLoading ? (
          <div className='flex h-64 w-full items-center justify-center'>
            <div className='flex flex-col items-center gap-2'>
              <div className='h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent' />
              <p className='text-sm text-muted-foreground'>Loading claims...</p>
            </div>
          </div>
        ) : error ? (
          <GeneralError />
        ) : (
          <ClaimsTable data={data?.data || []} search={search} navigate={navigate} />
        )}
      </Main>
    </>
  )
}
