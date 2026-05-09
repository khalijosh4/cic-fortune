import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { useAuthStore } from '@/stores/auth-store'
import { User, Mail, Shield, Calendar } from 'lucide-react'

export function UserDashboard() {
  const { auth } = useAuthStore()
  const user = auth.user

  if (!user) {
    return (
      <div className='flex h-[calc(100svh-12rem)] w-full items-center justify-center'>
        <p className='text-muted-foreground'>Unable to load user information.</p>
      </div>
    )
  }

  return (
    <div className='space-y-4'>
      <div>
        <h1 className='text-2xl font-bold tracking-tight'>
          Welcome, {user.firstName}!
        </h1>
        <p className='text-muted-foreground'>
          Your personal dashboard.
        </p>
      </div>

      <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-3'>
        <Card className='col-span-1'>
          <CardHeader>
            <CardTitle className='flex items-center gap-2 text-lg'>
              <User className='h-5 w-5' />
              Profile
            </CardTitle>
          </CardHeader>
          <CardContent className='space-y-3'>
            <div className='flex items-center gap-2'>
              <User className='h-4 w-4 text-muted-foreground' />
              <span className='text-sm'>
                {user.firstName} {user.lastName}
              </span>
            </div>
            <div className='flex items-center gap-2'>
              <Mail className='h-4 w-4 text-muted-foreground' />
              <span className='text-sm'>{user.email}</span>
            </div>
            <div className='flex items-center gap-2'>
              <Shield className='h-4 w-4 text-muted-foreground' />
              <span className='text-sm capitalize'>
                {user.role.replace('_', ' ')}
              </span>
            </div>
            <div className='flex items-center gap-2'>
              <Calendar className='h-4 w-4 text-muted-foreground' />
              <span className='text-sm'>
                ID: {user.id}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className='col-span-1 lg:col-span-2'>
          <CardHeader>
            <CardTitle className='text-lg'>Quick Links</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='grid gap-3 sm:grid-cols-2'>
              <a
                href='/settings'
                className='rounded-lg border p-4 text-sm font-medium transition-colors hover:bg-muted'
              >
                Profile Settings
              </a>
              <a
                href='/settings/security'
                className='rounded-lg border p-4 text-sm font-medium transition-colors hover:bg-muted'
              >
                Security Settings
              </a>
              <a
                href='/settings/appearance'
                className='rounded-lg border p-4 text-sm font-medium transition-colors hover:bg-muted'
              >
                Appearance
              </a>
              <a
                href='/help-center'
                className='rounded-lg border p-4 text-sm font-medium transition-colors hover:bg-muted'
              >
                Help Center
              </a>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
