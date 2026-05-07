import { getRouteApi } from '@tanstack/react-router'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { usePlans } from '@/hooks/use-plans'
import { QueryError } from '@/components/query-error'
import { PlansTable } from './components/plans-table'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'

const route = getRouteApi('/_authenticated/plans/')

export function Plans() {
  const search = route.useSearch()
  const navigate = route.useNavigate()

  const page = search.page || 1
  const pageSize = search.pageSize || 20
  
  const { data, isLoading, error } = usePlans(pageSize, (page - 1) * pageSize, search)

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
            <h2 className='text-2xl font-bold tracking-tight'>Plans</h2>
            <p className='text-muted-foreground'>
              Configure insurance plans and coverage limits.
            </p>
          </div>
          <Button className='space-x-1' onClick={() => navigate({ to: '/plans/new' })}>
            <span>New Plan</span> <Plus size={18} />
          </Button>
        </div>
        {data && (
          <p className='text-sm text-muted-foreground'>
            {data.total.toLocaleString()} total plans
          </p>
        )}

        {isLoading ? (
          <div className='flex h-64 w-full items-center justify-center'>
            <div className='flex flex-col items-center gap-2'>
              <div className='h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent' />
              <p className='text-sm text-muted-foreground'>Loading plans...</p>
            </div>
          </div>
        ) : error ? (
          <QueryError error={error} />
        ) : (
          <PlansTable data={data?.data || []} total={data?.total || 0} search={search} navigate={navigate} />
        )}
      </Main>
    </>
  )
}
