import { createFileRoute } from '@tanstack/react-router'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { LOBSummary } from '@/features/line-of-business/components/lob-summary'

export const Route = createFileRoute('/_authenticated/lob-summary')({
  component: LOBSummaryPage,
})

function LOBSummaryPage() {
  return (
    <>
      <Header fixed>
        <Search className='me-auto' />
        <ThemeSwitch />
        <ProfileDropdown />
      </Header>
      <Main className='flex flex-1 flex-col gap-4 sm:gap-6'>
        <div>
          <h2 className='text-2xl font-bold tracking-tight'>LOB Overview</h2>
          <p className='text-muted-foreground'>
            Summary of all lines of business across the organization.
          </p>
        </div>
        <LOBSummary />
      </Main>
    </>
  )
}
