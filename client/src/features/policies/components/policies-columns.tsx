import { ColumnDef } from '@tanstack/react-table'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { DataTableColumnHeader } from '@/components/data-table'
import { Policy } from '@/hooks/use-policies'
import { DataTableRowActions } from './data-table-row-actions'

const statusColor: Record<string, string> = {
  active: 'bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-300',
  expired: 'bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-300',
  pending: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300',
}

export const policiesColumns: ColumnDef<Policy>[] = [
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
    accessorKey: 'name',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Policy Name' />
    ),
    cell: ({ row }) => (
      <div className='max-w-[200px] truncate font-medium'>{row.getValue('name')}</div>
    ),
  },
  {
    accessorKey: 'annualLimit',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Annual Limit (KES)' className='justify-center' />
    ),
    cell: ({ row }) => {
      const amount = row.getValue('annualLimit') as string | number;
      return <div className='text-center'>{amount ? Number(amount).toLocaleString() : '0'}</div>
    },
  },
  {
    accessorKey: 'outpatientLimit',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Outpatient (KES)' className='justify-center' />
    ),
    cell: ({ row }) => {
      const amount = row.getValue('outpatientLimit') as string | number;
      return <div className='text-center'>{amount ? Number(amount).toLocaleString() : '—'}</div>
    },
  },
  {
    accessorKey: 'inpatientLimit',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Inpatient (KES)' className='justify-center' />
    ),
    cell: ({ row }) => {
      const amount = row.getValue('inpatientLimit') as string | number;
      return <div className='text-center'>{amount ? Number(amount).toLocaleString() : '—'}</div>
    },
  },
  {
    accessorKey: 'maternityLimit',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Maternity (KES)' className='justify-center' />
    ),
    cell: ({ row }) => {
      const amount = row.getValue('maternityLimit') as string | number;
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
    id: 'actions',
    cell: ({ row }) => <DataTableRowActions row={row} />,
  },
]
