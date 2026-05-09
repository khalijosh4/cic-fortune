export type Role =
  | 'system_admin'
  | 'admin'
  | 'ceo'
  | 'hr'
  | 'branch_manager'
  | 'claims_officer'
  | 'hospital'
  | 'user'

export interface FeatureFlags {
  canCreate: boolean
  canEdit: boolean
  canDelete: boolean
}

export type Resource =
  | 'branches'
  | 'members'
  | 'claims'
  | 'hospitals'
  | 'plans'
  | 'premiums'
  | 'users'
  | 'audit-logs'
  | 'tasks'

const GLOBAL_ROLES: Role[] = ['admin', 'system_admin', 'ceo', 'hr']
const BRANCH_ROLES: Role[] = ['branch_manager', 'claims_officer', 'user']

const ROUTE_PERMISSIONS: Record<Role, string[]> = {
  system_admin: ['*'],
  admin: ['*'],
  ceo: ['*'],
  hr: ['*'],
  branch_manager: [
    '/',
    '/members',
    '/members/*',
    '/claims',
    '/claims/*',
    '/premiums',
    '/premiums/*',
    '/settings',
    '/settings/*',
    '/tasks',
    '/chats',
    '/help-center',
  ],
  claims_officer: [
    '/',
    '/members',
    '/members/*',
    '/claims',
    '/claims/*',
    '/premiums',
    '/premiums/*',
    '/settings',
    '/settings/*',
    '/tasks',
    '/help-center',
  ],
  hospital: [
    '/',
    '/claims',
    '/claims/*',
    '/settings',
    '/settings/*',
    '/help-center',
  ],
  user: [
    '/',
    '/settings',
    '/settings/*',
    '/tasks',
    '/help-center',
  ],
}

const FEATURE_FLAGS: Record<Resource, Record<Role, FeatureFlags>> = {
  branches: {
    system_admin: { canCreate: true, canEdit: true, canDelete: true },
    admin: { canCreate: true, canEdit: true, canDelete: true },
    ceo: { canCreate: false, canEdit: false, canDelete: false },
    hr: { canCreate: false, canEdit: false, canDelete: false },
    branch_manager: { canCreate: false, canEdit: false, canDelete: false },
    claims_officer: { canCreate: false, canEdit: false, canDelete: false },
    hospital: { canCreate: false, canEdit: false, canDelete: false },
    user: { canCreate: false, canEdit: false, canDelete: false },
  },
  members: {
    system_admin: { canCreate: true, canEdit: true, canDelete: true },
    admin: { canCreate: true, canEdit: true, canDelete: true },
    ceo: { canCreate: false, canEdit: false, canDelete: false },
    hr: { canCreate: false, canEdit: false, canDelete: false },
    branch_manager: { canCreate: true, canEdit: true, canDelete: false },
    claims_officer: { canCreate: false, canEdit: true, canDelete: false },
    hospital: { canCreate: false, canEdit: false, canDelete: false },
    user: { canCreate: false, canEdit: false, canDelete: false },
  },
  claims: {
    system_admin: { canCreate: true, canEdit: true, canDelete: true },
    admin: { canCreate: true, canEdit: true, canDelete: true },
    ceo: { canCreate: false, canEdit: false, canDelete: false },
    hr: { canCreate: false, canEdit: false, canDelete: false },
    branch_manager: { canCreate: false, canEdit: false, canDelete: false },
    claims_officer: { canCreate: false, canEdit: true, canDelete: false },
    hospital: { canCreate: true, canEdit: false, canDelete: false },
    user: { canCreate: false, canEdit: false, canDelete: false },
  },
  hospitals: {
    system_admin: { canCreate: true, canEdit: true, canDelete: true },
    admin: { canCreate: true, canEdit: true, canDelete: true },
    ceo: { canCreate: false, canEdit: false, canDelete: false },
    hr: { canCreate: false, canEdit: false, canDelete: false },
    branch_manager: { canCreate: false, canEdit: false, canDelete: false },
    claims_officer: { canCreate: false, canEdit: false, canDelete: false },
    hospital: { canCreate: false, canEdit: false, canDelete: false },
    user: { canCreate: false, canEdit: false, canDelete: false },
  },
  plans: {
    system_admin: { canCreate: true, canEdit: true, canDelete: true },
    admin: { canCreate: true, canEdit: true, canDelete: true },
    ceo: { canCreate: false, canEdit: false, canDelete: false },
    hr: { canCreate: false, canEdit: false, canDelete: false },
    branch_manager: { canCreate: false, canEdit: false, canDelete: false },
    claims_officer: { canCreate: false, canEdit: false, canDelete: false },
    hospital: { canCreate: false, canEdit: false, canDelete: false },
    user: { canCreate: false, canEdit: false, canDelete: false },
  },
  premiums: {
    system_admin: { canCreate: true, canEdit: true, canDelete: true },
    admin: { canCreate: true, canEdit: true, canDelete: true },
    ceo: { canCreate: false, canEdit: false, canDelete: false },
    hr: { canCreate: false, canEdit: false, canDelete: false },
    branch_manager: { canCreate: false, canEdit: false, canDelete: false },
    claims_officer: { canCreate: false, canEdit: false, canDelete: false },
    hospital: { canCreate: false, canEdit: false, canDelete: false },
    user: { canCreate: false, canEdit: false, canDelete: false },
  },
  users: {
    system_admin: { canCreate: true, canEdit: true, canDelete: true },
    admin: { canCreate: true, canEdit: true, canDelete: true },
    ceo: { canCreate: false, canEdit: false, canDelete: false },
    hr: { canCreate: false, canEdit: true, canDelete: false },
    branch_manager: { canCreate: true, canEdit: true, canDelete: false },
    claims_officer: { canCreate: false, canEdit: false, canDelete: false },
    hospital: { canCreate: false, canEdit: false, canDelete: false },
    user: { canCreate: false, canEdit: false, canDelete: false },
  },
  'audit-logs': {
    system_admin: { canCreate: true, canEdit: false, canDelete: false },
    admin: { canCreate: true, canEdit: false, canDelete: false },
    ceo: { canCreate: true, canEdit: false, canDelete: false },
    hr: { canCreate: false, canEdit: false, canDelete: false },
    branch_manager: { canCreate: false, canEdit: false, canDelete: false },
    claims_officer: { canCreate: false, canEdit: false, canDelete: false },
    hospital: { canCreate: false, canEdit: false, canDelete: false },
    user: { canCreate: false, canEdit: false, canDelete: false },
  },
  tasks: {
    system_admin: { canCreate: true, canEdit: true, canDelete: true },
    admin: { canCreate: true, canEdit: true, canDelete: true },
    ceo: { canCreate: true, canEdit: true, canDelete: true },
    hr: { canCreate: true, canEdit: true, canDelete: true },
    branch_manager: { canCreate: true, canEdit: true, canDelete: true },
    claims_officer: { canCreate: true, canEdit: true, canDelete: true },
    hospital: { canCreate: true, canEdit: true, canDelete: true },
    user: { canCreate: true, canEdit: true, canDelete: true },
  },
}

