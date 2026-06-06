import { 
  pgEnum, pgTable, uuid, varchar, numeric, pgView, timestamp, text, integer, boolean, primaryKey, type AnyPgColumn
} from 'drizzle-orm/pg-core';
import { sql, eq } from 'drizzle-orm';
import type { InferSelectModel } from 'drizzle-orm';
//import type { PgTableWithColumns } from 'drizzle-orm/pg-core'

// 1. Enums First
export const HospitalTypeEnum = pgEnum('HospitalType', ['private', 'county', 'teaching', 'clinic', 'specialist', 'referral', 'public']);
export const RolesEnum = pgEnum('UserRole', ['admin', 'user', 'hospital', 'hr', 'ceo', 'branch_manager', 'claims_officer', 'system_admin']);
export const PolicyStatusEnum = pgEnum('PolicyStatus', ['active', 'expired', 'pending']);
export const PolicyCoverTypeEnum = pgEnum('CoverType', ['family', 'individual', 'corporate group']);
export const ClaimStatusEnum = pgEnum('ClaimStatus', ['approved', 'pending', 'rejected']);
export const PaymentMethodEnum = pgEnum('PaymentMethod', ['']);

// 2. Tables 
// Note: We use arrow functions in .references() to handle the hoisting/circularity

export const permission = pgTable('permission', {
  id: varchar('id', { length: 50 }).primaryKey(),
  name: varchar('name', { length: 100 }).notNull().unique(),
  description: text('description'),
  resource: varchar('resource', { length: 50 }).notNull(),
  action: varchar('action', { length: 50 }).notNull(),
});

