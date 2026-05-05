import { db, schema } from '@fastify-forge/db';
import { eq } from 'drizzle-orm';
const { claim, member, policy } = schema;

export class ClaimsService {
  static async evaluateClaimLimits(claimId: string) {
    const [claimData] = await db.select().from(claim).where(eq(claim.id, claimId)).limit(1);
    if (!claimData) throw new Error('Claim not found');

    if (!claimData.memberId) throw new Error('Claim has no member associated');
    const [memberData] = await db.select().from(member).where(eq(member.id, claimData.memberId)).limit(1);
    if (!memberData) throw new Error('Member not found');

    if (!memberData.policyId) throw new Error('Member has no policy associated');
    const [policyData] = await db.select().from(policy).where(eq(policy.id, memberData.policyId)).limit(1);
    if (!policyData) throw new Error('Policy not found');

    const amountClaimed = parseFloat(claimData.amountClaimed);
    const annualLimit = parseFloat(policyData.annualLimit);
    const usedAnnualLimit = parseFloat(memberData.usedAnnualLimit || '0');

    const remainingAnnualLimit = annualLimit - usedAnnualLimit;
    
    let isExceeded = false;
    let suggestedApprovalAmount = amountClaimed;

    if (amountClaimed > remainingAnnualLimit) {
      isExceeded = true;
      suggestedApprovalAmount = remainingAnnualLimit > 0 ? remainingAnnualLimit : 0;
    }

    // Return the evaluation
    return {
      claimId,
      amountClaimed,
      remainingAnnualLimit,
      isExceeded,
      suggestedApprovalAmount: suggestedApprovalAmount.toFixed(2),
    };
  }

  static async approveClaim(claimId: string, amountApproved: string) {
    const [claimData] = await db.select().from(claim).where(eq(claim.id, claimId)).limit(1);
    if (!claimData) throw new Error('Claim not found');

    if (!claimData.memberId) throw new Error('Claim has no member associated');
    const [memberData] = await db.select().from(member).where(eq(member.id, claimData.memberId)).limit(1);
    
    const approved = parseFloat(amountApproved);
    const usedAnnualLimit = parseFloat(memberData.usedAnnualLimit || '0');
    const newUsedAnnualLimit = usedAnnualLimit + approved;

    // Update claim
    const updatedClaimResult = await db.update(claim)
      .set({ status: 'approved', amountApproved: amountApproved })
      .where(eq(claim.id, claimId))
      .returning() as any;
    
    const updatedClaim = updatedClaimResult[0];

    // Update member's used limits
    await db.update(member)
      .set({ usedAnnualLimit: newUsedAnnualLimit.toFixed(2) })
      .where(eq(member.id, memberData.id));

    return updatedClaim;
  }
}
