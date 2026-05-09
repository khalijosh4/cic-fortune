import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { FileText } from 'lucide-react'

interface Claim {
  id: string
  member: string
  email?: string
  amount: number
  status: string
  diagnosis: string
}

interface RecentClaimsProps {
  claims: Claim[]
}

export function RecentSales({ claims }: RecentClaimsProps) {
  if (claims.length === 0) {
    return (
      <div className='flex flex-col items-center justify-center py-8 text-center'>
        <FileText className='mb-3 h-10 w-10 text-muted-foreground/50' />
        <p className='text-sm font-medium text-muted-foreground'>No Recent Claims</p>
        <p className='text-xs text-muted-foreground/60'>Claims submitted by members will appear here.</p>
      </div>
    )
  }

  return (
    <div className='space-y-8'>
      {claims.map((claim) => (
        <div key={claim.id} className='flex items-center gap-4'>
          <Avatar className='h-9 w-9'>
            <AvatarFallback>
              {claim.member
                .split(' ')
                .map((n) => n[0])
                .join('')}
            </AvatarFallback>
          </Avatar>
          <div className='flex flex-1 flex-wrap items-center justify-between'>
            <div className='space-y-1'>
              <p className='text-sm leading-none font-medium'>{claim.member}</p>
              <p className='text-sm text-muted-foreground'>
                {claim.diagnosis}
              </p>
            </div>
            <div className='font-medium'>
              KES {claim.amount.toLocaleString()}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
