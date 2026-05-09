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
          requiredRoles: ['admin', 'system_admin', 'ceo', 'hr', 'branch_manager', 'claims_officer', 'hospital', 'user'],
        },
        {
          title: 'Branches',
          url: '/branches',
          icon: Building2,
          requiredRoles: ['admin', 'system_admin', 'ceo', 'hr'],
        },
        {
          title: 'Hospitals',
          url: '/hospitals',
          icon: Hospital,
          requiredRoles: ['admin', 'system_admin'],
        },
        {
          title: 'Plans',
          url: '/plans',
          icon: ShieldCheck,
          requiredRoles: ['admin', 'system_admin', 'ceo', 'hr'],
        },
        {
          title: 'Members',
          url: '/members',
          icon: Users,
          requiredRoles: ['admin', 'system_admin', 'ceo', 'hr', 'branch_manager', 'claims_officer'],
        },
        {
          title: 'User Management',
          url: '/users',
          icon: UserCog,
          requiredRoles: ['admin', 'system_admin', 'hr', 'branch_manager'],
        },
        {
          title: 'Claims',
          url: '/claims',
          icon: FileText,
          requiredRoles: ['admin', 'system_admin', 'ceo', 'hr', 'branch_manager', 'claims_officer', 'hospital'],
        },
        {
          title: 'Premiums',
          url: '/premiums',
          icon: DollarSign,
          requiredRoles: ['admin', 'system_admin', 'ceo', 'hr', 'branch_manager', 'claims_officer'],
        },
        {
          title: 'Audit Logs',
          url: '/audit-logs',
          icon: FileText,
          requiredRoles: ['admin', 'system_admin', 'ceo'],
        },
      ],
    },
    {
      title: 'Other',
      items: [
        {
          title: 'Settings',
          icon: Settings,
          requiredRoles: ['admin', 'system_admin', 'ceo', 'hr', 'branch_manager', 'claims_officer', 'hospital', 'user'],
          items: [
            {
              title: 'Profile',
              url: '/settings',
              icon: UserCog,
              requiredRoles: ['admin', 'system_admin', 'ceo', 'hr', 'branch_manager', 'claims_officer', 'hospital', 'user'],
            },
            {
              title: 'Security',
              url: '/settings/security',
              icon: Wrench,
              requiredRoles: ['admin', 'system_admin', 'ceo', 'hr', 'branch_manager', 'claims_officer', 'hospital', 'user'],
            },
            {
              title: 'Appearance',
              url: '/settings/appearance',
              icon: Palette,
              requiredRoles: ['admin', 'system_admin', 'ceo', 'hr', 'branch_manager', 'claims_officer', 'hospital', 'user'],
            },
          ],
        },
        {
          title: 'Help Center',
          url: '/help-center',
          icon: HelpCircle,
          requiredRoles: ['admin', 'system_admin', 'ceo', 'hr', 'branch_manager', 'claims_officer', 'hospital', 'user'],
        },
      ],
    },
  ],
}
