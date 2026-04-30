
import { type Table } from '@tanstack/react-table'
import { Trash2, CircleArrowUp, Download } from 'lucide-react'
import { toast } from 'sonner'
import { sleep } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { DataTableBulkActions as BulkActionsToolbar } from '@/components/data-table'
import { Policy } from '@/hooks/use-policies'

type DataTableBulkActionsProps<TData> = {
  table: Table<TData>
}

export function DataTableBulkActions<TData>({
  table,
}: DataTableBulkActionsProps<TData>) {
  const selectedRows = table.getFilteredSelectedRowModel().rows

  const handleBulkStatusChange = (status: string) => {
    const selectedPolicies = selectedRows.map((row) => row.original as Policy)
    toast.promise(sleep(1000), {
      loading: 'Updating status...',
      success: () => {
        table.resetRowSelection()
        return `Status updated to "${status}" for ${selectedPolicies.length} polic${selectedPolicies.length > 1 ? 'ies' : 'y'}.`
      },
      error: 'Error updating status',
    })
    table.resetRowSelection()
  }

  const handleBulkExport = () => {
    const selectedPolicies = selectedRows.map((row) => row.original as Policy)
    toast.promise(sleep(1000), {
      loading: 'Exporting policies...',
      success: () => {
        table.resetRowSelection()
        return `Exported ${selectedPolicies.length} polic${selectedPolicies.length > 1 ? 'ies' : 'y'} to CSV.`
      },
      error: 'Error exporting',
    })
    table.resetRowSelection()
  }

  const handleDelete = () => {
    const selectedPolicies = selectedRows.map((row) => row.original as Policy)
    toast.promise(sleep(1000), {
      loading: 'Deleting policies...',
      success: () => {
        table.resetRowSelection()
        return `Deleted ${selectedPolicies.length} polic${selectedPolicies.length > 1 ? 'ies' : 'y'}.`
      },
      error: 'Error deleting',
    })
    table.resetRowSelection()
  }

  const statuses = [
    { label: 'Active', value: 'active' },
    { label: 'Expired', value: 'expired' },
    { label: 'Pending', value: 'pending' },
  ]

  return (
    <BulkActionsToolbar table={table} entityName='policy'>
      <DropdownMenu>
        <Tooltip>
          <TooltipTrigger asChild>
            <DropdownMenuTrigger asChild>
              <Button
                variant='outline'
                size='icon'
                className='size-8'
                aria-label='Update status'
                title='Update status'
              >
                <CircleArrowUp />
                <span className='sr-only'>Update status</span>
              </Button>
            </DropdownMenuTrigger>
          </TooltipTrigger>
          <TooltipContent>
            <p>Update status</p>
          </TooltipContent>
        </Tooltip>
        <DropdownMenuContent sideOffset={14}>
          {statuses.map((status) => (
            <DropdownMenuItem
              key={status.value}
              defaultValue={status.value}
              onClick={() => handleBulkStatusChange(status.value)}
            >
              {status.label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant='outline'
            size='icon'
            onClick={() => handleBulkExport()}
            className='size-8'
            aria-label='Export policies'
            title='Export policies'
          >
            <Download />
            <span className='sr-only'>Export policies</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Export policies</p>
        </TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant='destructive'
            size='icon'
            onClick={handleDelete}
            className='size-8'
            aria-label='Delete selected policies'
            title='Delete selected policies'
          >
            <Trash2 />
            <span className='sr-only'>Delete selected policies</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Delete selected policies</p>
        </TooltipContent>
      </Tooltip>
    </BulkActionsToolbar>
  )
}
