import { useState } from 'react'
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
import { Hospital } from '@/hooks/use-hospitals'

type DataTableBulkActionsProps<TData> = {
  table: Table<TData>
}

export function DataTableBulkActions<TData>({
  table,
}: DataTableBulkActionsProps<TData>) {
  const selectedRows = table.getFilteredSelectedRowModel().rows

  const handleBulkExport = () => {
    const selectedHospitals = selectedRows.map((row) => row.original as Hospital)
    toast.promise(sleep(1000), {
      loading: 'Exporting hospitals...',
      success: () => {
        table.resetRowSelection()
        return `Exported ${selectedHospitals.length} hospital${selectedHospitals.length > 1 ? 's' : ''} to CSV.`
      },
      error: 'Error exporting',
    })
    table.resetRowSelection()
  }

  const handleDelete = () => {
    const selectedHospitals = selectedRows.map((row) => row.original as Hospital)
    toast.promise(sleep(1000), {
      loading: 'Deleting hospitals...',
      success: () => {
        table.resetRowSelection()
        return `Deleted ${selectedHospitals.length} hospital${selectedHospitals.length > 1 ? 's' : ''}.`
      },
      error: 'Error deleting',
    })
    table.resetRowSelection()
  }

  return (
    <BulkActionsToolbar table={table} entityName='hospital'>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant='outline'
            size='icon'
            onClick={() => handleBulkExport()}
            className='size-8'
            aria-label='Export hospitals'
            title='Export hospitals'
          >
            <Download />
            <span className='sr-only'>Export hospitals</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Export hospitals</p>
        </TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant='destructive'
            size='icon'
            onClick={handleDelete}
            className='size-8'
            aria-label='Delete selected hospitals'
            title='Delete selected hospitals'
          >
            <Trash2 />
            <span className='sr-only'>Delete selected hospitals</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Delete selected hospitals</p>
        </TooltipContent>
      </Tooltip>
    </BulkActionsToolbar>
  )
}
