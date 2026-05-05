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
import { User, useDeleteUser } from '@/hooks/use-users'

type DataTableBulkActionsProps<TData> = {
  table: Table<TData>
}

export function DataTableBulkActions<TData>({
  table,
}: DataTableBulkActionsProps<TData>) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const selectedRows = table.getFilteredSelectedRowModel().rows

  const handleBulkExport = () => {
    const selectedUsers = selectedRows.map((row) => row.original as User)
    toast.promise(sleep(1000), {
      loading: 'Exporting users...',
      success: () => {
        table.resetRowSelection()
        return `Exported ${selectedUsers.length} user${selectedUsers.length > 1 ? 's' : ''} to CSV.`
      },
      error: 'Error exporting',
    })
    table.resetRowSelection()
  }

  const deleteUser = useDeleteUser()
  const handleConfirmDelete = async () => {
    const selectedUsers = selectedRows.map((row) => row.original as User)
    for (const u of selectedUsers) {
      await deleteUser.mutateAsync(u.id)
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
        title='Delete Users'
        desc={`Are you sure you want to delete ${selectedRows.length} user${selectedRows.length > 1 ? 's' : ''}? This action cannot be undone.`}
        confirmText='Delete'
        destructive
        isLoading={deleteUser.isPending}
      />
      <BulkActionsToolbar table={table} entityName='user'>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant='outline'
              size='icon'
              onClick={() => handleBulkExport()}
              className='size-8'
              aria-label='Export users'
              title='Export users'
            >
              <Download />
              <span className='sr-only'>Export users</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Export users</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant='destructive'
              size='icon'
              onClick={() => setShowDeleteDialog(true)}
              className='size-8'
              aria-label='Delete selected users'
              title='Delete selected users'
            >
              <Trash2 />
              <span className='sr-only'>Delete selected users</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Delete selected users</p>
          </TooltipContent>
        </Tooltip>
      </BulkActionsToolbar>
    </>
  )
}
