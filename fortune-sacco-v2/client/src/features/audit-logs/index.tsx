import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { useAuditLogs } from '@/hooks/use-audit-logs'
import { GeneralError } from '@/features/errors/general-error'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useState } from 'react'

export function AuditLogs() {
  const [page, setPage] = useState(1)
  const pageSize = 20
  const { data, isLoading, error } = useAuditLogs(pageSize, (page - 1) * pageSize)

  const statusColor: Record<string, string> = {
    Success: 'bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-300',
    Failure: 'bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-300',
  }

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
          <GeneralError />
        ) : (
          <>
            <div className='overflow-hidden rounded-md border'>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Timestamp</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead>Module</TableHead>
                    <TableHead>IP Address</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data?.data.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell className='text-xs text-muted-foreground whitespace-nowrap'>
                        {log.timestamp
                          ? new Date(log.timestamp).toLocaleString()
                          : '—'}
                      </TableCell>
                      <TableCell>
                        <div className='flex flex-col'>
                          <span className='text-sm font-medium'>{log.userEmail ?? '—'}</span>
                          <span className='text-xs text-muted-foreground capitalize'>
                            {log.userRole ?? ''}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className='max-w-xs truncate text-sm'>
                        {log.action}
                      </TableCell>
                      <TableCell>
                        <Badge variant='outline' className='capitalize text-xs'>
                          {log.module ?? '—'}
                        </Badge>
                      </TableCell>
                      <TableCell className='text-xs text-muted-foreground'>
                        {log.ipAddress ?? '—'}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant='outline'
                          className={statusColor[log.status ?? ''] ?? ''}
                        >
                          {log.status ?? '—'}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            <div className='flex items-center justify-between text-sm text-muted-foreground'>
              <span>Page {page} of {Math.ceil((data?.total ?? 0) / pageSize)}</span>
              <div className='flex gap-2'>
                <button
                  className='rounded border px-3 py-1 disabled:opacity-50'
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  Previous
                </button>
                <button
                  className='rounded border px-3 py-1 disabled:opacity-50'
                  onClick={() => setPage((p) => p + 1)}
                  disabled={page >= Math.ceil((data?.total ?? 0) / pageSize)}
                >
                  Next
                </button>
              </div>
            </div>
          </>
        )}
      </Main>
    </>
  )
}
