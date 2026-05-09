import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Banknote, Users, FileCheck, Clock } from 'lucide-react'
import { AnalyticsChart } from './analytics-chart'
import type { DashboardData } from '@/hooks/use-dashboard'

interface AnalyticsProps {
  chartData: DashboardData['chartData']
  stats: DashboardData['stats'] | null
}

export function Analytics({ chartData, stats }: AnalyticsProps) {
  return (
    <div className='space-y-4'>
      <Card>
        <CardHeader>
          <CardTitle>Claims vs Premiums Trend</CardTitle>
          <CardDescription>Monthly comparison of claims and premium collections</CardDescription>
        </CardHeader>
        <CardContent className='px-6'>
          <AnalyticsChart data={chartData} />
        </CardContent>
      </Card>
      <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-4'>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Total Premiums</CardTitle>
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
            <CardTitle className='text-sm font-medium'>Active Members</CardTitle>
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
            <CardTitle className='text-sm font-medium'>Pending Claims</CardTitle>
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
            <CardTitle>Claims by Status</CardTitle>
            <CardDescription>Approved vs pending claim distribution</CardDescription>
          </CardHeader>
          <CardContent>
            <SimpleBarList
              items={[
                { name: 'Approved', value: stats?.approvedClaims || 0 },
                { name: 'Pending', value: stats?.pendingClaims || 0 },
              ]}
              barClass='bg-primary'
              valueFormatter={(n) => `${n.toLocaleString()}`}
            />
          </CardContent>
        </Card>
        <Card className='col-span-1 lg:col-span-3'>
          <CardHeader>
            <CardTitle>Performance</CardTitle>
            <CardDescription>Key metric trends</CardDescription>
          </CardHeader>
          <CardContent>
            <SimpleBarList
              items={[
                { name: 'Premiums Trend', value: stats?.premiumsTrend || 0 },
                { name: 'Members Trend', value: stats?.membersTrend || 0 },
                { name: 'Claims Trend', value: stats?.claimsTrend || 0 },
              ]}
              barClass='bg-muted-foreground'
              valueFormatter={(n) => `+${n}%`}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function SimpleBarList({
  items,
  valueFormatter,
  barClass,
}: {
  items: { name: string; value: number }[]
  valueFormatter: (n: number) => string
  barClass: string
}) {
  const max = Math.max(...items.map((i) => i.value), 1)
  return (
    <ul className='space-y-3'>
      {items.map((i) => {
        const width = `${Math.round((i.value / max) * 100)}%`
        return (
          <li key={i.name} className='flex items-center justify-between gap-3'>
            <div className='min-w-0 flex-1'>
              <div className='mb-1 truncate text-xs text-muted-foreground'>
                {i.name}
              </div>
              <div className='h-2.5 w-full rounded-full bg-muted'>
                <div
                  className={`h-2.5 rounded-full ${barClass}`}
                  style={{ width }}
                />
              </div>
            </div>
            <div className='ps-2 text-xs font-medium tabular-nums'>
              {valueFormatter(i.value)}
            </div>
          </li>
        )
      })}
    </ul>
  )
}
