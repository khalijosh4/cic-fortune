import { getRouteApi } from '@tanstack/react-router'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { useBranches } from '@/hooks/use-branches'
import { GeneralError } from '@/features/errors/general-error'
import { BranchesTable } from './components/branches-table'

const route = getRouteApi('/_authenticated/branches/')

export function Branches() {
  const search = route.useSearch()
  const navigate = route.useNavigate()

  const page = search.page || 1
  const pageSize = search.pageSize || 20

  const { data, isLoading, error } = useBranches(pageSize, (page - 1) * pageSize)

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
            <h2 className='text-2xl font-bold tracking-tight'>Branches</h2>
            <p className='text-muted-foreground'>
              Overview of all Fortune Sacco branches and their performance.
            </p>
          </div>
        </div>
        {isLoading ? (
          <div className='flex h-svh w-full items-center justify-center'>
            <div className='flex flex-col items-center gap-2'>
              <div className='h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent'></div>
              <p className='text-sm text-muted-foreground'>Loading branches...</p>
            </div>
          </div>
        ) : error ? (
          <GeneralError />
        ) : (
          <BranchesTable data={data?.data || []} search={search} navigate={navigate} />
        )}
      </Main>
    </>
  )
}
