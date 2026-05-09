import { useLayout } from '@/context/layout-provider'
import { useAuthStore } from '@/stores/auth-store'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from '@/components/ui/sidebar'
// import { AppTitle } from './app-title'
import { sidebarData } from './data/sidebar-data'
import type { NavItem, NavGroup as NavGroupType } from './types'
import { NavGroup } from './nav-group'
import { NavUser } from './nav-user'
import { TeamSwitcher } from './team-switcher'
import { hasAnyPermission } from '@/lib/permissions'

function filterNavItems(items: NavItem[], permissions: string[] | undefined): NavItem[] {
  return items.reduce<NavItem[]>((acc, item) => {
    if (item.requiredPermissions && item.requiredPermissions.length > 0 && !hasAnyPermission(permissions, item.requiredPermissions)) {
      return acc
    }
    if ('items' in item && item.items) {
      const filteredSubItems = item.items.filter((sub) => {
        if (sub.requiredPermissions && sub.requiredPermissions.length > 0 && !hasAnyPermission(permissions, sub.requiredPermissions)) {
          return false
        }
        return true
      })
      if (filteredSubItems.length === 0) return acc
      acc.push({ ...item, items: filteredSubItems })
    } else {
      acc.push(item)
    }
    return acc
  }, [])
}

function filterNavGroups(groups: NavGroupType[], permissions: string[] | undefined): NavGroupType[] {
  return groups.reduce<NavGroupType[]>((acc, group) => {
    const filteredItems = filterNavItems(group.items, permissions)
    if (filteredItems.length === 0) return acc
    acc.push({ ...group, items: filteredItems })
    return acc
  }, [])
}

export function AppSidebar() {
  const { auth } = useAuthStore()
  const { collapsible, variant } = useLayout()
  const userPermissions = auth.user?.permissions

  const user = {
    name: auth.user ? `${auth.user.firstName} ${auth.user.lastName}` : sidebarData.user.name,
    email: auth.user ? auth.user.email : sidebarData.user.email,
    avatar: sidebarData.user.avatar,
  }

  const filteredNavGroups = filterNavGroups(sidebarData.navGroups, userPermissions)

  return (
    <Sidebar collapsible={collapsible} variant={variant}>
      <SidebarHeader>
        <TeamSwitcher teams={sidebarData.teams} />
      </SidebarHeader>
      <SidebarContent>
        {filteredNavGroups.map((props) => (
          <NavGroup key={props.title} {...props} />
        ))}
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
