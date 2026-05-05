import { useState } from 'react'
import { type Table } from '@tanstack/react-table'
import { Trash2, Download } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { DataTableBulkActions as BulkActionsToolbar } from '@/components/data-table'
import { downloadCsv } from '@/lib/export'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { Hospital, useDeleteHospital } from '@/hooks/use-hospitals'

type DataTableBulkActionsProps<TData> = {
  table: Table<TData>
}

export function DataTableBulkActions<TData>({
  table,
}: DataTableBulkActionsProps<TData>) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const selectedRows = table.getFilteredSelectedRowModel().rows

  const handleBulkExport = () => {
    const selectedHospitals = selectedRows.map((row) => row.original as Hospital)
    downloadCsv(selectedHospitals, 'hospitals-export')
    table.resetRowSelection()
    toast.success(`Exported ${selectedHospitals.length} hospital record${selectedHospitals.length > 1 ? 's' : ''} to CSV.`)
  }

  const deleteHospital = useDeleteHospital()
  const handleConfirmDelete = async () => {
    const selectedHospitals = selectedRows.map((row) => row.original as Hospital)
    for (const h of selectedHospitals) {
      await deleteHospital.mutateAsync(h.id)
    }
    table.resetRowSelection()
    setShowDeleteDialog(false)
  }

  return (
    <>
      <ConfirmDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        handleConfirm={handleConfirmDelete}
        title='Delete Hospitals'
        desc={`Are you sure you want to delete ${selectedRows.length} hospital${selectedRows.length > 1 ? 's' : ''}? This action cannot be undone.`}
        confirmText='Delete'
        destructive
        isLoading={deleteHospital.isPending}
      />
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
              onClick={() => setShowDeleteDialog(true)}
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
    </>
  )
}
