import { getRouteApi } from '@tanstack/react-router'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { useBranches } from '@/hooks/use-branches'
import { useBranchStats } from '@/hooks/use-stats'
import { QueryError } from '@/components/query-error'
import { BranchesTable } from './components/branches-table'
import { StatsCard } from '@/components/stats-card'
import { Button } from '@/components/ui/button'
import { Plus, GitBranch, Users, FileText, TrendingUp } from 'lucide-react'

const route = getRouteApi('/_authenticated/branches/')

export function Branches() {
  const search = route.useSearch()
  const navigate = route.useNavigate()

  const page = search.page || 1
  const pageSize = search.pageSize || 20

  const { data, isLoading, error } = useBranches(pageSize, (page - 1) * pageSize, search)
  const { data: stats, isLoading: statsLoading } = useBranchStats()

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
          <Button className='space-x-1' onClick={() => navigate({ to: '/branches/new' })}>
            <span>New Branch</span> <Plus size={18} />
          </Button>
        </div>

        <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-4'>
          <StatsCard
            title='Total Branches'
            value={stats?.total ?? 0}
            description='Active Sacco branches'
            icon={GitBranch}
            iconClassName='bg-blue-500/10 text-blue-500'
            isLoading={statsLoading}
          />
          <StatsCard
            title='Total Members'
            value={stats?.totalMembers ?? 0}
            description='Enrolled across all branches'
            icon={Users}
            iconClassName='bg-emerald-500/10 text-emerald-500'
            isLoading={statsLoading}
          />
          <StatsCard
            title='Avg. Members / Branch'
            value={stats?.avgMembers ?? 0}
            description='Average enrollment per branch'
            icon={TrendingUp}
            iconClassName='bg-amber-500/10 text-amber-500'
            isLoading={statsLoading}
          />
          <StatsCard
            title='Total Claims Filed'
            value={stats?.totalClaims ?? 0}
            description='Claims across all branches'
            icon={FileText}
            iconClassName='bg-rose-500/10 text-rose-500'
            isLoading={statsLoading}
          />
        </div>

        {isLoading ? (
          <div className='flex h-64 w-full items-center justify-center'>
            <div className='flex flex-col items-center gap-2'>
              <div className='h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent' />
              <p className='text-sm text-muted-foreground'>Loading branches...</p>
            </div>
          </div>
        ) : error ? (
          <QueryError error={error} />
        ) : (
          <BranchesTable data={data?.data || []} total={data?.total || 0} search={search} navigate={navigate} />
        )}
      </Main>
    </>
  )
}
