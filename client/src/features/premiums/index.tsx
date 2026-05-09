import { getRouteApi } from '@tanstack/react-router'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { usePremiums } from '@/hooks/use-premiums'
import { usePremiumStats } from '@/hooks/use-stats'
import { QueryError } from '@/components/query-error'
import { PremiumsTable } from './components/premiums-table'
import { Stats02 } from '@/components/stats-02'
import { formatCurrency } from '@/lib/utils'

const route = getRouteApi('/_authenticated/premiums/')

export function Premiums() {
  const search = route.useSearch()
  const navigate = route.useNavigate()

  const page = search.page || 1
  const pageSize = search.pageSize || 20

  const { data, isLoading, error } = usePremiums(pageSize, (page - 1) * pageSize, search)
  const { data: stats, isLoading: statsLoading } = usePremiumStats()

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
            <h2 className='text-2xl font-bold tracking-tight'>Premiums</h2>
            <p className='text-muted-foreground'>
              Track premium payments and outstanding balances.
            </p>
          </div>
        </div>

        <Stats02
          stats={[
            { metric: 'Total Due', current: stats ? formatCurrency(stats.totalDue) : '—', previous: 'billed' },
            { metric: 'Total Collected', current: stats ? formatCurrency(stats.totalPaid) : '—', previous: 'received' },
            { metric: 'Outstanding', current: stats ? formatCurrency(stats.outstanding) : '—', previous: 'to collect' },
            { metric: 'Collection Rate', current: stats ? `${stats.collectionRate}%` : '—' },
          ]}
          isLoading={statsLoading}
        />

        {isLoading ? (
          <div className='flex h-64 w-full items-center justify-center'>
            <div className='flex flex-col items-center gap-2'>
              <div className='h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent' />
              <p className='text-sm text-muted-foreground'>Loading premiums...</p>
            </div>
          </div>
        ) : error ? (
          <QueryError error={error} />
        ) : (
          <PremiumsTable data={data?.data || []} total={data?.total || 0} search={search} navigate={navigate} />
        )}
      </Main>
    </>
  )
}
