import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface StatsCardProps {
  title: string
  value: string | number
  description?: string
  icon: LucideIcon
  iconClassName?: string
  isLoading?: boolean
}

export function StatsCard({
  title,
  value,
  description,
  icon: Icon,
  iconClassName,
  isLoading,
}: StatsCardProps) {
  return (
    <Card>
      <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
        <CardTitle className='text-sm font-medium text-muted-foreground'>{title}</CardTitle>
        <div className={cn('rounded-md p-2', iconClassName ?? 'bg-primary/10 text-primary')}>
          <Icon className='h-4 w-4' />
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <>
            <Skeleton className='mb-1 h-7 w-24' />
            <Skeleton className='h-3 w-32' />
          </>
        ) : (
          <>
            <div className='text-2xl font-bold'>{value}</div>
            {description && (
              <p className='mt-1 text-xs text-muted-foreground'>{description}</p>
            )}
          </>
        )}
      </CardContent>
    </Card>
  )
}
