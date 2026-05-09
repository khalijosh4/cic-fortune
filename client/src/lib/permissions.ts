export type Role =
  | 'system_admin'
  | 'admin'
  | 'ceo'
  | 'hr'
  | 'branch_manager'
  | 'claims_officer'
  | 'hospital'
  | 'user'

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

const ROUTE_TO_PERMISSION: Record<string, string> = {
  '/': 'dashboard.read',
  '/dashboard': 'dashboard.read',
  '/members': 'members.read',
  '/claims': 'claims.read',
  '/premiums': 'premiums.read',
  '/users': 'users.read',
  '/branches': 'branches.read',
  '/hospitals': 'hospitals.read',
  '/plans': 'plans.read',
  '/audit-logs': 'audit-logs.read',
}

const GLOBAL_ROLES: Role[] = ['admin', 'system_admin', 'ceo', 'hr']
const BRANCH_ROLES: Role[] = ['branch_manager', 'claims_officer', 'user']

export function hasPermission(
  permissions: string[] | undefined | null,
  permission: string
): boolean {
  if (!permissions) return false
  return permissions.includes(permission)
}

export function hasAnyPermission(
  permissions: string[] | undefined | null,
  required: string[]
): boolean {
  if (!permissions) return false
  return required.some((p) => permissions.includes(p))
}

export function hasAllPermissions(
  permissions: string[] | undefined | null,
  required: string[]
): boolean {
  if (!permissions) return false
  return required.every((p) => permissions.includes(p))
}

export function isRouteAllowed(
  permissions: string[] | undefined | null,
  role: string | undefined | null,
  path: string
): boolean {
  if (!role) return false

  if (
    path === '/settings' ||
    path.startsWith('/settings/') ||
    path === '/help-center' ||
    path === '/tasks'
  ) {
    return true
  }

  const requiredPermission = ROUTE_TO_PERMISSION[path]
  if (!requiredPermission) {
    const parentPath = '/' + path.split('/').filter(Boolean)[0]
    const parentPerm = ROUTE_TO_PERMISSION[parentPath]
    if (parentPerm) return hasPermission(permissions, parentPerm)
    return false
  }

  return hasPermission(permissions, requiredPermission)
}

export function getRouteRequiredPermission(path: string): string | null {
  if (path === '/settings' || path.startsWith('/settings/') || path === '/help-center' || path === '/tasks') return null
  const perm = ROUTE_TO_PERMISSION[path]
  if (perm) return perm
  const parentPath = '/' + path.split('/').filter(Boolean)[0]
  return ROUTE_TO_PERMISSION[parentPath] || null
}

export function getFeatureFlags(
  permissions: string[] | undefined | null,
  resource: string
): { canCreate: boolean; canEdit: boolean; canDelete: boolean } {
  return {
    canCreate: hasPermission(permissions, `${resource}.create`),
    canEdit: hasPermission(permissions, `${resource}.update`),
    canDelete: hasPermission(permissions, `${resource}.delete`),
  }
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
