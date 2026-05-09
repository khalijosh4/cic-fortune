import { useState } from 'react'
import { DotsHorizontalIcon } from '@radix-ui/react-icons'
import { type Row } from '@tanstack/react-table'
import { Eye, Edit, Trash2 } from 'lucide-react'
import { useNavigate } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { useAuthStore } from '@/stores/auth-store'
import { getFeatureFlags } from '@/lib/permissions'
import { type Premium, useDeletePremium } from '@/hooks/use-premiums'

type DataTableRowActionsProps = {
  row: Row<Premium>
}

export function DataTableRowActions({ row }: DataTableRowActionsProps) {
  const navigate = useNavigate()
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const deletePremium = useDeletePremium()
  const { auth } = useAuthStore()
  const permissions = getFeatureFlags(auth.user?.role as any, 'premiums')
  const id = row.original.id

  return (
    <>
      <ConfirmDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        handleConfirm={() => {
          deletePremium.mutate(id)
          setShowDeleteDialog(false)
        }}
        title='Delete Premium'
        desc='Are you sure you want to delete this premium record? This action cannot be undone.'
        confirmText='Delete'
        destructive
        isLoading={deletePremium.isPending}
      />
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <Button
            variant='ghost'
            className='flex h-8 w-8 p-0 data-[state=open]:bg-muted'
          >
            <DotsHorizontalIcon className='h-4 w-4' />
            <span className='sr-only'>Open menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align='end' className='w-40'>
          <DropdownMenuItem
            onClick={() => navigate({ to: '/premiums/$id', params: { id } })}
          >
            <Eye className='mr-2 h-4 w-4' />
            View Details
          </DropdownMenuItem>
          {permissions.canEdit && (
            <DropdownMenuItem
              onClick={() => navigate({ to: '/premiums/$id', params: { id } })}
            >
              <Edit className='mr-2 h-4 w-4' />
              Edit
            </DropdownMenuItem>
          )}
          {permissions.canDelete && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className='text-destructive focus:text-destructive'
                onSelect={() => setShowDeleteDialog(true)}
              >
                <Trash2 className='mr-2 h-4 w-4' />
                Delete
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  )
}
