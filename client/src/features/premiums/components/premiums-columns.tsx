import { ColumnDef } from '@tanstack/react-table'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { cn } from '@/lib/utils'
import { DataTableColumnHeader } from '@/components/data-table'
import { Premium } from '@/hooks/use-premiums'
import { DataTableRowActions } from './data-table-row-actions'

export const premiumsColumns: ColumnDef<Premium>[] = [
  {
    id: 'select',
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && 'indeterminate')
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label='Select all'
        className='translate-y-[2px]'
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label='Select row'
        className='translate-y-[2px]'
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: 'id',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='ID' />
    ),
    cell: ({ row }) => (
      <div className='w-[100px] font-mono text-xs uppercase'>
        {row.getValue('id') || '—'}
      </div>
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: 'amountDue',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Amount Due (KES)' className='justify-center' />
    ),
    cell: ({ row }) => {
      const amount = row.getValue('amountDue') as string | number;
      return <div className='font-medium text-center'>{amount ? Number(amount).toLocaleString() : '0'}</div>
    },
  },
  {
    accessorKey: 'amountPaid',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Amount Paid (KES)' className='justify-center' />
    ),
    cell: ({ row }) => {
      const amount = row.getValue('amountPaid') as string | number;
      return <div className='text-center'>{amount ? Number(amount).toLocaleString() : '0'}</div>
    },
  },
  {
    id: 'balance',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Balance (KES)' className='justify-center' />
    ),
    cell: ({ row }) => {
      const due = Number(row.getValue('amountDue') ?? 0);
      const paid = Number(row.getValue('amountPaid') ?? 0);
      const balance = due - paid;
      return (
        <div className={cn(
          'text-center',
          balance > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-teal-600 dark:text-teal-400'
        )}>
          {balance > 0 ? balance.toLocaleString() : '0'}
        </div>
      )
    },
  },
  {
    accessorKey: 'dueDate',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Due Date' />
    ),
    cell: ({ row }) => {
      const dateStr = row.getValue('dueDate') as string;
      return (
        <div className='text-xs text-muted-foreground'>
          {dateStr ? new Date(dateStr).toLocaleDateString() : '—'}
        </div>
      )
    },
  },
  {
    id: 'status',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Payment Status' />
    ),
    cell: ({ row }) => {
      const due = Number(row.getValue('amountDue') ?? 0);
      const paid = Number(row.getValue('amountPaid') ?? 0);
      const balance = due - paid;
      const isPaid = balance <= 0;

      return (
        <Badge
          variant='outline'
          className={isPaid
            ? 'bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-300'
            : 'bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-300'
          }
        >
          {isPaid ? 'Paid' : 'Outstanding'}
        </Badge>
      )
    },
  },
  {
    id: 'actions',
    cell: ({ row }) => <DataTableRowActions row={row} />,
  },
]
