import { ColumnDef } from '@tanstack/react-table'
import { Checkbox } from '@/components/ui/checkbox'
import { DataTableColumnHeader } from '@/components/data-table'
import { Plan } from '@/hooks/use-plans'
import { DataTableRowActions } from './data-table-row-actions'

export const plansColumns: ColumnDef<Plan>[] = [
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
    accessorKey: 'planName',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Plan Name' />
    ),
    cell: ({ row }) => (
      <div className='max-w-[200px] truncate font-medium'>{row.getValue('planName')}</div>
    ),
  },
  {
    accessorKey: 'inpatientLimit',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Inpatient (KES)' className='justify-end' />
    ),
    cell: ({ row }) => {
      const amount = row.getValue('inpatientLimit') as string | number;
      return <div className='text-right font-mono'>{amount ? Number(amount).toLocaleString() : '—'}</div>
    },
  },
  {
    accessorKey: 'outpatientLimit',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Outpatient (KES)' className='justify-end' />
    ),
    cell: ({ row }) => {
      const amount = row.getValue('outpatientLimit') as string | number;
      return <div className='text-right font-mono'>{amount ? Number(amount).toLocaleString() : '—'}</div>
    },
  },
  {
    accessorKey: 'm0',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='M (Single Rate)' className='justify-end' />
    ),
    cell: ({ row }) => {
      const amount = row.getValue('m0') as string | number;
      return <div className='text-right font-mono text-primary'>{amount ? Number(amount).toLocaleString() : '0'}</div>
    },
  },
  {
    id: 'actions',
    cell: ({ row }) => <DataTableRowActions row={row} />,
  },
]
