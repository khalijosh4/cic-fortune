import { createFileRoute } from '@tanstack/react-router'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { HospitalDetails } from '@/features/hospitals/components/hospital-details'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import { useNavigate } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/hospitals/new')({
  component: NewHospitalPage,
})

function NewHospitalPage() {
  const navigate = useNavigate()

  return (
    <>
      <Header fixed>
        <Search className='me-auto' />
        <ThemeSwitch />
        <ProfileDropdown />
      </Header>

      <Main className='flex flex-1 flex-col gap-4 sm:gap-6'>
        <div className='flex items-center gap-4'>
          <Button
            variant='outline'
            size='icon'
            onClick={() => navigate({ to: '/hospitals' })}
          >
            <ArrowLeft className='h-4 w-4' />
          </Button>
          <div>
            <h2 className='text-2xl font-bold tracking-tight'>New Hospital</h2>
            <p className='text-muted-foreground'>
              Register a new healthcare facility in the system.
            </p>
          </div>
        </div>

        <HospitalDetails />
      </Main>
    </>
  )
}
