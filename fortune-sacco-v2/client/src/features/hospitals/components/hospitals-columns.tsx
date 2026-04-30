import { ColumnDef } from '@tanstack/react-table'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { DataTableColumnHeader } from '@/components/data-table'
import { Hospital } from '@/hooks/use-hospitals'

const typeColor: Record<string, string> = {
  private: 'bg-violet-100 text-violet-800 dark:bg-violet-900/30 dark:text-violet-300',
  public: 'bg-sky-100 text-sky-800 dark:bg-sky-900/30 dark:text-sky-300',
  county: 'bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-300',
  teaching: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300',
  clinic: 'bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-300',
  specialist: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300',
  referral: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300',
}

export const hospitalsColumns: ColumnDef<Hospital>[] = [
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
      <DataTableColumnHeader column={column} title='Hospital Name' />
    ),
    cell: ({ row }) => (
      <div className='w-[150px] font-medium'>{row.getValue('name')}</div>
    ),
  },
  {
    accessorKey: 'location',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Location' />
    ),
    cell: ({ row }) => (
      <div className='text-muted-foreground'>{row.getValue('location') || '—'}</div>
    ),
  },
  {
    accessorKey: 'type',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Type' />
    ),
    cell: ({ row }) => {
      const type = row.getValue('type') as string;
      return (
        <Badge
          variant='outline'
          className={`capitalize ${typeColor[type] ?? ''}`}
        >
          {type || '—'}
        </Badge>
      )
    },
  },
  {
    accessorKey: 'claimLimit',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Claim Limit (KES)' />
    ),
    cell: ({ row }) => {
      const amount = row.getValue('claimLimit') as string | number;
      return <div>{amount ? Number(amount).toLocaleString() : '—'}</div>
    },
  },
]
