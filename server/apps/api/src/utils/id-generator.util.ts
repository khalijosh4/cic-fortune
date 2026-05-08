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
  const lastUser = await db.select({ id: schema.user.id })
    .from(schema.user)
    .where(sql`${schema.user.id} LIKE ${prefix + '%'}`)
    .orderBy(desc(schema.user.id))
    .limit(1);

  let nextNumber = 1;
  if (lastUser.length > 0 && lastUser[0].id) {
    const lastId = lastUser[0].id;
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
  
  const lastBranch = await db.select({ id: schema.branch.id })
    .from(schema.branch)
    .where(sql`${schema.branch.id} LIKE ${prefix + '%'}`)
    .orderBy(desc(schema.branch.id))
    .limit(1);

  let nextNumber = 1;
  if (lastBranch.length > 0 && lastBranch[0].id) {
    const lastId = lastBranch[0].id;
    const parts = lastId.split('-');
    const lastNum = parseInt(parts[parts.length - 1], 10);
    if (!isNaN(lastNum)) {
      nextNumber = lastNum + 1;
    }
  }

  return `${prefix}${nextNumber.toString().padStart(3, '0')}`;
}

/**
 * Generates a structured Member ID: MEM-[BRANCH]-[YEAR]-[COUNTER]
 */
export async function generateStructuredMemberId(branchId: string): Promise<string> {
  const [branch] = await db.select({ name: schema.branch.name })
    .from(schema.branch)
    .where(sql`${schema.branch.id} = ${branchId}`)
    .limit(1);
  
  const branchName = branch?.name || 'GEN';
  const branchCode = branchName.substring(0, 3).toUpperCase();
  const year = new Date().getFullYear();
  const prefix = `MEM-${branchCode}-${year}-`;

  const lastMember = await db.select({ id: schema.member.id })
    .from(schema.member)
    .where(sql`${schema.member.id} LIKE ${prefix + '%'}`)
    .orderBy(desc(schema.member.id))
    .limit(1);

  let nextNumber = 1;
  if (lastMember.length > 0 && lastMember[0].id) {
    const parts = lastMember[0].id.split('-');
    const lastNum = parseInt(parts[parts.length - 1], 10);
    if (!isNaN(lastNum)) nextNumber = lastNum + 1;
  }

  return `${prefix}${nextNumber.toString().padStart(4, '0')}`;
}

/**
 * Generates a structured Hospital ID: HSP-[NAME_CODE]-[COUNTER]
 */
export async function generateStructuredHospitalId(name: string): Promise<string> {
  const nameCode = name.substring(0, 3).toUpperCase();
  const prefix = `HSP-${nameCode}-`;
  
  const lastHospital = await db.select({ id: schema.hospital.id })
    .from(schema.hospital)
    .where(sql`${schema.hospital.id} LIKE ${prefix + '%'}`)
    .orderBy(desc(schema.hospital.id))
    .limit(1);

  let nextNumber = 1;
  if (lastHospital.length > 0 && lastHospital[0].id) {
    const parts = lastHospital[0].id.split('-');
    const lastNum = parseInt(parts[parts.length - 1], 10);
    if (!isNaN(lastNum)) nextNumber = lastNum + 1;
  }

  return `${prefix}${nextNumber.toString().padStart(3, '0')}`;
}

/**
 * Generates a structured Claim ID: CLM-[YEAR]-[COUNTER]
 */
export async function generateStructuredClaimId(): Promise<string> {
  const year = new Date().getFullYear();
  const prefix = `CLM-${year}-`;

  const lastClaim = await db.select({ id: schema.claim.id })
    .from(schema.claim)
    .where(sql`${schema.claim.id} LIKE ${prefix + '%'}`)
    .orderBy(desc(schema.claim.id))
    .limit(1);

  let nextNumber = 1;
  if (lastClaim.length > 0 && lastClaim[0].id) {
    const parts = lastClaim[0].id.split('-');
    const lastNum = parseInt(parts[parts.length - 1], 10);
    if (!isNaN(lastNum)) nextNumber = lastNum + 1;
  }

  return `${prefix}${nextNumber.toString().padStart(4, '0')}`;
}

/**
 * Generates a structured Premium/Payment ID: PMT-[YEAR]-[COUNTER]
 */
export async function generateStructuredPremiumId(): Promise<string> {
  const year = new Date().getFullYear();
  const prefix = `PMT-${year}-`;

  const lastPremium = await db.select({ id: schema.premium.id })
    .from(schema.premium)
    .where(sql`${schema.premium.id} LIKE ${prefix + '%'}`)
    .orderBy(desc(schema.premium.id))
    .limit(1);

  let nextNumber = 1;
  if (lastPremium.length > 0 && lastPremium[0].id) {
    const parts = lastPremium[0].id.split('-');
    const lastNum = parseInt(parts[parts.length - 1], 10);
    if (!isNaN(lastNum)) nextNumber = lastNum + 1;
  }

  return `${prefix}${nextNumber.toString().padStart(5, '0')}`;
}

/**
 * Generates a structured Plan ID: PLN-[NAME_CODE]-[COUNTER]
 */
export async function generateStructuredPlanId(name: string): Promise<string> {
  const nameCode = name.substring(0, 3).toUpperCase();
  const prefix = `PLN-${nameCode}-`;

  const lastPlan = await db.select({ id: schema.premiumRate.id })
    .from(schema.premiumRate)
    .where(sql`${schema.premiumRate.id} LIKE ${prefix + '%'}`)
    .orderBy(desc(schema.premiumRate.id))
    .limit(1);

  let nextNumber = 1;
  if (lastPlan.length > 0 && lastPlan[0].id) {
    const parts = lastPlan[0].id.split('-');
    const lastNum = parseInt(parts[parts.length - 1], 10);
    if (!isNaN(lastNum)) nextNumber = lastNum + 1;
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