export const userPermission = pgTable('user_permission', {
  userId: varchar('user_id', { length: 50 }).notNull().references((): AnyPgColumn => user.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
  permissionId: varchar('permission_id', { length: 50 }).notNull().references((): AnyPgColumn => permission.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
}, (t) => ({
  pk: primaryKey({ columns: [t.userId, t.permissionId] }),
}));

export const user: any = pgTable('user', {
  id: varchar('id', { length: 50 }).primaryKey(),
  firstName: varchar('first_name', { length: 50 }).notNull(),
  middleName: varchar('middle_name', { length: 50 }),
  lastName: varchar('last_name', { length: 50 }).notNull(),
  email: varchar('email', { length: 100 }).unique(),
  phoneNumber: varchar('phone_number', { length: 15 }).unique(),
  password: varchar('password', { length: 255 }).notNull(),
  branchId: varchar('branch_id', { length: 50 }).references((): AnyPgColumn => branch.id, { onDelete: 'set null', onUpdate: 'cascade' }),
  hospitalId: varchar('hospital_id', { length: 50 }).references((): AnyPgColumn => hospital.id, { onDelete: 'set null', onUpdate: 'cascade' }),
  role: RolesEnum('role').notNull().default('user'),
  mustChangePassword: boolean('must_change_password').notNull().default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date())
});

export const lineOfBusiness = pgTable('line_of_business', {
  id: varchar('id', { length: 50 }).primaryKey(),
  name: varchar('name', { length: 100 }).notNull().unique(),
  code: varchar('code', { length: 50 }).notNull().unique(),
  description: text('description'),
  icon: varchar('icon', { length: 50 }),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const branch: any = pgTable('branch', {
  id: varchar('id', { length: 50 }).primaryKey(),
  name: varchar('name', { length: 50 }).notNull(),
  location: varchar('location', { length: 255 }).notNull(),
  manager: varchar('manager_id', { length: 50 }).references((): AnyPgColumn => user.id, { onDelete: 'set null', onUpdate: 'cascade' }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date())
});

/*
export const policy: any = pgTable('policy', {
  id: uuid('id').primaryKey().notNull().defaultRandom(),
  name: varchar('name', { length: 255 }).notNull(),
  coverType: PolicyCoverTypeEnum('cover_type').notNull().default('individual'),
  status: PolicyStatusEnum('status').notNull().default('pending'),
  utilised: boolean('utilised').notNull().default(false),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date())
});
*/

// Policy table removed in favor of consolidated premiumRate (Plan) table

/*
export const member: any = pgTable('member', {
  id: uuid('id').primaryKey().notNull().defaultRandom(),
  firstName: varchar('first_name', { length: 50 }).notNull(),
  middleName: varchar('middle_name', { length: 50 }),
  lastName: varchar('last_name', { length: 50 }).notNull(),
  email: varchar('email', { length: 100 }),
  phoneNumber: varchar('phone_number', { length: 15 }).notNull(),
  branchId: uuid('branch_id').notNull().references(() => branch.id, { onDelete: 'restrict', onUpdate: 'cascade' }),
  policyId: uuid('policy_id').notNull().references(() => policy.id, { onDelete: 'restrict', onUpdate: 'cascade' }),
  premiumAmount: numeric('premium_amount', { precision: 12, scale: 4 }).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date())
});
*/

export const member = pgTable('member', {
  id: varchar('id', { length: 50 }).primaryKey(),
  firstName: varchar('first_name', { length: 50 }).notNull(),
  lastName: varchar('last_name', { length: 50 }).notNull(),
  email: varchar('email', { length: 100 }),
  phoneNumber: varchar('phone_number', { length: 20 }),
  branchId: varchar('branch_id', { length: 50 }).references(() => branch.id, { onDelete: 'set null', onUpdate: 'cascade' }),
  planId: varchar('plan_id', { length: 50 }).references(() => premiumRate.id, { onDelete: 'set null', onUpdate: 'cascade' }),
  coverType: PolicyCoverTypeEnum('cover_type').default('individual'),
  dependentsCount: integer('dependents_count').default(0),
  premiumRate: numeric('premium_rate', { precision: 12, scale: 2 }).notNull(),
  status: PolicyStatusEnum('status').default('pending'),
  usedAnnualLimit: numeric('used_annual_limit', { precision: 15, scale: 2 }).default('0'),
  usedOutpatientLimit: numeric('used_outpatient_limit', { precision: 15, scale: 2 }).default('0'),
  usedInpatientLimit: numeric('used_inpatient_limit', { precision: 15, scale: 2 }).default('0'),
  usedMaternityLimit: numeric('used_maternity_limit', { precision: 15, scale: 2 }).default('0'),
});

export const claim = pgTable('claim', {
  id: varchar('id', { length: 50 }).primaryKey(),
  memberId: varchar('member_id', { length: 50 }).references(() => member.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
  hospitalId: varchar('hospital_id', { length: 50 }).references(() => hospital.id, { onDelete: 'set null', onUpdate: 'cascade' }),
  planId: varchar('plan_id', { length: 50 }).references(() => premiumRate.id, { onDelete: 'set null', onUpdate: 'cascade' }),
  amountClaimed: numeric('amount_claimed', { precision: 15, scale: 2 }).notNull(),
  amountApproved: numeric('amount_approved', { precision: 15, scale: 2 }),
  status: ClaimStatusEnum('status').default('pending'),
  diagnosis: text('diagnosis'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const hospital = pgTable('hospital', {
  id: varchar('id', { length: 50 }).primaryKey(),
  name: varchar('name', { length: 100 }).notNull(),
  location: text('location'),
  type: HospitalTypeEnum('type').default('public'),
  claimLimit: numeric('claim_limit', { precision: 15, scale: 2 }),
});

export const premium = pgTable('premium', {
  id: varchar('id', { length: 50 }).primaryKey(),
  memberId: varchar('member_id', { length: 50 }).references(() => member.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
  amountDue: numeric('amount_due', { precision: 12, scale: 2 }).notNull(),
  amountPaid: numeric('amount_paid', { precision: 12, scale: 2 }).default('0'),
  dueDate: timestamp('due_date').notNull(),
  paymentMethod: PaymentMethodEnum('payment_method'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const premiumRate = pgTable('premium_rate', {
  id: varchar('id', { length: 50 }).primaryKey(),
  planName: varchar('plan_name', { length: 100 }).notNull(),
  // Benefit Limits (from charts)
  inpatientLimit: numeric('inpatient_limit', { precision: 15, scale: 2 }).notNull(),
  outpatientLimit: numeric('outpatient_limit', { precision: 15, scale: 2 }).notNull(),
  maternityLimit: numeric('maternity_limit', { precision: 15, scale: 2 }),
  dentalLimit: numeric('dental_limit', { precision: 15, scale: 2 }),
  opticalLimit: numeric('optical_limit', { precision: 15, scale: 2 }),
  lastExpenseLimit: numeric('last_expense_limit', { precision: 15, scale: 2 }),
  // Premium Rates (Costs)
  m0: numeric('m_0', { precision: 12, scale: 2 }).notNull(),
  m1: numeric('m_1', { precision: 12, scale: 2 }).notNull(),
  m2: numeric('m_2', { precision: 12, scale: 2 }).notNull(),
  m3: numeric('m_3', { precision: 12, scale: 2 }).notNull(),
  m4: numeric('m_4', { precision: 12, scale: 2 }).notNull(),
  m5: numeric('m_5', { precision: 12, scale: 2 }).notNull(),
  m6: numeric('m_6', { precision: 12, scale: 2 }).notNull(),
  extra: numeric('extra', { precision: 12, scale: 2 }).notNull(),
});

// 3. Types (Moved here to ensure 'user' table is fully defined)
export type User = InferSelectModel<typeof user>;
export type Permission = InferSelectModel<typeof permission>;
export type UserPermission = InferSelectModel<typeof userPermission>;

// 4. Views (Moved to bottom to fix TS7022 Circular Initializer errors)
export const auditLog = pgTable('audit_log', {
  id: uuid('id').primaryKey().defaultRandom(),
  timestamp: timestamp('timestamp').defaultNow(),
  userEmail: varchar('user_email', { length: 100 }),
  userRole: varchar('user_role', { length: 50 }),
  branchName: varchar('branch_name', { length: 100 }),
  action: text('action').notNull(),
  module: varchar('module', { length: 50 }),
  ipAddress: varchar('ip_address', { length: 45 }),
  status: varchar('status', { length: 20 }),
  type: varchar('type', { length: 20 }),
  entityId: varchar('entity_id', { length: 50 }),
  entityType: varchar('entity_type', { length: 50 }),
  details: text('details'),
});

export const branchStats = pgView('branch_stats').as((db) => {
  return db
    .select({
      id: branch.id,
      name: branch.name,
      totalMembers: sql<number>`count(${member.id})`.mapWith(Number).as('total_members'),
      totalActiveMembers: sql<number>`count(${member.id}) filter (where ${member.status} = 'active')`.mapWith(Number).as('total_active_members'),
      totalPlans: sql<number>`count(${member.id})`.mapWith(Number).as('total_plans'),
      totalActivePlans: sql<number>`count(${member.id}) filter (where ${member.status} = 'active')`.mapWith(Number).as('total_active_plans'),
      totalClaims: sql<number>`count(${claim.id})`.mapWith(Number).as('total_claims'),
    })
    .from(branch)
    .leftJoin(member, eq(branch.id, member.branchId))
    .leftJoin(claim, eq(member.id, claim.memberId))
    .groupBy(branch.id, branch.name);
});
