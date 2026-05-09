import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { useHospitalDashboard } from '@/hooks/use-dashboard'
import { GeneralError } from '@/features/errors/general-error'
import { RecentSales } from './components/recent-sales'
import { Hospital, FileText, CheckCircle, Clock, Gauge } from 'lucide-react'

export function HospitalDashboard() {
  const { data, isLoading, error } = useHospitalDashboard()

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

  const claimLimitPercent = stats?.claimLimit && stats.claimLimit > 0
    ? Math.round((stats.claimLimitUsed / stats.claimLimit) * 100)
    : 0

  return (
    <div className='space-y-4'>
      {stats && (
        <div className='flex items-center gap-3 rounded-lg border bg-card p-4 text-card-foreground shadow-sm'>
          <Hospital className='h-8 w-8 text-primary' />
          <div>
            <h2 className='text-xl font-bold'>{stats.hospitalName}</h2>
            <p className='text-sm text-muted-foreground'>Hospital Dashboard</p>
          </div>
        </div>
      )}

      <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-4'>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Total Claims</CardTitle>
            <FileText className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>
              {stats?.totalClaims.toLocaleString()}
            </div>
            <p className='text-xs text-muted-foreground'>
              all time
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
              approved claims
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Pending</CardTitle>
            <Clock className='h-4 w-4 text-amber-500' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>
              {stats?.pendingClaims.toLocaleString()}
            </div>
            <p className='text-xs text-muted-foreground'>
              under review
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Claim Limit Usage</CardTitle>
            <Gauge className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>
              {claimLimitPercent}%
            </div>
            <p className='text-xs text-muted-foreground'>
              KES {stats?.claimLimitUsed.toLocaleString()} / KES {stats?.claimLimit.toLocaleString()}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Claims</CardTitle>
          <CardDescription>
            Latest claims filed by your hospital.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <RecentSales claims={recentClaims} />
        </CardContent>
      </Card>
    </div>
  )
}
