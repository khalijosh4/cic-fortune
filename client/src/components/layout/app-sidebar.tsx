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

function filterNavItems(items: NavItem[], role: string): NavItem[] {
  return items.reduce<NavItem[]>((acc, item) => {
    if (item.requiredRoles && !item.requiredRoles.includes(role)) {
      return acc
    }
    if ('items' in item && item.items) {
      const filteredSubItems = item.items.filter((sub) => {
        if (sub.requiredRoles && !sub.requiredRoles.includes(role)) {
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

function filterNavGroups(groups: NavGroupType[], role: string): NavGroupType[] {
  return groups.reduce<NavGroupType[]>((acc, group) => {
    const filteredItems = filterNavItems(group.items, role)
    if (filteredItems.length === 0) return acc
    acc.push({ ...group, items: filteredItems })
    return acc
  }, [])
}

export function AppSidebar() {
  const { auth } = useAuthStore()
  const { collapsible, variant } = useLayout()
  const userRole = auth.user?.role ?? 'user'

  const user = {
    name: auth.user ? `${auth.user.firstName} ${auth.user.lastName}` : sidebarData.user.name,
    email: auth.user ? auth.user.email : sidebarData.user.email,
    avatar: sidebarData.user.avatar,
  }

  const filteredNavGroups = filterNavGroups(sidebarData.navGroups, userRole)

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
