import { useState } from 'react'
import { type Table } from '@tanstack/react-table'
import { Trash2, CircleArrowUp, Download } from 'lucide-react'
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
import { DataTableBulkActions as BulkActionsToolbar } from '@/components/data-table'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { downloadCsv } from '@/lib/export'
import { Member, useDeleteMember, useBulkUpdateMembers } from '@/hooks/use-members'

type DataTableBulkActionsProps<TData> = {
  table: Table<TData>
}

export function DataTableBulkActions<TData>({
  table,
}: DataTableBulkActionsProps<TData>) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const selectedRows = table.getFilteredSelectedRowModel().rows

  const bulkUpdateStatus = useBulkUpdateMembers()
  const handleBulkStatusChange = async (status: string) => {
    const selectedIds = selectedRows.map((row) => (row.original as Member).id)
    await bulkUpdateStatus.mutateAsync({ ids: selectedIds, status })
    table.resetRowSelection()
  }

  const handleBulkExport = () => {
    const selectedMembers = selectedRows.map((row) => row.original as Member)
    downloadCsv(selectedMembers, 'members-export')
    table.resetRowSelection()
    toast.success(`Exported ${selectedMembers.length} member${selectedMembers.length > 1 ? 's' : ''} to CSV.`)
  }

  const deleteMember = useDeleteMember()
  const handleConfirmDelete = async () => {
    const selectedMembers = selectedRows.map((row) => row.original as Member)
    for (const m of selectedMembers) {
      await deleteMember.mutateAsync(m.id)
    }
    table.resetRowSelection()
    setShowDeleteDialog(false)
  }

  const statuses = [
    { label: 'Active', value: 'active' },
    { label: 'Expired', value: 'expired' },
    { label: 'Pending', value: 'pending' },
  ]

  return (
    <>
      <ConfirmDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        handleConfirm={handleConfirmDelete}
        title='Delete Members'
        desc={`Are you sure you want to delete ${selectedRows.length} member${selectedRows.length > 1 ? 's' : ''}? This action cannot be undone.`}
        confirmText='Delete'
        destructive
        isLoading={deleteMember.isPending}
      />
      <BulkActionsToolbar table={table} entityName='member'>
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
              aria-label='Export members'
              title='Export members'
            >
              <Download />
              <span className='sr-only'>Export members</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Export members</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant='destructive'
              size='icon'
              onClick={() => setShowDeleteDialog(true)}
              className='size-8'
              aria-label='Delete selected members'
              title='Delete selected members'
            >
              <Trash2 />
              <span className='sr-only'>Delete selected members</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Delete selected members</p>
          </TooltipContent>
        </Tooltip>
      </BulkActionsToolbar>
    </>
  )
}
