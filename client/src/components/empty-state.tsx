import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Inbox } from 'lucide-react'

interface EmptyStateProps {
  icon?: React.ReactNode
  title: string
  description: string
}

export function EmptyState({ icon, title, description }: EmptyStateProps) {
  return (
    <div className='flex h-[calc(100svh-12rem)] w-full items-center justify-center'>
      <Card className='w-full max-w-md'>
        <CardHeader>
          <CardTitle className='flex items-center gap-2 text-muted-foreground'>
            {icon ?? <Inbox className='h-5 w-5' />}
            {title}
          </CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
      </Card>
    </div>
  )
}

export function EmptySection({ icon, title, description, className }: EmptyStateProps & { className?: string }) {
  return (
    <div className={`flex flex-col items-center justify-center py-12 text-center ${className ?? ''}`}>
      <div className='mb-4 text-muted-foreground/50'>
        {icon ?? <Inbox className='h-12 w-12' />}
      </div>
      <h3 className='mb-1 text-sm font-medium text-muted-foreground'>{title}</h3>
      <p className='text-xs text-muted-foreground/60 max-w-xs'>{description}</p>
    </div>
  )
}
