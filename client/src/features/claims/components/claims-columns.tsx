import { ColumnDef } from '@tanstack/react-table'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { DataTableColumnHeader } from '@/components/data-table'
import { Claim } from '@/hooks/use-claims'
import { DataTableRowActions } from './data-table-row-actions'

const statusColor: Record<string, string> = {
  approved: 'bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-300',
  rejected: 'bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-300',
  pending: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300',
}

export const claimsColumns: ColumnDef<Claim>[] = [
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
    accessorKey: 'amountClaimed',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Amount Claimed (KES)' className='justify-center' />
    ),
    cell: ({ row }) => {
      const amount = row.getValue('amountClaimed') as string | number;
      return <div className='text-center'>{amount ? Number(amount).toLocaleString() : '0'}</div>
    },
  },
  {
    accessorKey: 'amountApproved',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Amount Approved (KES)' className='justify-center' />
    ),
    cell: ({ row }) => {
      const amount = row.getValue('amountApproved') as string | number;
      return <div className='text-center'>{amount ? Number(amount).toLocaleString() : '—'}</div>
    },
  },
  {
    accessorKey: 'status',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Status' />
    ),
    cell: ({ row }) => {
      const status = row.getValue('status') as string;
      return (
        <Badge
          variant='outline'
          className={`capitalize ${statusColor[status] ?? ''}`}
        >
          {status || '—'}
        </Badge>
      )
    },
  },
  {
    accessorKey: 'diagnosis',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Diagnosis' />
    ),
    cell: ({ row }) => (
      <div className='max-w-[200px] truncate text-sm text-muted-foreground'>
        {row.getValue('diagnosis') || '—'}
      </div>
    ),
  },
  {
    accessorKey: 'createdAt',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Date' />
    ),
    cell: ({ row }) => {
      const dateStr = row.getValue('createdAt') as string;
      return (
        <div className='text-xs text-muted-foreground'>
          {dateStr ? new Date(dateStr).toLocaleDateString() : '—'}
        </div>
      )
    },
  },
  {
    id: 'actions',
    cell: ({ row }) => <DataTableRowActions row={row} />,
  },
]
