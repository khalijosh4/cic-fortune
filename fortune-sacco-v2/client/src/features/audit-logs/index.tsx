import { getRouteApi } from '@tanstack/react-router'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { useAuditLogs } from '@/hooks/use-audit-logs'
import { QueryError } from '@/components/query-error'
import { AuditLogsTable } from './components/audit-logs-table'

const route = getRouteApi('/_authenticated/audit-logs/')

export function AuditLogs() {
  const search = route.useSearch()
  const navigate = route.useNavigate()

  const page = search.page || 1
  const pageSize = search.pageSize || 20
  
  const { data, isLoading, error } = useAuditLogs(pageSize, (page - 1) * pageSize)

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
            <h2 className='text-2xl font-bold tracking-tight'>Audit Logs</h2>
            <p className='text-muted-foreground'>
              Track all system activity and user actions.
            </p>
          </div>
          {data && (
            <p className='text-sm text-muted-foreground'>
              {data.total.toLocaleString()} total events
            </p>
          )}
        </div>

        {isLoading ? (
          <div className='flex h-64 w-full items-center justify-center'>
            <div className='flex flex-col items-center gap-2'>
              <div className='h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent' />
              <p className='text-sm text-muted-foreground'>Loading audit logs...</p>
            </div>
          </div>
        ) : error ? (
          <QueryError error={error} />
        ) : (
          <AuditLogsTable data={data?.data || []} total={data?.total || 0} search={search} navigate={navigate} />
        )}
      </Main>
    </>
  )
}
