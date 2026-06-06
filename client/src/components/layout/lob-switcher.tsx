import * as React from 'react'
import { ChevronsUpDown, Plus, Building2 } from 'lucide-react'
import { useNavigate } from '@tanstack/react-router'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar'
import { useLobStore } from '@/stores/lob-store'
import { useAuthStore } from '@/stores/auth-store'
import { useLobs } from '@/hooks/use-lobs'
import { hasPermission } from '@/lib/permissions'

export function LobSwitcher() {
  const { isMobile } = useSidebar()
  const navigate = useNavigate()
  const { activeLob, setActiveLob, userLobIds, setUserLobIds } = useLobStore()
  const userPermissions = useAuthStore((s) => s.auth.user?.permissions)
  const userLobIdsFromAuth = useAuthStore((s) => s.auth.user?.lobIds)
  const { data: lobsData } = useLobs()

  const allLobs = lobsData?.data || []
  const canSwitch = hasPermission(userPermissions, 'lobs.switch') || hasPermission(userPermissions, 'lobs.read')

  React.useEffect(() => {
    if (userLobIdsFromAuth && userLobIdsFromAuth.length > 0 && userLobIds.length === 0) {
      setUserLobIds(userLobIdsFromAuth)
    }
  }, [userLobIdsFromAuth, userLobIds.length, setUserLobIds])

  const availableLobs = React.useMemo(() => {
    if (canSwitch) return allLobs
    return allLobs.filter((lob) => userLobIds.includes(lob.id))
  }, [allLobs, userLobIds, canSwitch])

  React.useEffect(() => {
    if (!activeLob && availableLobs.length > 0) {
      setActiveLob({
        id: availableLobs[0].id,
        name: availableLobs[0].name,
        code: availableLobs[0].code,
        icon: availableLobs[0].icon,
      })
    }
  }, [availableLobs, activeLob, setActiveLob])

  if (availableLobs.length === 0) return null

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size='lg'
              className='data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground'
            >
              <div className='flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground overflow-hidden'>
                <Building2 className='size-4' />
              </div>
              <div className='grid flex-1 text-start text-sm leading-tight'>
                <span className='truncate font-semibold'>
                  {activeLob?.name || 'Select LOB'}
                </span>
                <span className='truncate text-xs'>{activeLob?.code || ''}</span>
              </div>
              <ChevronsUpDown className='ms-auto' />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className='w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg'
            align='start'
            side={isMobile ? 'bottom' : 'right'}
            sideOffset={4}
          >
            <DropdownMenuLabel className='text-xs text-muted-foreground'>
              Lines of Business
            </DropdownMenuLabel>
            {availableLobs.map((lob, index) => (
              <DropdownMenuItem
                key={lob.id}
                onClick={() =>
                  setActiveLob({
                    id: lob.id,
                    name: lob.name,
                    code: lob.code,
                    icon: lob.icon,
                  })
                }
                className='gap-2 p-2'
              >
                <div className='flex size-6 items-center justify-center rounded-sm border'>
                  <Building2 className='size-3' />
                </div>
                {lob.name}
                <DropdownMenuShortcut>⌘{index + 1}</DropdownMenuShortcut>
              </DropdownMenuItem>
            ))}
            {canSwitch && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className='gap-2 p-2'
                  onClick={() => navigate({ to: '/line-of-business/new' })}
                >
                  <div className='flex size-6 items-center justify-center rounded-md border bg-background'>
                    <Plus className='size-4' />
                  </div>
                  <div className='font-medium text-muted-foreground'>Add line of business</div>
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
