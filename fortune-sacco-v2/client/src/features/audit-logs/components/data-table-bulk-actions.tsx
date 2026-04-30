
import { type Table } from '@tanstack/react-table'
import { Trash2, Download } from 'lucide-react'
import { toast } from 'sonner'
import { sleep } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { DataTableBulkActions as BulkActionsToolbar } from '@/components/data-table'
import { AuditLog } from '@/hooks/use-audit-logs'

type DataTableBulkActionsProps<TData> = {
  table: Table<TData>
}

export function DataTableBulkActions<TData>({
  table,
}: DataTableBulkActionsProps<TData>) {
  const selectedRows = table.getFilteredSelectedRowModel().rows

  const handleBulkExport = () => {
    const selectedLogs = selectedRows.map((row) => row.original as AuditLog)
    toast.promise(sleep(1000), {
      loading: 'Exporting audit logs...',
      success: () => {
        table.resetRowSelection()
        return `Exported ${selectedLogs.length} audit log${selectedLogs.length > 1 ? 's' : ''} to CSV.`
      },
      error: 'Error exporting',
    })
    table.resetRowSelection()
  }

  const handleDelete = () => {
    const selectedLogs = selectedRows.map((row) => row.original as AuditLog)
    toast.promise(sleep(1000), {
      loading: 'Deleting audit logs...',
      success: () => {
        table.resetRowSelection()
        return `Deleted ${selectedLogs.length} audit log${selectedLogs.length > 1 ? 's' : ''}.`
      },
      error: 'Error deleting',
    })
    table.resetRowSelection()
  }

  return (
    <BulkActionsToolbar table={table} entityName='audit log'>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant='outline'
            size='icon'
            onClick={() => handleBulkExport()}
            className='size-8'
            aria-label='Export audit logs'
            title='Export audit logs'
          >
            <Download />
            <span className='sr-only'>Export audit logs</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Export audit logs</p>
        </TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant='destructive'
            size='icon'
            onClick={handleDelete}
            className='size-8'
            aria-label='Delete selected audit logs'
            title='Delete selected audit logs'
          >
            <Trash2 />
            <span className='sr-only'>Delete selected audit logs</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Delete selected audit logs</p>
        </TooltipContent>
      </Tooltip>
    </BulkActionsToolbar>
  )
}
