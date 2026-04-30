import { db, schema } from '@fastify-forge/db';
import { eq } from 'drizzle-orm';
const { premium, member } = schema;

export class PremiumService {
  static async generatePremium(memberId: string, dueDate: Date) {
    const [memberData] = await db.select().from(member).where(eq(member.id, memberId)).limit(1);
    if (!memberData) throw new Error('Member not found');

    const amountDue = memberData.premiumRate;

    const newPremiumResult = await db.insert(premium).values({
      memberId,
      amountDue,
      dueDate,
      amountPaid: '0',
    }).returning() as any;

    const newPremium = newPremiumResult[0];

    return newPremium;
  }

  static async recordPayment(premiumId: string, amountPaid: string, paymentMethod: any) {
    const [premiumData] = await db.select().from(premium).where(eq(premium.id, premiumId)).limit(1);
    if (!premiumData) throw new Error('Premium not found');

    const currentPaid = parseFloat(premiumData.amountPaid || '0');
    const newlyPaid = parseFloat(amountPaid);
    const totalPaid = currentPaid + newlyPaid;

    const updatedPremiumResult = await db.update(premium)
      .set({ 
        amountPaid: totalPaid.toFixed(2),
        paymentMethod: paymentMethod || premiumData.paymentMethod
      })
      .where(eq(premium.id, premiumId))
      .returning() as any;

    const updatedPremium = updatedPremiumResult[0];

    return updatedPremium;
  }
}