export type DashboardVariant = 'global' | 'branch' | 'claims' | 'hospital' | 'user'

const DASHBOARD_VARIANT: Record<Role, DashboardVariant> = {
  system_admin: 'global',
  admin: 'global',
  ceo: 'global',
  hr: 'global',
  branch_manager: 'branch',
  claims_officer: 'claims',
  hospital: 'hospital',
  user: 'user',
}

export function isRouteAllowed(role: Role | null | undefined, path: string): boolean {
  if (!role) return false

  const allowedPatterns = ROUTE_PERMISSIONS[role]
  if (!allowedPatterns) return false
  if (allowedPatterns.includes('*')) return true

  return allowedPatterns.some((pattern) => {
    if (pattern.endsWith('/*')) {
      const base = pattern.slice(0, -2)
      return path === base || path.startsWith(base + '/')
    }
    return path === pattern
  })
}

export function getFeatureFlags(role: Role | null | undefined, resource: Resource): FeatureFlags {
  if (!role) return { canCreate: false, canEdit: false, canDelete: false }

  const resourceFlags = FEATURE_FLAGS[resource]
  if (!resourceFlags) return { canCreate: false, canEdit: false, canDelete: false }

  return resourceFlags[role] ?? { canCreate: false, canEdit: false, canDelete: false }
}

export function getDashboardVariant(role: Role | null | undefined): DashboardVariant {
  if (!role) return 'user'
  return DASHBOARD_VARIANT[role] ?? 'user'
}

export function isGlobalRole(role: Role | null | undefined): boolean {
  if (!role) return false
  return GLOBAL_ROLES.includes(role as Role)
}

export function isBranchRole(role: Role | null | undefined): boolean {
  if (!role) return false
  return BRANCH_ROLES.includes(role as Role)
}

export { ROUTE_PERMISSIONS }
