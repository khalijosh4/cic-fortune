import { db, schema } from '@fastify-forge/db';
import { sql, desc } from 'drizzle-orm';

/**
 * Generates a structured User ID in the format: [BRANCH_CODE]-[YEAR]-[COUNTER]
 * Example: HDB-2026-001
 */
export async function generateStructuredUserId(branchId: string): Promise<string> {
  // Fetch branch name to get code
  const [branch] = await db.select({ name: schema.branch.name })
    .from(schema.branch)
    .where(sql`${schema.branch.id} = ${branchId}`)
    .limit(1);
  
  const branchName = branch?.name || 'GEN';
  const branchCode = branchName.substring(0, 3).toUpperCase();
  const year = new Date().getFullYear();
  
  const prefix = `${branchCode}-${year}-`;

  // Find the last user with this prefix
  const lastUser = await db.select({ structuredId: schema.user.structuredId })
    .from(schema.user)
    .where(sql`${schema.user.structuredId} LIKE ${prefix + '%'}`)
    .orderBy(desc(schema.user.structuredId))
    .limit(1);

  let nextNumber = 1;
  if (lastUser.length > 0 && lastUser[0].structuredId) {
    const lastId = lastUser[0].structuredId;
    const parts = lastId.split('-');
    const lastNum = parseInt(parts[parts.length - 1], 10);
    if (!isNaN(lastNum)) {
      nextNumber = lastNum + 1;
    }
  }

  return `${prefix}${nextNumber.toString().padStart(3, '0')}`;
}

/**
 * Generates a structured Branch ID in the format: BR-[NAME_CODE]-[COUNTER]
 * Example: BR-NBI-001
 */
export async function generateStructuredBranchId(branchName: string): Promise<string> {
  const nameCode = branchName.substring(0, 3).toUpperCase();
  const prefix = `BR-${nameCode}-`;
  
  const lastBranch = await db.select({ structuredId: schema.branch.structuredId })
    .from(schema.branch)
    .where(sql`${schema.branch.structuredId} LIKE ${prefix + '%'}`)
    .orderBy(desc(schema.branch.structuredId))
    .limit(1);

  let nextNumber = 1;
  if (lastBranch.length > 0 && lastBranch[0].structuredId) {
    const lastId = lastBranch[0].structuredId;
    const parts = lastId.split('-');
    const lastNum = parseInt(parts[parts.length - 1], 10);
    if (!isNaN(lastNum)) {
      nextNumber = lastNum + 1;
    }
  }

  return `${prefix}${nextNumber.toString().padStart(3, '0')}`;
}

/**
 * Generates a random temporary password.
 */
export function generateTemporaryPassword(): string {
  const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let retVal = "";
  for (let i = 0; i < 10; ++i) {
    retVal += charset.charAt(Math.floor(Math.random() * charset.length));
  }
  return retVal;
}
