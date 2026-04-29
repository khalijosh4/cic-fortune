import { 
  boolean, pgEnum, pgTable, text, timestamp, uuid, varchar, numeric, pgView
} from 'drizzle-orm/pg-core';

import {
  sql, eq
} from 'drizzle-orm';

import type { InferSelectModel } from 'drizzle-orm';

export type User = InferSelectModel<typeof users>;



// ----- Fortune SACCO -----
export const HospitalTypeEnum = pgEnum('HospitalType', ['private', 'county', 'teaching', 'clinic', 'specialist', 'referral']);
export const RolesEnum = pgEnum('UserRole', ['admin', 'user']);
export const PolicyStatusEnum = pgEnum('PolicyStatus', ['active', 'expired', 'pending']);
export const CoverTypeEnum = pgEnum('CoverType', ['family', 'individual', 'corporate group']);
//export const MemberStatusEnum = pgEnum('MemberStatus', ['active']);

// How to use the counts:
// Fetching all branches with their real-time member counts
// const reports = await db.select().from(branchMemberCounts);

export const branchMemberCount = pgView('branch_member_counts').as((db) => {
  return db
    .select({
      branchId: branch.id,
      // This does the actual counting on the fly
      totalMembers: sql<number>`count(${member.id})`.mapWith(Number).as('total_members'),
    })
    .from(branch)
    // Left join ensures branches with 0 members still show up
    .leftJoin(member, eq(branch.id, member.branchId))
    .groupBy(branch.id);
});

export const activeBranchMemberCount = pgView('active_branch_member_count').as((db) => {
  return db
    .select({
      branchId: branch.id,
      totalActiveMembers: sql<number>`count(${member.id})`.mapWith(Number).as('total_active_members'),
    })
    .from(branch)
    .leftJoin(member, eq(branch.id, member.id))
    .groupBy(branch.id);
});

export const branchPolicyCount = pgView('branch_policy_count').as((db) => {
  return db
    .select({
      branchId: branch.id,
      totalPolicies: sql<number>`count(${member.id})`.mapWith(Number).as('total_policies'),
    })
    .from(branch)
    .leftJoin(member, eq(branch.id, member.id))
    .groupBy(branch.id);
});

export const branchActivePolicyCount = pgView('branch_active_policy_count').as((db) => {
  return db
    .select({
      branchId: branch.id,
      totalActivePolicies: sql<number>`count(${member.id})`.mapWith(Number).as('total_active_policies'),
    })
    .from(branch)
    .leftJoin(member, eq(branch.id, member.id))
    .groupBy(branch.id);
});

export const branchClaimCount = pgView('branch_claim_count').as((db) => {
  return db
    .select({
      branchId: branch.id,
      totalClaims: sql<number>`count (${member.id})`.mapWith(Number).as('total_claims'),
    })
    .from(branch)
    .leftJoin(member, eq(branch.id, member.id))
    .groupBy(branch.id);
});

// onDelete: 'restrict' prevents deletion if the entity has references
// onUpdate: 'cascade' updates the id if the parent id changes

export const member = pgTable('member', {
	id: uuid('id').primaryKey().notNull().defaultRandom(),
	firstName: varchar('first_name', { length: 50 }).notNull(), // Added DB name
	middleName: varchar('middle_name', { length: 50 }),          // Added DB name
	lastName: varchar('last_name', { length: 50 }).notNull(),   // Added DB name
	email: varchar('email', { length: 100 }),
	phoneNumber: varchar('phone_number', { length: 15 }).notNull(),
	
	// Foreign Keys with 'restrict' safety
	branchId: uuid('branch_id')
		.notNull()
		.references(() => branch.id, { onDelete: 'restrict', onUpdate: 'cascade' }),
	
	policyId: uuid('policy_id')
		.notNull()
		.references(() => policy.id, { onDelete: 'restrict', onUpdate: 'cascade' }),

	coverType: CoverTypeEnum('cover_type').notNull().default('individual'),
	premiumAmount: numeric('premium_amount', { precision: 12, scale: 4 }).notNull(),
});
 

export const branch = pgTable('branch', {
  id: uuid('id').primaryKey().notNull().defaultRandom(),
  name: varchar('name', { length: 50 }).notNull(),
  location: varchar('location', { length: 255 }).notNull(),
  manager: uuid('manager_id').notNull().references(() => users.id, {onDelete: 'restrict', onUpdate: 'cascade'}),
});

export const policy = pgTable('policy', {
  id: uuid('id').primaryKey().notNull().defaultRandom(),

});

// ----- END -----

export const users = pgTable('users', {
  id: uuid().primaryKey().notNull().defaultRandom(),
  email: varchar({ length: 50 }).notNull().unique(),
  emailVerified: boolean('email_verified').notNull().default(false),
  name: varchar('name', { length: 50 }).notNull(),
  role: RolesEnum('role').notNull().default('user'),
  image: text('image'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').notNull(),
  banned: boolean().notNull().default(false),
  banReason: text('ban_reason'),
  banExpires: timestamp('ban_expires')
});

export const sessions = pgTable('sessions', {
  id: uuid().primaryKey().notNull().defaultRandom(),
  expiresAt: timestamp('expires_at').notNull(),
  token: text('token').notNull().unique(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').notNull(),
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
  impersonatedBy: uuid('impersonated_by')
});

export const accounts = pgTable('accounts', {
  id: uuid().primaryKey().notNull().defaultRandom(),
  accountId: text('account_id').notNull(),
  providerId: text('provider_id').notNull(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
  accessToken: text('access_token'),
  refreshToken: text('refresh_token'),
  idToken: text('id_token'),
  accessTokenExpiresAt: timestamp('access_token_expires_at'),
  refreshTokenExpiresAt: timestamp('refresh_token_expires_at'),
  scope: text('scope'),
  password: text('password'),
  createdAt: timestamp('created_at').notNull(),
  updatedAt: timestamp('updated_at').notNull()
});
