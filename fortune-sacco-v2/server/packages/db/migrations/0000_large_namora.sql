CREATE TYPE "public"."ClaimStatus" AS ENUM('approved', 'pending', 'rejected');--> statement-breakpoint
CREATE TYPE "public"."HospitalType" AS ENUM('private', 'county', 'teaching', 'clinic', 'specialist', 'referral', 'public');--> statement-breakpoint
CREATE TYPE "public"."PaymentMethod" AS ENUM('');--> statement-breakpoint
CREATE TYPE "public"."CoverType" AS ENUM('family', 'individual', 'corporate group');--> statement-breakpoint
CREATE TYPE "public"."PolicyStatus" AS ENUM('active', 'expired', 'pending');--> statement-breakpoint
CREATE TYPE "public"."UserRole" AS ENUM('admin', 'user', 'hospital');--> statement-breakpoint
CREATE TABLE "branch" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(50) NOT NULL,
	"location" varchar(255) NOT NULL,
	"manager_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "claim" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"member_id" uuid,
	"hospital_id" uuid,
	"policy_id" uuid,
	"amount_claimed" numeric(15, 2) NOT NULL,
	"amount_approved" numeric(15, 2),
	"status" "ClaimStatus" DEFAULT 'pending',
	"diagnosis" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "hospital" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(100) NOT NULL,
	"location" text,
	"type" "HospitalType" DEFAULT 'public',
	"claim_limit" numeric(15, 2)
);
--> statement-breakpoint
CREATE TABLE "member" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"first_name" varchar(50) NOT NULL,
	"last_name" varchar(50) NOT NULL,
	"branch_id" uuid,
	"policy_id" uuid,
	"cover_type" "CoverType" DEFAULT 'individual',
	"premium_rate" numeric(12, 2) NOT NULL,
	"status" "PolicyStatus" DEFAULT 'pending',
	"used_annual_limit" numeric(15, 2) DEFAULT '0',
	"used_outpatient_limit" numeric(15, 2) DEFAULT '0',
	"used_inpatient_limit" numeric(15, 2) DEFAULT '0',
	"used_maternity_limit" numeric(15, 2) DEFAULT '0'
);
--> statement-breakpoint
CREATE TABLE "policy" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"annual_limit" numeric(15, 2) NOT NULL,
	"outpatient_limit" numeric(15, 2),
	"inpatient_limit" numeric(15, 2),
	"maternity_limit" numeric(15, 2),
	"status" "PolicyStatus" DEFAULT 'pending'
);
--> statement-breakpoint
CREATE TABLE "premium" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"member_id" uuid,
	"amount_due" numeric(12, 2) NOT NULL,
	"amount_paid" numeric(12, 2) DEFAULT '0',
	"due_date" timestamp NOT NULL,
	"payment_method" "PaymentMethod"
);
--> statement-breakpoint
CREATE TABLE "user" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"first_name" varchar(50) NOT NULL,
	"middle_name" varchar(50),
	"last_name" varchar(50) NOT NULL,
	"phone_number" varchar(15),
	"password" varchar(255) NOT NULL,
	"branch_id" uuid,
	"hospital_id" uuid,
	"role" "UserRole" DEFAULT 'user' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "branch" ADD CONSTRAINT "branch_manager_id_user_id_fk" FOREIGN KEY ("manager_id") REFERENCES "public"."user"("id") ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "claim" ADD CONSTRAINT "claim_member_id_member_id_fk" FOREIGN KEY ("member_id") REFERENCES "public"."member"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "claim" ADD CONSTRAINT "claim_hospital_id_hospital_id_fk" FOREIGN KEY ("hospital_id") REFERENCES "public"."hospital"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "claim" ADD CONSTRAINT "claim_policy_id_policy_id_fk" FOREIGN KEY ("policy_id") REFERENCES "public"."policy"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "member" ADD CONSTRAINT "member_branch_id_branch_id_fk" FOREIGN KEY ("branch_id") REFERENCES "public"."branch"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "member" ADD CONSTRAINT "member_policy_id_policy_id_fk" FOREIGN KEY ("policy_id") REFERENCES "public"."policy"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "premium" ADD CONSTRAINT "premium_member_id_member_id_fk" FOREIGN KEY ("member_id") REFERENCES "public"."member"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user" ADD CONSTRAINT "user_branch_id_branch_id_fk" FOREIGN KEY ("branch_id") REFERENCES "public"."branch"("id") ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "user" ADD CONSTRAINT "user_hospital_id_hospital_id_fk" FOREIGN KEY ("hospital_id") REFERENCES "public"."hospital"("id") ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
CREATE VIEW "public"."branch_stats" AS (select "branch"."id", "branch"."name", count("member"."id") as "total_members", count("member"."policy_id") as "total_policies", count("member"."policy_id") filter (where "policy"."status" = 'active') as "total_active_policies", count("claim"."id") as "total_claims" from "branch" left join "member" on "branch"."id" = "member"."branch_id" left join "policy" on "member"."policy_id" = "policy"."id" left join "claim" on "member"."id" = "claim"."member_id" group by "branch"."id", "branch"."name");