import { ColumnDef } from '@tanstack/react-table'
import { Checkbox } from '@/components/ui/checkbox'
import { DataTableColumnHeader } from '@/components/data-table'
import { Plan } from '@/hooks/use-plans'
import { DataTableRowActions } from './data-table-row-actions'

const formatCurrency = (amount: string | number | null | undefined) => {
  if (amount === null || amount === undefined || amount === '') return '—'
  return Number(amount).toLocaleString()
}

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
      <div className='min-w-[150px] truncate font-semibold'>{row.getValue('planName')}</div>
    ),
  },
  {
    accessorKey: 'inpatientLimit',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Inpatient' className='justify-center' />
    ),
    cell: ({ row }) => {
      return <div className='text-center font-mono text-xs'>{formatCurrency(row.getValue('inpatientLimit'))}</div>
    },
  },
  {
    accessorKey: 'outpatientLimit',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Outpatient' className='justify-center' />
    ),
    cell: ({ row }) => {
      return <div className='text-center font-mono text-xs'>{formatCurrency(row.getValue('outpatientLimit'))}</div>
    },
  },
  {
    accessorKey: 'maternityLimit',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Maternity' className='justify-center' />
    ),
    cell: ({ row }) => {
      return <div className='text-center font-mono text-xs'>{formatCurrency(row.getValue('maternityLimit'))}</div>
    },
  },
  {
    accessorKey: 'm0',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='M' className='justify-center' />
    ),
    cell: ({ row }) => {
      return <div className='text-center font-mono text-xs text-primary font-bold'>{formatCurrency(row.getValue('m0'))}</div>
    },
  },
  {
    accessorKey: 'm1',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='M+1' className='justify-center' />
    ),
    cell: ({ row }) => {
      return <div className='text-center font-mono text-xs'>{formatCurrency(row.getValue('m1'))}</div>
    },
  },
  {
    accessorKey: 'm2',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='M+2' className='justify-center' />
    ),
    cell: ({ row }) => {
      return <div className='text-center font-mono text-xs'>{formatCurrency(row.getValue('m2'))}</div>
    },
  },
  {
    accessorKey: 'm3',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='M+3' className='justify-center' />
    ),
    cell: ({ row }) => {
      return <div className='text-center font-mono text-xs'>{formatCurrency(row.getValue('m3'))}</div>
    },
  },
  {
    accessorKey: 'm4',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='M+4' className='justify-center' />
    ),
    cell: ({ row }) => {
      return <div className='text-center font-mono text-xs'>{formatCurrency(row.getValue('m4'))}</div>
    },
  },
  {
    accessorKey: 'm5',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='M+5' className='justify-center' />
    ),
    cell: ({ row }) => {
      return <div className='text-center font-mono text-xs'>{formatCurrency(row.getValue('m5'))}</div>
    },
  },
  {
    accessorKey: 'm6',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='M+6' className='justify-center' />
    ),
    cell: ({ row }) => {
      return <div className='text-center font-mono text-xs'>{formatCurrency(row.getValue('m6'))}</div>
    },
  },
  {
    accessorKey: 'extra',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Extra' className='justify-center' />
    ),
    cell: ({ row }) => {
      return <div className='text-center font-mono text-xs'>{formatCurrency(row.getValue('extra'))}</div>
    },
  },
  {
    id: 'actions',
    cell: ({ row }) => <DataTableRowActions row={row} />,
  },
]
