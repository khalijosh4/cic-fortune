import { ColumnDef } from '@tanstack/react-table'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { DataTableColumnHeader } from '@/components/data-table'
import { Branch } from '@/hooks/use-branches'
import { DataTableRowActions } from './data-table-row-actions'

export const branchesColumns: ColumnDef<Branch>[] = [
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
    accessorKey: 'branchName',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Branch Name' />
    ),
    cell: ({ row }) => (
      <div className='max-w-[200px] truncate font-medium'>{row.getValue('branchName')}</div>
    ),
    enableSorting: true,
    enableHiding: false,
  },
  {
    accessorKey: 'location',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Location' />
    ),
    cell: ({ row }) => (
      <div className='max-w-[200px] truncate'>{row.getValue('location')}</div>
    ),
  },
  {
    accessorKey: 'managerName',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Manager' />
    ),
    cell: ({ row }) => (
      <div className='max-w-[150px] truncate'>{row.getValue('managerName')}</div>
    ),
  },
  {
    accessorKey: 'totalMembers',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Members' className='justify-center' />
    ),
    cell: ({ row }) => (
      <div className='flex justify-center'>
        <Badge variant='outline'>{row.getValue('totalMembers')}</Badge>
      </div>
    ),
  },
  {
    accessorKey: 'totalPlans',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Plans' className='justify-center' />
    ),
    cell: ({ row }) => (
      <div className='flex justify-center items-center'>
        <span>{row.getValue('totalPlans')}</span>
      </div>
    ),
  },
  {
    accessorKey: 'totalActivePlans',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Active Plans' className='justify-center' />
    ),
    cell: ({ row }) => (
      <div className='flex justify-center items-center'>
        <span className='text-green-600 font-semibold'>{row.getValue('totalActivePlans')}</span>
      </div>
    ),
  },
  {
    accessorKey: 'totalClaims',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Claims' className='justify-center' />
    ),
    cell: ({ row }) => (
      <div className='flex justify-center items-center'>
        <span>{row.getValue('totalClaims')}</span>
      </div>
    ),
  },
  {
    id: 'actions',
    cell: ({ row }) => <DataTableRowActions row={row} />,
  },
]
