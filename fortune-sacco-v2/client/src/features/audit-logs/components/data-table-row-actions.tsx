import { DotsHorizontalIcon } from '@radix-ui/react-icons'
import { type Row } from '@tanstack/react-table'
import { Eye } from 'lucide-react'
import { useNavigate } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { type AuditLog } from '@/hooks/use-audit-logs'

type DataTableRowActionsProps = {
  row: Row<AuditLog>
}

export function DataTableRowActions({ row }: DataTableRowActionsProps) {
  const navigate = useNavigate()
  const id = row.original.id

  return (
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
          onClick={() => navigate({ to: '/audit-logs/$id', params: { id } })}
        >
          <Eye className='mr-2 h-4 w-4' />
          View Details
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
