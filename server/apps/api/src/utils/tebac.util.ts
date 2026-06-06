import { eq, type SQL } from 'drizzle-orm';
import { schema } from '@fastify-forge/db';

export type UserPayload = {
  id: string;
  role: string;
  permissions?: string[];
  branchId?: string;
  hospitalId?: string;
  lobIds?: string[];
};

/**
 * Generates Drizzle filters based on user territory (TeBAC).
 */
export function getTerritoryFilters(user: UserPayload, table: any): SQL[] {
  const filters: SQL[] = [];
  const { role, branchId, hospitalId, lobIds } = user;

  // Global roles: no filtering
  if (['admin', 'system_admin', 'ceo', 'hr'].includes(role)) {
    return filters;
  }

  // LOB filtering for non-global roles: restrict to user's LOBs
  if (lobIds && lobIds.length > 0 && 'lobId' in table) {
    filters.push(eq(table.lobId, lobIds[0]));
  }

  // Hospital staff: restricted to their hospital
  if (role === 'hospital' && hospitalId) {
    if ('hospitalId' in table) {
      filters.push(eq(table.hospitalId, hospitalId));
    }
  }

  // Branch staff: restricted to their branch
  if (['branch_manager', 'claims_officer', 'user'].includes(role) && branchId) {
    if ('branchId' in table) {
      filters.push(eq(table.branchId, branchId));
    } else if (table === schema.branch) {
      filters.push(eq(schema.branch.id, branchId));
    }
  }

  return filters;
}

/**
 * Checks if a user has access to a specific resource territory.
 * Returns true if access is allowed, false otherwise.
 */
export function hasAccess(user: UserPayload, resource: any): boolean {
  const { role, branchId, hospitalId } = user;

  // Global roles: access granted
  if (['admin', 'system_admin', 'ceo', 'hr'].includes(role)) {
    return true;
  }

  // Hospital staff
  if (role === 'hospital' && hospitalId) {
    return resource.hospitalId === hospitalId;
  }

  // Branch staff
  if (['branch_manager', 'claims_officer', 'user'].includes(role) && branchId) {
    // If resource is a branch itself
    if ('manager' in resource && 'id' in resource) {
      return resource.id === branchId;
    }
    // Otherwise check branchId
    return resource.branchId === branchId;
  }

  return false;
}
