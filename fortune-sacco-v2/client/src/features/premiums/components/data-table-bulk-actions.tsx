
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
import { Premium } from '@/hooks/use-premiums'

type DataTableBulkActionsProps<TData> = {
  table: Table<TData>
}

export function DataTableBulkActions<TData>({
  table,
}: DataTableBulkActionsProps<TData>) {
  const selectedRows = table.getFilteredSelectedRowModel().rows

  const handleBulkExport = () => {
    const selectedPremiums = selectedRows.map((row) => row.original as Premium)
    toast.promise(sleep(1000), {
      loading: 'Exporting premiums...',
      success: () => {
        table.resetRowSelection()
        return `Exported ${selectedPremiums.length} premium record${selectedPremiums.length > 1 ? 's' : ''} to CSV.`
      },
      error: 'Error exporting',
    })
    table.resetRowSelection()
  }

  const handleDelete = () => {
    const selectedPremiums = selectedRows.map((row) => row.original as Premium)
    toast.promise(sleep(1000), {
      loading: 'Deleting premiums...',
      success: () => {
        table.resetRowSelection()
        return `Deleted ${selectedPremiums.length} premium record${selectedPremiums.length > 1 ? 's' : ''}.`
      },
      error: 'Error deleting',
    })
    table.resetRowSelection()
  }

  return (
    <BulkActionsToolbar table={table} entityName='premium'>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant='outline'
            size='icon'
            onClick={() => handleBulkExport()}
            className='size-8'
            aria-label='Export premiums'
            title='Export premiums'
          >
            <Download />
            <span className='sr-only'>Export premiums</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Export premiums</p>
        </TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant='destructive'
            size='icon'
            onClick={handleDelete}
            className='size-8'
            aria-label='Delete selected premiums'
            title='Delete selected premiums'
          >
            <Trash2 />
            <span className='sr-only'>Delete selected premiums</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Delete selected premiums</p>
        </TooltipContent>
      </Tooltip>
    </BulkActionsToolbar>
  )
}
