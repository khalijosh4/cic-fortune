import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { usePremiums } from '@/hooks/use-premiums'
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

export function Premiums() {
  const [page, setPage] = useState(1)
  const pageSize = 20
  const { data, isLoading, error } = usePremiums(pageSize, (page - 1) * pageSize)

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
          {data && (
            <p className='text-sm text-muted-foreground'>
              {data.total.toLocaleString()} total records
            </p>
          )}
        </div>

        {isLoading ? (
          <div className='flex h-64 w-full items-center justify-center'>
            <div className='flex flex-col items-center gap-2'>
              <div className='h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent' />
              <p className='text-sm text-muted-foreground'>Loading premiums...</p>
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
                    <TableHead>Amount Due (KES)</TableHead>
                    <TableHead>Amount Paid (KES)</TableHead>
                    <TableHead>Balance (KES)</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Payment Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data?.data.map((premium) => {
                    const due = Number(premium.amountDue)
                    const paid = Number(premium.amountPaid ?? 0)
                    const balance = due - paid
                    const isPaid = balance <= 0

                    return (
                      <TableRow key={premium.id}>
                        <TableCell className='font-medium'>
                          {due.toLocaleString()}
                        </TableCell>
                        <TableCell>{paid.toLocaleString()}</TableCell>
                        <TableCell
                          className={balance > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-teal-600 dark:text-teal-400'}
                        >
                          {balance > 0 ? balance.toLocaleString() : '0'}
                        </TableCell>
                        <TableCell className='text-xs text-muted-foreground'>
                          {new Date(premium.dueDate).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant='outline'
                            className={isPaid
                              ? 'bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-300'
                              : 'bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-300'
                            }
                          >
                            {isPaid ? 'Paid' : 'Outstanding'}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    )
                  })}
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
