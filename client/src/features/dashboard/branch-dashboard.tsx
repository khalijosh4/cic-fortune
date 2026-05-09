import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { useBranchDashboard } from '@/hooks/use-dashboard'
import { GeneralError } from '@/features/errors/general-error'
import { Overview } from './components/overview'
import { RecentSales } from './components/recent-sales'
import { useAuthStore } from '@/stores/auth-store'
import { Building2, Users, DollarSign, FileText, Activity, AlertTriangle, BarChart3 } from 'lucide-react'
import { isAxiosError } from 'axios'
import { EmptySection } from '@/components/empty-state'

export function BranchDashboard() {
  const { data, isLoading, error } = useBranchDashboard()
  const { auth } = useAuthStore()

  const stats = data?.stats
  const recentClaims = data?.recentClaims || []
  const recentMembers = data?.recentMembers || []
  const chartData = data?.chartData || []
  const hasStats = stats && (stats.totalMembers > 0 || stats.totalPremiums > 0)

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

  if (error) {
    if (isAxiosError(error) && error.response?.status === 403) {
      return (
        <div className='flex h-[calc(100svh-12rem)] w-full items-center justify-center'>
          <Card className='w-full max-w-md'>
            <CardHeader>
              <CardTitle className='flex items-center gap-2 text-amber-600'>
                <AlertTriangle className='h-5 w-5' />
                No Branch Assigned
              </CardTitle>
              <CardDescription>
                Your account ({auth.user?.email}) has been registered as a branch manager but is not yet assigned to a branch.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className='text-sm text-muted-foreground'>
                Please contact an administrator to assign you to a branch. Once assigned, the branch dashboard will show your branch's performance data.
              </p>
            </CardContent>
          </Card>
        </div>
      )
    }
    return <GeneralError />
  }

  if (!hasStats && !recentMembers.length && !recentClaims.length) {
    return (
      <div className='space-y-4'>
        {stats && (
          <div className='flex items-center gap-3 rounded-lg border bg-card p-4 text-card-foreground shadow-sm'>
            <Building2 className='h-8 w-8 text-primary' />
            <div>
              <h2 className='text-xl font-bold'>{stats.branchName}</h2>
              <p className='text-sm text-muted-foreground'>{stats.branchLocation}</p>
            </div>
          </div>
        )}
        <Card>
          <CardContent className='py-12'>
            <EmptySection icon={<BarChart3 className='h-12 w-12' />} title='No Branch Data' description='Branch performance data will appear once members are added and claims are processed.' />
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className='space-y-4'>
      {stats && (
        <div className='flex items-center gap-3 rounded-lg border bg-card p-4 text-card-foreground shadow-sm'>
          <Building2 className='h-8 w-8 text-primary' />
          <div>
            <h2 className='text-xl font-bold'>{stats.branchName}</h2>
            <p className='text-sm text-muted-foreground'>{stats.branchLocation}</p>
          </div>
        </div>
      )}

      <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-4'>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Total Members</CardTitle>
            <Users className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>
              {stats?.totalMembers.toLocaleString()}
            </div>
            <p className='text-xs text-muted-foreground'>
              {stats?.activeMembers.toLocaleString()} active
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Premiums Collected</CardTitle>
            <DollarSign className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>
              KES {stats?.totalPremiums.toLocaleString()}
            </div>
            <p className='text-xs text-muted-foreground'>
              KES {stats?.pendingPremiums.toLocaleString()} pending
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Approved Claims</CardTitle>
            <FileText className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>
              {stats?.approvedClaims.toLocaleString()}
            </div>
            <p className='text-xs text-muted-foreground'>
              {stats?.rejectedClaims.toLocaleString()} rejected
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Pending Claims</CardTitle>
            <Activity className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>
              {stats?.pendingClaims.toLocaleString()}
            </div>
            <p className='text-xs text-muted-foreground'>
              awaiting processing
            </p>
          </CardContent>
        </Card>
      </div>

      <div className='grid grid-cols-1 gap-4 lg:grid-cols-7'>
        <Card className='col-span-1 lg:col-span-4'>
          <CardHeader>
            <CardTitle>Overview</CardTitle>
          </CardHeader>
          <CardContent className='ps-2'>
            {chartData.length > 0 ? <Overview data={chartData} /> : <EmptySection title='No Chart Data' description='Chart data will appear once monthly records are available.' />}
          </CardContent>
        </Card>
        <Card className='col-span-1 lg:col-span-3'>
          <CardHeader>
            <CardTitle>Recent Claims</CardTitle>
            <CardDescription>
              Latest claims from your branch.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <RecentSales claims={recentClaims} />
          </CardContent>
        </Card>
      </div>

      {recentMembers.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Members</CardTitle>
            <CardDescription>
              Newly enrolled members in your branch.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className='space-y-3'>
              {recentMembers.map((member) => (
                <div
                  key={member.id}
                  className='flex items-center justify-between rounded-lg border p-3'
                >
                  <div>
                    <p className='font-medium'>{member.name}</p>
                    <p className='text-xs text-muted-foreground'>
                      {member.createdAt
                        ? new Date(member.createdAt).toLocaleDateString()
                        : 'N/A'}
                    </p>
                  </div>
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      member.status === 'active'
                        ? 'bg-green-100 text-green-800'
                        : member.status === 'pending'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {member.status}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
