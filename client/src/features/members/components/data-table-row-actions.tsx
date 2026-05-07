import { useState } from 'react'
import { DotsHorizontalIcon } from '@radix-ui/react-icons'
import { type Row } from '@tanstack/react-table'
import { Eye, Edit, Trash2, Mail } from 'lucide-react'
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
import { type Member, useDeleteMember, useResendNotification } from '@/hooks/use-members'

type DataTableRowActionsProps = {
  row: Row<Member>
}

export function DataTableRowActions({ row }: DataTableRowActionsProps) {
  const navigate = useNavigate()
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const deleteMember = useDeleteMember()
  const resendNotification = useResendNotification()
  const id = row.original.id

  return (
    <>
      <ConfirmDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        handleConfirm={() => {
          deleteMember.mutate(id)
          setShowDeleteDialog(false)
        }}
        title='Delete Member'
        desc='Are you sure you want to delete this member? This action cannot be undone.'
        confirmText='Delete'
        destructive
        isLoading={deleteMember.isPending}
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
            onClick={() => navigate({ to: '/members/$id', params: { id } })}
          >
            <Eye className='mr-2 h-4 w-4' />
            View Details
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => navigate({ to: '/members/$id', params: { id } })}
          >
            <Edit className='mr-2 h-4 w-4' />
            Edit
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => resendNotification.mutate(id)}
            disabled={resendNotification.isPending}
          >
            <Mail className='mr-2 h-4 w-4' />
            {resendNotification.isPending ? 'Sending...' : 'Resend Welcome'}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className='text-destructive focus:text-destructive'
            onSelect={() => setShowDeleteDialog(true)}
          >
            <Trash2 className='mr-2 h-4 w-4' />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  )
}
