import { db, schema } from './index.js';
import bcrypt from 'bcryptjs';
//import { v5 as uuidv5 } from 'uuid';
import { eq } from 'drizzle-orm';
import { faker } from '@faker-js/faker';


// Constants for counts
const BRANCH_COUNT = 15;
const HOSPITAL_COUNT = 10;
const POLICY_COUNT = 20;
const USER_COUNT = 50;
const MEMBER_COUNT = 200;
const CLAIM_COUNT = 100;
const PREMIUM_COUNT = 300;
const AUDIT_LOG_COUNT = 100;

async function seed() {
  console.log('--- Starting Database Seed with Faker ---');
  faker.seed(12345); // For deterministic results

  try {
    // 1. Seed Initial Admin User
    console.log('Seeding initial admin...');
    const hashedPassword = await bcrypt.hash('Admin@2024', 10);
    const adminEmail = 'admin@fortunesacco.co.ke';
    
    const [existingAdmin] = await db.select().from(schema.user).where(eq(schema.user.email, adminEmail)).limit(1);
    
    let adminId: string;
    if (existingAdmin) {
      adminId = existingAdmin.id;
      console.log('Admin already exists, using ID:', adminId);
    } else {
      adminId = faker.string.uuid();
      await db.insert(schema.user).values({
        id: adminId,
        firstName: 'System',
        lastName: 'Administrator',
        email: adminEmail,
        password: hashedPassword,
        role: 'admin',
      } as any);
      console.log('Created new admin with ID:', adminId);
    }

    // 2. Seed Hospitals
    console.log('Seeding hospitals...');
    let hospitalIds: string[] = [];
    for (let i = 0; i < HOSPITAL_COUNT; i++) {
      const hId = faker.string.uuid();
      const insertRes: any = await db.insert(schema.hospital).values({
        id: hId,
        name: faker.company.name() + ' Hospital',
        location: faker.location.city(),
        type: faker.helpers.arrayElement(['private', 'county', 'teaching', 'clinic', 'specialist', 'referral', 'public']),
        claimLimit: faker.number.int({ min: 100000, max: 2000000 }).toString(),
      } as any).onConflictDoNothing().returning();
      const res = insertRes?.[0];
      if (res) hospitalIds.push(res.id);
    }
    if (hospitalIds.length === 0) {
      const allHospitals = await db.select({ id: schema.hospital.id }).from(schema.hospital);
      hospitalIds = allHospitals.map(h => h.id);
    }

    // 3. Seed Branches
    console.log('Seeding branches...');
    let branchIds: string[] = [];
    for (let i = 0; i < BRANCH_COUNT; i++) {
      const bId = faker.string.uuid();
      // Temporarily use admin as manager, we'll update later
      const insertRes: any = await db.insert(schema.branch).values({
        id: bId,
        name: (faker.location.city() + ' Branch').slice(0, 50),
        location: faker.location.streetAddress().slice(0, 255),
        manager: adminId, 
      } as any).onConflictDoNothing().returning();
      const res = insertRes?.[0];
      if (res) branchIds.push(res.id);
    }
    if (branchIds.length === 0) {
      const allBranches = await db.select({ id: schema.branch.id }).from(schema.branch);
      branchIds = allBranches.map(b => b.id);
    }

    // 3.5 Seed Specific Role Users for Testing
    console.log('Seeding specific role users...');
    const roles = ['admin', 'user', 'hospital', 'hr', 'ceo', 'branch_manager', 'claims_officer', 'system_admin'];
    for (const role of roles) {
      const email = `${role.toLowerCase().replace('_', '.')}@fortunesacco.co.ke`;
      const [existing] = await db.select().from(schema.user).where(eq(schema.user.email, email)).limit(1);
      if (!existing) {
        await db.insert(schema.user).values({
          id: faker.string.uuid(),
          firstName: role.split('_').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' '),
          lastName: 'User',
          email,
          password: hashedPassword,
          role,
          branchId: faker.helpers.arrayElement(branchIds), 
        } as any).onConflictDoNothing();
        console.log(`Created or updated ${role} user: ${email}`);
      }
    }

    // 4. Seed Users (Employees)
    console.log('Seeding users...');
    let userIds: string[] = [adminId];
    for (let i = 0; i < USER_COUNT; i++) {
      const uId = faker.string.uuid();
      const firstName = faker.person.firstName();
      const lastName = faker.person.lastName();
      const insertRes: any = await db.insert(schema.user).values({
        id: uId,
        firstName: firstName.slice(0, 50),
        lastName: lastName.slice(0, 50),
        email: faker.internet.email({ firstName, lastName }).toLowerCase().slice(0, 100),
        phoneNumber: faker.phone.number().slice(0, 15),
        password: hashedPassword, // Reuse same password for simplicity in dev
        role: faker.helpers.arrayElement(['admin', 'user', 'hr', 'ceo', 'branch_manager', 'claims_officer', 'system_admin']),
        branchId: faker.helpers.arrayElement(branchIds),
      } as any).onConflictDoNothing().returning();
      const res = insertRes?.[0];
      if (res) userIds.push(res.id);
    }
    if (userIds.length <= 1) { // only adminId
      const allUsers = await db.select({ id: schema.user.id }).from(schema.user);
      userIds = allUsers.map(u => u.id);
    }

    // Update branch managers randomly
    for (const bId of branchIds) {
      await db.update(schema.branch)
        .set({ manager: faker.helpers.arrayElement(userIds) })
        .where(eq(schema.branch.id, bId));
    }

    // 4.5 Seed Premium Rates
    console.log('Seeding premium rates...');
    await db.insert(schema.premiumRate).values({
      id: faker.string.uuid(),
      planName: 'Option III',
      m0: '9989',
      m1: '14460',
      m2: '23063',
      m3: '28667',
      m4: '32172',
      m5: '33899',
      m6: '36489',
      extra: '5089',
    } as any).onConflictDoNothing();

    // 5. Seed Policies
    console.log('Seeding policies...');
    let policyIds: string[] = [];
    for (let i = 0; i < POLICY_COUNT; i++) {
      const pId = faker.string.uuid();
      const annualLimit = faker.number.int({ min: 100000, max: 1000000 });
      const insertRes: any = await db.insert(schema.policy).values({
        id: pId,
        name: faker.commerce.productName() + ' Cover',
        annualLimit: annualLimit.toString(),
        outpatientLimit: (annualLimit * 0.2).toString(),
        inpatientLimit: (annualLimit * 0.7).toString(),
        maternityLimit: (annualLimit * 0.1).toString(),
        status: faker.helpers.arrayElement(['active', 'expired', 'pending']),
      } as any).onConflictDoNothing().returning();
      const res = insertRes?.[0];
      if (res) policyIds.push(res.id);
    }
    if (policyIds.length === 0) {
      const allPolicies = await db.select({ id: schema.policy.id }).from(schema.policy);
      policyIds = allPolicies.map(p => p.id);
    }

    // 6. Seed Members (Customers)
    console.log('Seeding members...');
    let memberIds: string[] = [];
    for (let i = 0; i < MEMBER_COUNT; i++) {
      const mId = faker.string.uuid();
      const dependentsCount = faker.number.int({ min: 0, max: 8 });
      let calculatedPremium = 9989;
      if (dependentsCount === 1) calculatedPremium = 14460;
      else if (dependentsCount === 2) calculatedPremium = 23063;
      else if (dependentsCount === 3) calculatedPremium = 28667;
      else if (dependentsCount === 4) calculatedPremium = 32172;
      else if (dependentsCount === 5) calculatedPremium = 33899;
      else if (dependentsCount >= 6) calculatedPremium = 36489 + ((dependentsCount - 6) * 5089);

      const insertRes: any = await db.insert(schema.member).values({
        id: mId,
        firstName: faker.person.firstName(),
        lastName: faker.person.lastName(),
        branchId: faker.helpers.arrayElement(branchIds),
        policyId: faker.helpers.arrayElement(policyIds),
        coverType: faker.helpers.arrayElement(['family', 'individual', 'corporate group']),
        dependentsCount,
        premiumRate: calculatedPremium.toString(),
        status: faker.helpers.arrayElement(['active', 'expired', 'pending']),
        usedAnnualLimit: '0',
      } as any).onConflictDoNothing().returning();
      const res = insertRes?.[0];
      if (res) memberIds.push(res.id);
    }
    if (memberIds.length === 0) {
      const allMembers = await db.select({ id: schema.member.id }).from(schema.member);
      memberIds = allMembers.map(m => m.id);
    }

    // 7. Seed Claims
    console.log('Seeding claims...');
    for (let i = 0; i < CLAIM_COUNT; i++) {
      const mId = faker.helpers.arrayElement(memberIds);
      const hId = faker.helpers.arrayElement(hospitalIds);
      const pId = faker.helpers.arrayElement(policyIds);
      const amount = faker.number.int({ min: 500, max: 50000 });
      const status = faker.helpers.arrayElement(['approved', 'pending', 'rejected']);
      
      await db.insert(schema.claim).values({
        id: faker.string.uuid(),
        memberId: mId,
        hospitalId: hId,
        policyId: pId,
        amountClaimed: amount.toString(),
        amountApproved: status === 'approved' ? (amount * 0.9).toString() : null,
        status: status,
        diagnosis: faker.lorem.sentence(),
        createdAt: faker.date.past(),
      } as any).onConflictDoNothing();
    }

    // 8. Seed Premiums
    console.log('Seeding premiums...');
    for (let i = 0; i < PREMIUM_COUNT; i++) {
      const mId = faker.helpers.arrayElement(memberIds);
      const amount = faker.number.int({ min: 2000, max: 20000 });
      const paid = faker.helpers.arrayElement([amount, amount, 0, amount * 0.5]);
      
      await db.insert(schema.premium).values({
        id: faker.string.uuid(),
        memberId: mId,
        amountDue: amount.toString(),
        amountPaid: paid.toString(),
        dueDate: faker.date.future(),
        paymentMethod: '', // Default as per enum
      } as any).onConflictDoNothing();
    }

    // 9. Seed Audit Logs
    console.log('Seeding audit logs...');
    for (let i = 0; i < AUDIT_LOG_COUNT; i++) {
      // We don't have a direct link in schema, but we can use faker to fill text fields
      await db.insert(schema.auditLog).values({
        id: faker.string.uuid(),
        userEmail: faker.internet.email().toLowerCase(),
        userRole: faker.helpers.arrayElement(['admin', 'user', 'hr', 'ceo', 'branch_manager', 'claims_officer', 'system_admin']),
        branchName: faker.location.city() + ' Branch',
        action: faker.helpers.arrayElement(['Login', 'Logout', 'Create Member', 'Update Policy', 'Approve Claim']),
        module: faker.helpers.arrayElement(['Auth', 'Members', 'Policies', 'Claims']),
        ipAddress: faker.internet.ip(),
        status: faker.helpers.arrayElement(['Success', 'Failure']),
        type: faker.helpers.arrayElement(['info', 'error', 'warn']),
        timestamp: faker.date.recent(),
      } as any).onConflictDoNothing();
    }

    console.log('--- Database Seed Completed Successfully ---');
  } catch (error) {
    console.error('Error during seeding:', error);
  } finally {
    process.exit(0);
  }
}

seed();
