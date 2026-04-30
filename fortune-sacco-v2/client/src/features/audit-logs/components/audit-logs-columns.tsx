import { ColumnDef } from '@tanstack/react-table'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { DataTableColumnHeader } from '@/components/data-table'
import { AuditLog } from '@/hooks/use-audit-logs'

const statusColor: Record<string, string> = {
  Success: 'bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-300',
  Failure: 'bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-300',
}

export const auditLogsColumns: ColumnDef<AuditLog>[] = [
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
    accessorKey: 'timestamp',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Timestamp' />
    ),
    cell: ({ row }) => {
      const ts = row.getValue('timestamp') as string;
      return (
        <div className='text-xs text-muted-foreground whitespace-nowrap'>
          {ts ? new Date(ts).toLocaleString() : '—'}
        </div>
      )
    },
  },
  {
    id: 'user',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='User' />
    ),
    cell: ({ row }) => {
      const email = row.original.userEmail;
      const role = row.original.userRole;
      return (
        <div className='flex flex-col'>
          <span className='text-sm font-medium'>{email ?? '—'}</span>
          <span className='text-xs text-muted-foreground capitalize'>
            {role ?? ''}
          </span>
        </div>
      )
    },
  },
  {
    accessorKey: 'action',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Action' />
    ),
    cell: ({ row }) => (
      <div className='max-w-[200px] truncate text-sm'>
        {row.getValue('action')}
      </div>
    ),
  },
  {
    accessorKey: 'module',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Module' />
    ),
    cell: ({ row }) => (
      <Badge variant='outline' className='capitalize text-xs'>
        {(row.getValue('module') as string) ?? '—'}
      </Badge>
    ),
  },
  {
    accessorKey: 'ipAddress',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='IP Address' />
    ),
    cell: ({ row }) => (
      <div className='text-xs text-muted-foreground'>
        {(row.getValue('ipAddress') as string) ?? '—'}
      </div>
    ),
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
          className={statusColor[status] ?? ''}
        >
          {status ?? '—'}
        </Badge>
      )
    },
  },
]
