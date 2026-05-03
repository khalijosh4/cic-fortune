
import { useState } from 'react'
import { type Table } from '@tanstack/react-table'
import { Trash2, Download, CircleArrowUp } from 'lucide-react'
import { toast } from 'sonner'
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
import { downloadCsv } from '@/lib/export'
import { Premium, useDeletePremium, useBulkUpdatePremiums } from '@/hooks/use-premiums'

type DataTableBulkActionsProps<TData> = {
  table: Table<TData>
}

export function DataTableBulkActions<TData>({
  table,
}: DataTableBulkActionsProps<TData>) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const selectedRows = table.getFilteredSelectedRowModel().rows

  const bulkUpdateStatus = useBulkUpdatePremiums()
  const handleBulkStatusChange = async (status: string) => {
    const selectedIds = selectedRows.map((row) => (row.original as Premium).id)
    await bulkUpdateStatus.mutateAsync({ ids: selectedIds, status })
    table.resetRowSelection()
  }

  const handleBulkExport = () => {
    const selectedPremiums = selectedRows.map((row) => row.original as Premium)
    downloadCsv(selectedPremiums, 'premiums-export')
    table.resetRowSelection()
    toast.success(`Exported ${selectedPremiums.length} premium record${selectedPremiums.length > 1 ? 's' : ''} to CSV.`)
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

  const statuses = [
    { label: 'Paid', value: 'paid' },
    { label: 'Unpaid', value: 'unpaid' },
    { label: 'Overdue', value: 'overdue' },
  ]

  return (
    <>
    <BulkActionsToolbar table={table} entityName='premium'>
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
