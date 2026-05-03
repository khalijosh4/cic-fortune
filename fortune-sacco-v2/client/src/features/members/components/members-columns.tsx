import { ColumnDef } from '@tanstack/react-table'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { DataTableColumnHeader } from '@/components/data-table'
import { Member } from '@/hooks/use-members'
import { DataTableRowActions } from './data-table-row-actions'

const statusColor: Record<string, string> = {
  active: 'bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-300',
  expired: 'bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-300',
  pending: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300',
}

export const membersColumns: ColumnDef<Member>[] = [
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
    id: 'name',
    accessorFn: (row) => `${row.firstName} ${row.lastName}`,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Name' />
    ),
    cell: ({ row }) => (
      <div className='max-w-[200px] truncate font-medium'>{row.getValue('name')}</div>
    ),
    enableSorting: true,
    enableHiding: false,
  },
  {
    accessorKey: 'coverType',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Cover Type' />
    ),
    cell: ({ row }) => (
      <div className='capitalize'>{row.getValue('coverType') || '—'}</div>
    ),
  },
  {
    accessorKey: 'premiumRate',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Premium Rate (KES)' />
    ),
    cell: ({ row }) => {
      const rate = row.getValue('premiumRate') as string | number;
      return <div>{rate ? Number(rate).toLocaleString() : '0'}</div>
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
    accessorKey: 'usedAnnualLimit',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Used Limit (KES)' />
    ),
    cell: ({ row }) => {
      const limit = row.getValue('usedAnnualLimit') as string | number;
      return <div>{limit ? Number(limit).toLocaleString() : '0'}</div>
    },
  },
  {
    id: 'actions',
    cell: ({ row }) => <DataTableRowActions row={row} />,
  },
]
