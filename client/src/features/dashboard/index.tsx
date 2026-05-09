import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { TopNav } from '@/components/layout/top-nav'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { ConfigDrawer } from '@/components/config-drawer'
import { useAuthStore } from '@/stores/auth-store'
import { getDashboardVariant } from '@/lib/permissions'
import { GlobalDashboard } from './global-dashboard'
import { BranchDashboard } from './branch-dashboard'
import { ClaimsDashboard } from './claims-dashboard'
import { HospitalDashboard } from './hospital-dashboard'
import { UserDashboard } from './user-dashboard'

export function Dashboard() {
  const { auth } = useAuthStore()
  const variant = getDashboardVariant(auth.user?.role as any)

  const variantTitle = {
    global: 'Dashboard',
    branch: 'Branch Dashboard',
    claims: 'Claims Dashboard',
    hospital: 'Hospital Dashboard',
    user: 'My Dashboard',
  }[variant]

  const variantDescription = {
    global: 'Overview of Fortune Sacco performance.',
    branch: 'Performance overview of your branch.',
    claims: 'Overview of claims processing.',
    hospital: 'Overview of your hospital\'s claims activity.',
    user: 'Your personal dashboard.',
  }[variant]

  return (
    <>
      <Header>
        <TopNav links={topNav} className='me-auto' />
        <Search />
        <ThemeSwitch />
        <ConfigDrawer />
        <ProfileDropdown />
      </Header>

      <Main>
        <div className='mb-2 flex items-center justify-between space-y-2'>
          <div>
            <h1 className='text-2xl font-bold tracking-tight'>{variantTitle}</h1>
            <p className='text-muted-foreground'>{variantDescription}</p>
          </div>
        </div>

        {variant === 'global' && <GlobalDashboard />}
        {variant === 'branch' && <BranchDashboard />}
        {variant === 'claims' && <ClaimsDashboard />}
        {variant === 'hospital' && <HospitalDashboard />}
        {variant === 'user' && <UserDashboard />}
      </Main>
    </>
  )
}

const topNav = [
  {
    title: 'Overview',
    href: '/dashboard',
    isActive: true,
    disabled: false,
  },
  {
    title: 'Branches',
    href: '/branches',
    isActive: false,
    disabled: false,
  },
  {
    title: 'Hospitals',
    href: '/hospitals',
    isActive: false,
    disabled: false,
  },
  {
    title: 'Settings',
    href: '/settings',
    isActive: false,
    disabled: false,
  },
]
