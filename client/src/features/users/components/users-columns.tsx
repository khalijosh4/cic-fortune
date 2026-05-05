import { ColumnDef } from '@tanstack/react-table'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { DataTableColumnHeader } from '@/components/data-table'
import { User } from '@/hooks/use-users'
import { DataTableRowActions } from './data-table-row-actions'

const roleColor: Record<string, string> = {
  admin: 'bg-violet-100 text-violet-800 dark:bg-violet-900/30 dark:text-violet-300',
  user: 'bg-sky-100 text-sky-800 dark:bg-sky-900/30 dark:text-sky-300',
  hospital: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300',
}

export const usersColumns: ColumnDef<User>[] = [
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
    id: 'fullName',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Name' />
    ),
    cell: ({ row }) => {
      const first = row.original.firstName || ''
      const last = row.original.lastName || ''
      return (
        <div className='max-w-[200px] truncate font-medium'>
          {`${first} ${last}`.trim() || '—'}
        </div>
      )
    },
  },
  {
    accessorKey: 'email',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Email' />
    ),
    cell: ({ row }) => (
      <div className='max-w-[200px] truncate text-muted-foreground'>
        {row.getValue('email') || '—'}
      </div>
    ),
  },
  {
    accessorKey: 'phoneNumber',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Phone' />
    ),
    cell: ({ row }) => <div>{row.getValue('phoneNumber') || '—'}</div>,
  },
  {
    accessorKey: 'role',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Role' />
    ),
    cell: ({ row }) => {
      const role = row.getValue('role') as string;
      return (
        <Badge
          variant='outline'
          className={`capitalize ${roleColor[role] ?? ''}`}
        >
          {role || '—'}
        </Badge>
      )
    },
  },
  {
    accessorKey: 'branchName',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Branch' />
    ),
    cell: ({ row }) => {
      const branchName = row.getValue('branchName') as string;
      return (
        <div className='max-w-[150px] truncate text-muted-foreground'>
          {branchName || '—'}
        </div>
      )
    },
  },
  {
    id: 'actions',
    cell: ({ row }) => <DataTableRowActions row={row} />,
  },
]
