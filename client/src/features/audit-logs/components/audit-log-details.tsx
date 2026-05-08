import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuditLog } from '@/hooks/use-audit-logs'
import { Loader2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

interface AuditLogDetailsProps {
  id: string
}

export function AuditLogDetails({ id }: AuditLogDetailsProps) {
  const { data: log, isLoading } = useAuditLog(id)

  if (isLoading) {
    return (
      <div className='flex h-64 items-center justify-center'>
        <Loader2 className='h-8 w-8 animate-spin text-primary' />
      </div>
    )
  }

  if (!log) return <div>Log entry not found.</div>

  const detailRows = [
    { label: 'Log ID', value: <span className='font-mono'>{log.id}</span> },
    { label: 'Action', value: log.action },
    { label: 'Module', value: <span className='capitalize'>{log.module}</span> },
    { label: 'Status', value: (
      <Badge variant='outline' className={log.status === 'Success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
        {log.status}
      </Badge>
    ) },
    { label: 'User Email', value: log.userEmail },
    { label: 'User Role', value: <span className='capitalize'>{log.userRole}</span> },
    { label: 'Branch', value: log.branchName },
    { label: 'IP Address', value: log.ipAddress },
    { label: 'Timestamp', value: log.timestamp ? new Date(log.timestamp).toLocaleString() : '—' },
    { label: 'Event Type', value: <span className='capitalize'>{log.type}</span> },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle>Audit Event Details</CardTitle>
      </CardHeader>
      <CardContent className='space-y-4'>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4'>
          {detailRows.map((row) => (
            <div key={row.label} className='flex flex-col gap-1'>
              <span className='text-sm font-medium text-muted-foreground'>{row.label}</span>
              <div className='text-sm'>{row.value || '—'}</div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
