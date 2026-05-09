import {
  Settings,
  UserCog,
  Wrench,
  Palette,
  HelpCircle,
  Command,
  Hospital,
  Building2,
  LayoutDashboard,
  ShieldCheck,
  Users,
  FileText,
  DollarSign,
} from 'lucide-react'
import { type SidebarData } from '../types'

export const sidebarData: SidebarData = {
  user: {
    name: 'Admin',
    email: 'admin@fortunesacco.com',
    avatar: '/avatars/shadcn.jpg',
  },
  teams: [
    {
      name: 'Fortune Sacco',
      logo: Command,
      plan: 'CIC Health Insurance',
    },
  ],
  navGroups: [
    {
      title: 'General',
      items: [
        {
          title: 'Dashboard',
          url: '/',
          icon: LayoutDashboard,
          requiredPermissions: ['dashboard.read'],
        },
        {
          title: 'Branches',
          url: '/branches',
          icon: Building2,
          requiredPermissions: ['branches.read'],
        },
        {
          title: 'Hospitals',
          url: '/hospitals',
          icon: Hospital,
          requiredPermissions: ['hospitals.read'],
        },
        {
          title: 'Plans',
          url: '/plans',
          icon: ShieldCheck,
          requiredPermissions: ['plans.read'],
        },
        {
          title: 'Members',
          url: '/members',
          icon: Users,
          requiredPermissions: ['members.read'],
        },
        {
          title: 'User Management',
          url: '/users',
          icon: UserCog,
          requiredPermissions: ['users.read'],
        },
        {
          title: 'Claims',
          url: '/claims',
          icon: FileText,
          requiredPermissions: ['claims.read'],
        },
        {
          title: 'Premiums',
          url: '/premiums',
          icon: DollarSign,
          requiredPermissions: ['premiums.read'],
        },
        {
          title: 'Audit Logs',
          url: '/audit-logs',
          icon: FileText,
          requiredPermissions: ['audit-logs.read'],
        },
      ],
    },
    {
      title: 'Other',
      items: [
        {
          title: 'Settings',
          icon: Settings,
          items: [
            {
              title: 'Profile',
              url: '/settings',
              icon: UserCog,
            },
            {
              title: 'Security',
              url: '/settings/security',
              icon: Wrench,
            },
            {
              title: 'Appearance',
              url: '/settings/appearance',
              icon: Palette,
            },
          ],
        },
        {
          title: 'Help Center',
          url: '/help-center',
          icon: HelpCircle,
        },
      ],
    },
  ],
}
