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
  /** Optional trend percentage (e.g., +12.5) */
  trend?: {
    value: number
    label: string
  }
}

export function StatsCard({
  title,
  value,
  description,
  icon: Icon,
  iconClassName,
  isLoading,
  trend,
}: StatsCardProps) {
  return (
    <Card className="overflow-hidden transition-all hover:shadow-md">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <div 
          className={cn(
            'rounded-lg p-2 transition-colors', 
            iconClassName || 'bg-primary/10 text-primary'
          )}
        >
          <Icon className="h-4 w-4" />
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-8 w-[60%]" />
            <Skeleton className="h-4 w-[80%]" />
          </div>
        ) : (
          <>
            <div className="text-2xl font-bold tracking-tight">
              {value}
            </div>
            
            {(description || trend) && (
              <div className="mt-1 flex items-center gap-2">
                {trend && (
                  <span className={cn(
                    "text-xs font-medium",
                    trend.value >= 0 ? "text-emerald-600" : "text-rose-600"
                  )}>
                    {trend.value >= 0 ? '+' : ''}{trend.value}%
                  </span>
                )}
                {description && (
                  <p className="text-xs text-muted-foreground line-clamp-1">
                    {description}
                  </p>
                )}
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  )
}