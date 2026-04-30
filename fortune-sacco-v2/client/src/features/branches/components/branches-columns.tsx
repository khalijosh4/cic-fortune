import { ColumnDef } from '@tanstack/react-table'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { DataTableColumnHeader } from '@/components/data-table'
import { Branch } from '@/hooks/use-branches'

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
      <div className='w-[150px] font-medium'>{row.getValue('branchName')}</div>
    ),
    enableSorting: true,
    enableHiding: false,
  },
  {
    accessorKey: 'totalMembers',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Members' />
    ),
    cell: ({ row }) => (
      <Badge variant='outline'>{row.getValue('totalMembers')}</Badge>
    ),
  },
  {
    accessorKey: 'totalPolicies',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Policies' />
    ),
    cell: ({ row }) => (
      <div className='flex items-center'>
        <span>{row.getValue('totalPolicies')}</span>
      </div>
    ),
  },
  {
    accessorKey: 'totalActivePolicies',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Active Policies' />
    ),
    cell: ({ row }) => (
      <div className='flex items-center'>
        <span className='text-green-600 font-semibold'>{row.getValue('totalActivePolicies')}</span>
      </div>
    ),
  },
  {
    accessorKey: 'totalClaims',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Claims' />
    ),
    cell: ({ row }) => (
      <div className='flex items-center'>
        <span>{row.getValue('totalClaims')}</span>
      </div>
    ),
  },
]
