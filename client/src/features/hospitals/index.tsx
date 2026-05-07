import { getRouteApi } from '@tanstack/react-router'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { useHospitals } from '@/hooks/use-hospitals'
import { useHospitalStats } from '@/hooks/use-stats'
import { QueryError } from '@/components/query-error'
import { HospitalsTable } from './components/hospitals-table'
import { StatsCard } from '@/components/stats-card'
import { Button } from '@/components/ui/button'
import { Plus, Building2, Stethoscope, Building, Activity } from 'lucide-react'

const route = getRouteApi('/_authenticated/hospitals/')

export function Hospitals() {
  const search = route.useSearch()
  const navigate = route.useNavigate()

  const page = search.page || 1
  const pageSize = search.pageSize || 20

  const { data, isLoading, error } = useHospitals(pageSize, (page - 1) * pageSize, search)
  const { data: stats, isLoading: statsLoading } = useHospitalStats()

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
            <h2 className='text-2xl font-bold tracking-tight'>Hospitals</h2>
            <p className='text-muted-foreground'>
              Manage healthcare providers and their service levels.
            </p>
          </div>
          <Button className='space-x-1' onClick={() => navigate({ to: '/hospitals/new' })}>
            <span>New Hospital</span> <Plus size={18} />
          </Button>
        </div>

        <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-4'>
          <StatsCard
            title='Total Hospitals'
            value={stats?.total ?? 0}
            description='All registered providers'
            icon={Building2}
            iconClassName='bg-blue-500/10 text-blue-500'
            isLoading={statsLoading}
          />
          <StatsCard
            title='Private'
            value={stats?.byType?.private ?? 0}
            description='Private facilities'
            icon={Building}
            iconClassName='bg-emerald-500/10 text-emerald-500'
            isLoading={statsLoading}
          />
          <StatsCard
            title='Public / County'
            value={(stats?.byType?.public ?? 0) + (stats?.byType?.county ?? 0)}
            description='Public and county hospitals'
            icon={Stethoscope}
            iconClassName='bg-amber-500/10 text-amber-500'
            isLoading={statsLoading}
          />
          <StatsCard
            title='Specialist / Teaching'
            value={(stats?.byType?.specialist ?? 0) + (stats?.byType?.teaching ?? 0)}
            description='Advanced care facilities'
            icon={Activity}
            iconClassName='bg-purple-500/10 text-purple-500'
            isLoading={statsLoading}
          />
        </div>

        {isLoading ? (
          <div className='flex h-64 w-full items-center justify-center'>
            <div className='flex flex-col items-center gap-2'>
              <div className='h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent' />
              <p className='text-sm text-muted-foreground'>Loading hospitals...</p>
            </div>
          </div>
        ) : error ? (
          <QueryError error={error} />
        ) : (
          <HospitalsTable data={data?.data || []} total={data?.total || 0} search={search} navigate={navigate} />
        )}
      </Main>
    </>
  )
}
