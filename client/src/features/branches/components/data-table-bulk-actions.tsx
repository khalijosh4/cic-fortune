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
import { ConfirmDialog } from '@/components/confirm-dialog'
import { Branch, useDeleteBranch } from '@/hooks/use-branches'

type DataTableBulkActionsProps<TData> = {
  table: Table<TData>
}

export function DataTableBulkActions<TData>({
  table,
}: DataTableBulkActionsProps<TData>) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const selectedRows = table.getFilteredSelectedRowModel().rows

  const handleBulkExport = () => {
    const selectedBranches = selectedRows.map((row) => row.original as Branch)
    toast.promise(sleep(1000), {
      loading: 'Exporting branches...',
      success: () => {
        table.resetRowSelection()
        return `Exported ${selectedBranches.length} branch${selectedBranches.length > 1 ? 'es' : ''} to CSV.`
      },
      error: 'Error exporting',
    })
    table.resetRowSelection()
  }

  const deleteBranch = useDeleteBranch()
  const handleConfirmDelete = async () => {
    const selectedBranches = selectedRows.map((row) => row.original as Branch)
    for (const b of selectedBranches) {
      await deleteBranch.mutateAsync(b.id)
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
        title='Delete Branches'
        desc={`Are you sure you want to delete ${selectedRows.length} branch${selectedRows.length > 1 ? 'es' : ''}? This action cannot be undone.`}
        confirmText='Delete'
        destructive
        isLoading={deleteBranch.isPending}
      />
      <BulkActionsToolbar table={table} entityName='branch'>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant='outline'
              size='icon'
              onClick={() => handleBulkExport()}
              className='size-8'
              aria-label='Export branches'
              title='Export branches'
            >
              <Download />
              <span className='sr-only'>Export branches</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Export branches</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant='destructive'
              size='icon'
              onClick={() => setShowDeleteDialog(true)}
              className='size-8'
              aria-label='Delete selected branches'
              title='Delete selected branches'
            >
              <Trash2 />
              <span className='sr-only'>Delete selected branches</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Delete selected branches</p>
          </TooltipContent>
        </Tooltip>
      </BulkActionsToolbar>
    </>
  )
}
