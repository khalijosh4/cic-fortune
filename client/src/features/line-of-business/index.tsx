import { getRouteApi } from '@tanstack/react-router'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { useLobs } from '@/hooks/use-lobs'
import { QueryError } from '@/components/query-error'
import { LobTable } from './components/lob-table'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'

const route = getRouteApi('/_authenticated/line-of-business/')

export function LineOfBusinessList() {
  const search = route.useSearch()
  const navigate = route.useNavigate()

  const { data, isLoading, error } = useLobs()

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
            <h2 className='text-2xl font-bold tracking-tight'>Lines of Business</h2>
            <p className='text-muted-foreground'>
              Manage insurance product lines offered by the organization.
            </p>
          </div>
          <Button className='space-x-1' onClick={() => navigate({ to: '/line-of-business/new' })}>
            <span>New LOB</span> <Plus size={18} />
          </Button>
        </div>

        {isLoading ? (
          <div className='flex h-64 w-full items-center justify-center'>
            <div className='flex flex-col items-center gap-2'>
              <div className='h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent' />
              <p className='text-sm text-muted-foreground'>Loading...</p>
            </div>
          </div>
        ) : error ? (
          <QueryError error={error} />
        ) : (
          <LobTable data={data?.data || []} total={data?.total || 0} search={search as any} navigate={navigate as any} />
        )}
      </Main>
    </>
  )
}
