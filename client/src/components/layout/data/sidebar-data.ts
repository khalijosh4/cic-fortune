import {
  Settings,
  UserCog,
  Wrench,
  Palette,
  Bell,
  Monitor,
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
        },
        {
          title: 'Branches',
          url: '/branches',
          icon: Building2,
        },
        {
          title: 'Hospitals',
          url: '/hospitals',
          icon: Hospital,
        },
        {
          title: 'Policies',
          url: '/policies',
          icon: ShieldCheck,
        },
        {
          title: 'Members',
          url: '/members',
          icon: Users,
        },
        {
          title: 'User Management',
          url: '/users',
          icon: UserCog,
        },
        {
          title: 'Claims',
          url: '/claims',
          icon: FileText,
        },
        {
          title: 'Premiums',
          url: '/premiums',
          icon: DollarSign,
        },
        {
          title: 'Audit Logs',
          url: '/audit-logs',
          icon: FileText,
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
              title: 'Account',
              url: '/settings/account',
              icon: Wrench,
            },
            {
              title: 'Appearance',
              url: '/settings/appearance',
              icon: Palette,
            },
            {
              title: 'Notifications',
              url: '/settings/notifications',
              icon: Bell,
            },
            {
              title: 'Display',
              url: '/settings/display',
              icon: Monitor,
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
