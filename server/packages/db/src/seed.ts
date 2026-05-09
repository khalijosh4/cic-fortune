import { db, schema } from './index.js';
import bcrypt from 'bcryptjs';
import { eq } from 'drizzle-orm';
import { faker } from '@faker-js/faker';

// Constants for counts
const BRANCH_COUNT = 15;
const HOSPITAL_COUNT = 10;
const USER_COUNT = 50;
const MEMBER_COUNT = 200;
const CLAIM_COUNT = 100;
const PREMIUM_COUNT = 300;
const AUDIT_LOG_COUNT = 100;

async function seed() {
  const isProd = process.env.NODE_ENV === 'production' || process.env.SEED_MODE === 'prod';
  console.log(`--- Starting Database Seed (${isProd ? 'Production' : 'Development'}) ---`);
  
  if (!isProd) {
    faker.seed(12345); // For deterministic results
  }

  try {
    // 1. Seed Initial Admin User
    console.log('Seeding initial admin...');
    const hashedPassword = await bcrypt.hash('Admin@2024', 10);
    const adminEmail = 'admin@fortunesacco.co.ke';
    
    const adminId = 'SYS-ADMIN-001';
    await db.insert(schema.user).values({
      id: adminId,
      firstName: 'System',
      lastName: 'Administrator',
      email: adminEmail,
      password: hashedPassword,
      role: 'admin',
    } as any).onConflictDoNothing();
    
    const [insertedAdmin] = await db.select().from(schema.user).where(eq(schema.user.id, adminId)).limit(1);
    console.log('Admin in DB:', insertedAdmin?.id);
    
    console.log('Created/Verified admin with ID:', adminId);

    // 2. Seed Hospitals
    console.log('Seeding hospitals...');
    let hospitalIds: string[] = [];
    for (let i = 1; i <= HOSPITAL_COUNT; i++) {
      const hId = `HSP-GEN-${i.toString().padStart(3, '0')}`;
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
    const branchNames = ['Nairobi', 'Mombasa', 'Kisumu', 'Nakuru', 'Eldoret', 'Thika', 'Nyeri', 'Meru', 'Embu', 'Kakamega', 'Kericho', 'Machakos', 'Garissa', 'Kitale', 'Malindi'];
    for (let i = 0; i < BRANCH_COUNT; i++) {
      const bName = branchNames[i] || faker.location.city();
      const bCode = bName.substring(0, 3).toUpperCase();
      const bId = `BR-${bCode}-${(i + 1).toString().padStart(3, '0')}`;
      
      const insertRes: any = await db.insert(schema.branch).values({
        id: bId,
        name: bName + ' Branch',
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
    for (let i = 0; i < roles.length; i++) {
      const role = roles[i];
      const email = `${role.toLowerCase().replace('_', '.')}@fortunesacco.co.ke`;
      const uId = `USR-${role.substring(0, 3).toUpperCase()}-${(i + 1).toString().padStart(3, '0')}`;
      
      await db.insert(schema.user).values({
        id: uId,
        firstName: role.split('_').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' '),
        lastName: 'User',
        email,
        password: hashedPassword,
        role,
        branchId: faker.helpers.arrayElement(branchIds), 
      } as any).onConflictDoNothing();
      console.log(`Created or updated ${role} user: ${email}`);
    }

    // 4. Seed Users (Employees)
    console.log('Seeding users...');
    let userIds: string[] = [adminId];
    for (let i = 1; i <= USER_COUNT; i++) {
      const branchId = faker.helpers.arrayElement(branchIds);
      const branchCode = branchId.split('-')[1];
      const uId = `${branchCode}-2026-${i.toString().padStart(3, '0')}`;
      
      const firstName = faker.person.firstName();
      const lastName = faker.person.lastName();
      const insertRes: any = await db.insert(schema.user).values({
        id: uId,
        firstName: firstName.slice(0, 50),
        lastName: lastName.slice(0, 50),
        email: faker.internet.email({ firstName, lastName }).toLowerCase().slice(0, 100),
        phoneNumber: faker.phone.number().slice(0, 15),
        password: hashedPassword,
        role: faker.helpers.arrayElement(['admin', 'user', 'hr', 'ceo', 'branch_manager', 'claims_officer', 'system_admin']),
        branchId,
      } as any).onConflictDoNothing().returning();
      const res = insertRes?.[0];
      if (res) userIds.push(res.id);
    }
    if (userIds.length <= 1) { 
      const allUsers = await db.select({ id: schema.user.id }).from(schema.user);
      userIds = allUsers.map(u => u.id);
    }

    // 4.5 Seed Premium Rates (Plans)
    console.log('Seeding premium rates...');
    const planId = 'PLN-OPT-III';
    await db.insert(schema.premiumRate).values({
      id: planId,
      planName: 'Option III',
      inpatientLimit: '1000000',
      outpatientLimit: '100000',
      maternityLimit: '50000',
      dentalLimit: '10000',
      opticalLimit: '10000',
      lastExpenseLimit: '50000',
      m0: '9989',
      m1: '14460',
      m2: '23063',
      m3: '28667',
      m4: '32172',
      m5: '33899',
      m6: '36489',
      extra: '5089',
    } as any).onConflictDoNothing();
    const planIds = [planId];

    if (isProd) {
      console.log('--- Production Database Seed Completed Successfully ---');
      return;
    }

    // 6. Seed Members (Customers)
    console.log('Seeding members...');
    let memberIds: string[] = [];
    for (let i = 1; i <= MEMBER_COUNT; i++) {
      const branchId = faker.helpers.arrayElement(branchIds);
      const branchCode = branchId.split('-')[1];
      const mId = `MEM-${branchCode}-2026-${i.toString().padStart(3, '0')}`;
      
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
        branchId,
        planId: faker.helpers.arrayElement(planIds),
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
    for (let i = 1; i <= CLAIM_COUNT; i++) {
      const mId = faker.helpers.arrayElement(memberIds);
      const hId = faker.helpers.arrayElement(hospitalIds);
      const amount = faker.number.int({ min: 500, max: 50000 });
      const status = faker.helpers.arrayElement(['approved', 'pending', 'rejected']);
      const cId = `CLM-2026-${i.toString().padStart(3, '0')}`;
      
      await db.insert(schema.claim).values({
        id: cId,
        memberId: mId,
        hospitalId: hId,
        planId: faker.helpers.arrayElement(planIds),
        amountClaimed: amount.toString(),
        amountApproved: status === 'approved' ? (amount * 0.9).toString() : null,
        status: status,
        diagnosis: faker.lorem.sentence(),
        createdAt: faker.date.past(),
      } as any).onConflictDoNothing();
    }

    // 8. Seed Premiums
    console.log('Seeding premiums...');
    for (let i = 1; i <= PREMIUM_COUNT; i++) {
      const mId = faker.helpers.arrayElement(memberIds);
      const amount = faker.number.int({ min: 2000, max: 20000 });
      const paid = faker.helpers.arrayElement([amount, amount, 0, amount * 0.5]);
      const pId = `PMT-2026-${i.toString().padStart(3, '0')}`;
      
      await db.insert(schema.premium).values({
        id: pId,
        memberId: mId,
        amountDue: amount.toString(),
        amountPaid: paid.toString(),
        dueDate: faker.date.future(),
        paymentMethod: '', 
      } as any).onConflictDoNothing();
    }

    // 9. Seed Audit Logs
    console.log('Seeding audit logs...');
    for (let i = 0; i < AUDIT_LOG_COUNT; i++) {
      await db.insert(schema.auditLog).values({
        id: faker.string.uuid(), // Audit log can stay UUID as it's not a business ID
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

    // 10. Seed Permissions
    console.log('Seeding permissions...');
    const permissions = [
      { id: 'members-create', name: 'members.create', description: 'Create new members', resource: 'members', action: 'create' },
      { id: 'members-read', name: 'members.read', description: 'View members', resource: 'members', action: 'read' },
      { id: 'members-update', name: 'members.update', description: 'Edit members', resource: 'members', action: 'update' },
      { id: 'members-delete', name: 'members.delete', description: 'Delete members', resource: 'members', action: 'delete' },
      { id: 'claims-create', name: 'claims.create', description: 'Create new claims', resource: 'claims', action: 'create' },
      { id: 'claims-read', name: 'claims.read', description: 'View claims', resource: 'claims', action: 'read' },
      { id: 'claims-update', name: 'claims.update', description: 'Edit claims', resource: 'claims', action: 'update' },
      { id: 'claims-delete', name: 'claims.delete', description: 'Delete claims', resource: 'claims', action: 'delete' },
      { id: 'premiums-read', name: 'premiums.read', description: 'View premiums', resource: 'premiums', action: 'read' },
      { id: 'premiums-update', name: 'premiums.update', description: 'Edit premiums', resource: 'premiums', action: 'update' },
      { id: 'premiums-delete', name: 'premiums.delete', description: 'Delete premiums', resource: 'premiums', action: 'delete' },
      { id: 'users-create', name: 'users.create', description: 'Create new users', resource: 'users', action: 'create' },
      { id: 'users-read', name: 'users.read', description: 'View users', resource: 'users', action: 'read' },
      { id: 'users-update', name: 'users.update', description: 'Edit users', resource: 'users', action: 'update' },
      { id: 'users-delete', name: 'users.delete', description: 'Delete users', resource: 'users', action: 'delete' },
      { id: 'users-transfer', name: 'users.transfer', description: 'Transfer users between branches', resource: 'users', action: 'transfer' },
      { id: 'branches-create', name: 'branches.create', description: 'Create new branches', resource: 'branches', action: 'create' },
      { id: 'branches-read', name: 'branches.read', description: 'View branches', resource: 'branches', action: 'read' },
      { id: 'branches-update', name: 'branches.update', description: 'Edit branches', resource: 'branches', action: 'update' },
      { id: 'branches-delete', name: 'branches.delete', description: 'Delete branches', resource: 'branches', action: 'delete' },
      { id: 'hospitals-create', name: 'hospitals.create', description: 'Create new hospitals', resource: 'hospitals', action: 'create' },
      { id: 'hospitals-read', name: 'hospitals.read', description: 'View hospitals', resource: 'hospitals', action: 'read' },
      { id: 'hospitals-update', name: 'hospitals.update', description: 'Edit hospitals', resource: 'hospitals', action: 'update' },
      { id: 'hospitals-delete', name: 'hospitals.delete', description: 'Delete hospitals', resource: 'hospitals', action: 'delete' },
      { id: 'plans-create', name: 'plans.create', description: 'Create new plans', resource: 'plans', action: 'create' },
      { id: 'plans-read', name: 'plans.read', description: 'View plans', resource: 'plans', action: 'read' },
      { id: 'plans-update', name: 'plans.update', description: 'Edit plans', resource: 'plans', action: 'update' },
      { id: 'plans-delete', name: 'plans.delete', description: 'Delete plans', resource: 'plans', action: 'delete' },
      { id: 'audit-logs-read', name: 'audit-logs.read', description: 'View audit logs', resource: 'audit-logs', action: 'read' },
      { id: 'dashboard-read', name: 'dashboard.read', description: 'View dashboard', resource: 'dashboard', action: 'read' },
    ];
    for (const p of permissions) {
      await db.insert(schema.permission).values(p).onConflictDoNothing();
    }

    // Assign permissions to all users
    const allUserIds = await db.select({ id: schema.user.id }).from(schema.user);
    for (const u of allUserIds) {
      for (const p of permissions) {
        await db.insert(schema.userPermission).values({ userId: u.id, permissionId: p.id }).onConflictDoNothing();
      }
    }

    console.log('--- Database Seed Completed Successfully ---');
  } catch (error) {
    console.error('Error during seeding:', error);
  } finally {
    process.exit(0);
  }
}

seed();
