import { Banknote, Users, FileCheck, Clock, TrendingUp, Activity } from 'lucide-react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useDashboard } from '@/hooks/use-dashboard'
import { GeneralError } from '@/features/errors/general-error'
import { Analytics } from './components/analytics'
import { Overview } from './components/overview'
import { RecentSales } from './components/recent-sales'

export function GlobalDashboard() {
  const { data, isLoading, error } = useDashboard()

  const stats = data?.stats
  const recentClaims = data?.recentClaims || []
  const chartData = data?.chartData || []

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
    <Tabs
      orientation='horizontal'
      defaultValue='overview'
      className='space-y-4'
    >
      <div className='w-full overflow-x-auto pb-2'>
        <TabsList>
          <TabsTrigger value='overview'>Overview</TabsTrigger>
          <TabsTrigger value='analytics'>Analytics</TabsTrigger>
          <TabsTrigger value='reports' disabled>
            Reports
          </TabsTrigger>
          <TabsTrigger value='notifications' disabled>
            Notifications
          </TabsTrigger>
        </TabsList>
      </div>
      <TabsContent value='overview' className='space-y-4'>
        <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-4'>
          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>
                Total Premiums
              </CardTitle>
              <Banknote className='h-4 w-4 text-muted-foreground' />
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
              <CardTitle className='text-sm font-medium'>
                Active Members
              </CardTitle>
              <Users className='h-4 w-4 text-muted-foreground' />
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
          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>Approved Claims</CardTitle>
              <FileCheck className='h-4 w-4 text-green-500' />
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
              <CardTitle className='text-sm font-medium'>
                Pending Claims
              </CardTitle>
              <Clock className='h-4 w-4 text-amber-500' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>
                {stats?.pendingClaims.toLocaleString()}
              </div>
              <p className='text-xs text-muted-foreground'>
                {stats?.pendingTrend} since last hour
              </p>
            </CardContent>
          </Card>
        </div>
        <div className='grid grid-cols-1 gap-4 lg:grid-cols-7'>
          <Card className='col-span-1 lg:col-span-4'>
            <CardHeader>
              <CardTitle>Claims vs Premiums</CardTitle>
              <CardDescription>
                Monthly comparison of claims and premium collections.
              </CardDescription>
            </CardHeader>
            <CardContent className='ps-2'>
              <Overview data={chartData} />
            </CardContent>
          </Card>
          <Card className='col-span-1 lg:col-span-3'>
            <CardHeader>
              <CardTitle>Recent Claims</CardTitle>
              <CardDescription>
                Latest insurance claims submitted.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <RecentSales claims={recentClaims} />
            </CardContent>
          </Card>
        </div>
      </TabsContent>
      <TabsContent value='analytics' className='space-y-4'>
        <Analytics chartData={chartData} stats={stats} />
      </TabsContent>
    </Tabs>
  )
}
