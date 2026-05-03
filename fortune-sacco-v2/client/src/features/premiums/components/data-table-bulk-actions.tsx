
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
import { ConfirmDialog } from '@/components/confirm-dialog'
import { DataTableBulkActions as BulkActionsToolbar } from '@/components/data-table'
import { Premium, useDeletePremium } from '@/hooks/use-premiums'

type DataTableBulkActionsProps<TData> = {
  table: Table<TData>
}

export function DataTableBulkActions<TData>({
  table,
}: DataTableBulkActionsProps<TData>) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
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

  const deletePremium = useDeletePremium()
  const handleDelete = async () => {
    const selectedPremiums = selectedRows.map((row) => row.original as Premium)
    for (const p of selectedPremiums) {
      await deletePremium.mutateAsync(p.id)
    }
    table.resetRowSelection()
    setShowDeleteDialog(false)
  }

  return (
    <>
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
            onClick={() => setShowDeleteDialog(true)}
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
    <ConfirmDialog
      open={showDeleteDialog}
      onOpenChange={setShowDeleteDialog}
      handleConfirm={handleDelete}
      title='Delete Premium Records'
      desc={`Are you sure you want to delete ${selectedRows.length} selected premium record${selectedRows.length > 1 ? 's' : ''}? This action cannot be undone.`}
      confirmText='Delete'
      destructive
      isLoading={deletePremium.isPending}
    />
    </>
  )
}
