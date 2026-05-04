ALTER TYPE "public"."UserRole" ADD VALUE 'hr';--> statement-breakpoint
ALTER TYPE "public"."UserRole" ADD VALUE 'ceo';--> statement-breakpoint
ALTER TYPE "public"."UserRole" ADD VALUE 'branch_manager';--> statement-breakpoint
ALTER TYPE "public"."UserRole" ADD VALUE 'claims_officer';--> statement-breakpoint
ALTER TYPE "public"."UserRole" ADD VALUE 'system_admin';--> statement-breakpoint
CREATE TABLE "premium_rate" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"plan_name" varchar(100) NOT NULL,
	"m_0" numeric(12, 2) NOT NULL,
	"m_1" numeric(12, 2) NOT NULL,
	"m_2" numeric(12, 2) NOT NULL,
	"m_3" numeric(12, 2) NOT NULL,
	"m_4" numeric(12, 2) NOT NULL,
	"m_5" numeric(12, 2) NOT NULL,
	"m_6" numeric(12, 2) NOT NULL,
	"extra" numeric(12, 2) NOT NULL
);
--> statement-breakpoint
ALTER TABLE "member" ADD COLUMN "dependents_count" integer DEFAULT 0;