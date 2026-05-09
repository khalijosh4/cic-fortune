import { getRouteApi } from '@tanstack/react-router'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { useMembers } from '@/hooks/use-members'
import { useMemberStats } from '@/hooks/use-stats'
import { useAuthStore } from '@/stores/auth-store'
import { getFeatureFlags } from '@/lib/permissions'
import { QueryError } from '@/components/query-error'
import { MembersTable } from './components/members-table'
import { Stats02 } from '@/components/stats-02'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'

const route = getRouteApi('/_authenticated/members/')

export function Members() {
  const search = route.useSearch()
  const navigate = route.useNavigate()
  const { auth } = useAuthStore()
  const permissions = getFeatureFlags(auth.user?.permissions, 'members')

  const page = search.page || 1
  const pageSize = search.pageSize || 20

  const { data, isLoading, error } = useMembers(pageSize, (page - 1) * pageSize, search)
  const { data: stats, isLoading: statsLoading } = useMemberStats()

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
            <h2 className='text-2xl font-bold tracking-tight'>Members</h2>
            <p className='text-muted-foreground'>
              Manage planholders and their coverage status.
            </p>
          </div>
          {permissions.canCreate && (
            <Button className='space-x-1' onClick={() => navigate({ to: '/members/new' })}>
              <span>New Member</span> <Plus size={18} />
            </Button>
          )}
        </div>

        <Stats02
          stats={[
            { metric: 'Total Members', current: stats?.total ?? 0 },
            { metric: 'Active', current: stats?.active ?? 0 },
            { metric: 'Pending', current: stats?.pending ?? 0 },
            { metric: 'Expired', current: stats?.expired ?? 0 },
          ]}
          isLoading={statsLoading}
        />

        {isLoading ? (
          <div className='flex h-64 w-full items-center justify-center'>
            <div className='flex flex-col items-center gap-2'>
              <div className='h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent' />
              <p className='text-sm text-muted-foreground'>Loading members...</p>
            </div>
          </div>
        ) : error ? (
          <QueryError error={error} />
        ) : (
          <MembersTable data={data?.data || []} total={data?.total || 0} search={search} navigate={navigate} />
        )}
      </Main>
    </>
  )
}
