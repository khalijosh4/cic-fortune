import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { useDashboard } from '@/hooks/use-dashboard'
import { GeneralError } from '@/features/errors/general-error'
import { RecentSales } from './components/recent-sales'
import { FileText, CheckCircle, Clock } from 'lucide-react'

export function ClaimsDashboard() {
  const { data, isLoading, error } = useDashboard()

  const stats = data?.stats
  const recentClaims = data?.recentClaims || []

  if (isLoading) {
    return (
      <div className='flex h-[calc(100svh-12rem)] w-full items-center justify-center'>
        <div className='flex flex-col items-center gap-2'>
          <div className='h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent'></div>
          <p className='text-sm text-muted-foreground'>Loading dashboard...</p>
        </div>
      </div>
    )
  }

  if (error) return <GeneralError />

  return (
    <div className='space-y-4'>
      <div>
        <h1 className='text-2xl font-bold tracking-tight'>Claims Dashboard</h1>
        <p className='text-muted-foreground'>
          Overview of claims processing.
        </p>
      </div>

      <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-4'>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Pending Claims</CardTitle>
            <Clock className='h-4 w-4 text-amber-500' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>
              {stats?.pendingClaims.toLocaleString()}
            </div>
            <p className='text-xs text-muted-foreground'>
              awaiting review
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Approved</CardTitle>
            <CheckCircle className='h-4 w-4 text-green-500' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>
              {stats?.approvedClaims.toLocaleString()}
            </div>
            <p className='text-xs text-muted-foreground'>
              +{stats?.claimsTrend}% from last month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Total Premiums</CardTitle>
            <FileText className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>
              KES {stats?.totalPremiums.toLocaleString()}
            </div>
            <p className='text-xs text-muted-foreground'>
              +{stats?.premiumsTrend}% from last month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Active Members</CardTitle>
            <CheckCircle className='h-4 w-4 text-blue-500' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>
              {stats?.activeMembers.toLocaleString()}
            </div>
            <p className='text-xs text-muted-foreground'>
              +{stats?.membersTrend}% from last month
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Claims</CardTitle>
          <CardDescription>
            Latest claims submitted for processing.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <RecentSales claims={recentClaims} />
        </CardContent>
      </Card>
    </div>
  )
}
