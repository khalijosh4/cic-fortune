
import { useState } from 'react'
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
import { ConfirmDialog } from '@/components/confirm-dialog'
import { DataTableBulkActions as BulkActionsToolbar } from '@/components/data-table'
import { Claim, useDeleteClaim } from '@/hooks/use-claims'

type DataTableBulkActionsProps<TData> = {
  table: Table<TData>
}

export function DataTableBulkActions<TData>({
  table,
}: DataTableBulkActionsProps<TData>) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const selectedRows = table.getFilteredSelectedRowModel().rows

  const handleBulkStatusChange = (status: string) => {
    const selectedClaims = selectedRows.map((row) => row.original as Claim)
    toast.promise(sleep(1000), {
      loading: 'Updating status...',
      success: () => {
        table.resetRowSelection()
        return `Status updated to "${status}" for ${selectedClaims.length} claim${selectedClaims.length > 1 ? 's' : ''}.`
      },
      error: 'Error updating status',
    })
    table.resetRowSelection()
  }

  const handleBulkExport = () => {
    const selectedClaims = selectedRows.map((row) => row.original as Claim)
    toast.promise(sleep(1000), {
      loading: 'Exporting claims...',
      success: () => {
        table.resetRowSelection()
        return `Exported ${selectedClaims.length} claim${selectedClaims.length > 1 ? 's' : ''} to CSV.`
      },
      error: 'Error exporting',
    })
    table.resetRowSelection()
  }

  const deleteClaim = useDeleteClaim()
  const handleDelete = async () => {
    const selectedClaims = selectedRows.map((row) => row.original as Claim)
    for (const c of selectedClaims) {
      await deleteClaim.mutateAsync(c.id)
    }
    table.resetRowSelection()
    setShowDeleteDialog(false)
  }

  const statuses = [
    { label: 'Approved', value: 'approved' },
    { label: 'Rejected', value: 'rejected' },
    { label: 'Pending', value: 'pending' },
  ]

  return (
    <>
    <BulkActionsToolbar table={table} entityName='claim'>
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
            aria-label='Export claims'
            title='Export claims'
          >
            <Download />
            <span className='sr-only'>Export claims</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Export claims</p>
        </TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant='destructive'
            size='icon'
            onClick={() => setShowDeleteDialog(true)}
            className='size-8'
            aria-label='Delete selected claims'
            title='Delete selected claims'
          >
            <Trash2 />
            <span className='sr-only'>Delete selected claims</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Delete selected claims</p>
        </TooltipContent>
      </Tooltip>
    </BulkActionsToolbar>
    <ConfirmDialog
      open={showDeleteDialog}
      onOpenChange={setShowDeleteDialog}
      handleConfirm={handleDelete}
      title='Delete Claims'
      desc={`Are you sure you want to delete ${selectedRows.length} selected claim${selectedRows.length > 1 ? 's' : ''}? This action cannot be undone.`}
      confirmText='Delete'
      destructive
      isLoading={deleteClaim.isPending}
    />
    </>
  )
}
