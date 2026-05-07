import { getRouteApi } from '@tanstack/react-router'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { useClaims } from '@/hooks/use-claims'
import { useClaimStats } from '@/hooks/use-stats'
import { QueryError } from '@/components/query-error'
import { ClaimsTable } from './components/claims-table'
import { StatsCard } from '@/components/stats-card'
import { FileText, CheckCircle, Clock, XCircle } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

const route = getRouteApi('/_authenticated/claims/')

export function Claims() {
  const search = route.useSearch()
  const navigate = route.useNavigate()

  const page = search.page || 1
  const pageSize = search.pageSize || 20

  const { data, isLoading, error } = useClaims(pageSize, (page - 1) * pageSize, search)
  const { data: stats, isLoading: statsLoading } = useClaimStats()

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
        </div>

        <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-4'>
          <StatsCard
            title='Total Claims'
            value={stats?.total ?? 0}
            description={stats ? `${formatCurrency(stats.totalAmountClaimed)} claimed` : ''}
            icon={FileText}
            iconClassName='bg-blue-500/10 text-blue-500'
            isLoading={statsLoading}
          />
          <StatsCard
            title='Approved'
            value={stats?.approved ?? 0}
            description={stats ? `${formatCurrency(stats.totalAmountApproved)} paid out` : ''}
            icon={CheckCircle}
            iconClassName='bg-emerald-500/10 text-emerald-500'
            isLoading={statsLoading}
          />
          <StatsCard
            title='Pending'
            value={stats?.pending ?? 0}
            description='Awaiting review'
            icon={Clock}
            iconClassName='bg-amber-500/10 text-amber-500'
            isLoading={statsLoading}
          />
          <StatsCard
            title='Rejected'
            value={stats?.rejected ?? 0}
            description='Declined claims'
            icon={XCircle}
            iconClassName='bg-rose-500/10 text-rose-500'
            isLoading={statsLoading}
          />
        </div>

        {isLoading ? (
          <div className='flex h-64 w-full items-center justify-center'>
            <div className='flex flex-col items-center gap-2'>
              <div className='h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent' />
              <p className='text-sm text-muted-foreground'>Loading claims...</p>
            </div>
          </div>
        ) : error ? (
          <QueryError error={error} />
        ) : (
          <ClaimsTable data={data?.data || []} total={data?.total || 0} search={search} navigate={navigate} />
        )}
      </Main>
    </>
  )
}
