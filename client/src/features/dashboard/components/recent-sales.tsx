import { Avatar, AvatarFallback } from '@/components/ui/avatar'

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
