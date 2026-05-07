ALTER TABLE "policy" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP VIEW "public"."branch_stats";--> statement-breakpoint
DROP TABLE "policy" CASCADE;--> statement-breakpoint
ALTER TABLE "claim" RENAME COLUMN "policy_id" TO "plan_id";--> statement-breakpoint
ALTER TABLE "member" RENAME COLUMN "policy_id" TO "plan_id";--> statement-breakpoint
ALTER TABLE "claim" DROP CONSTRAINT "claim_policy_id_policy_id_fk";
--> statement-breakpoint
ALTER TABLE "member" DROP CONSTRAINT "member_policy_id_policy_id_fk";
--> statement-breakpoint
ALTER TABLE "premium_rate" ADD COLUMN "inpatient_limit" numeric(15, 2) NOT NULL;--> statement-breakpoint
ALTER TABLE "premium_rate" ADD COLUMN "outpatient_limit" numeric(15, 2) NOT NULL;--> statement-breakpoint
ALTER TABLE "premium_rate" ADD COLUMN "maternity_limit" numeric(15, 2);--> statement-breakpoint
ALTER TABLE "premium_rate" ADD COLUMN "dental_limit" numeric(15, 2);--> statement-breakpoint
ALTER TABLE "premium_rate" ADD COLUMN "optical_limit" numeric(15, 2);--> statement-breakpoint
ALTER TABLE "premium_rate" ADD COLUMN "last_expense_limit" numeric(15, 2);--> statement-breakpoint
ALTER TABLE "claim" ADD CONSTRAINT "claim_plan_id_premium_rate_id_fk" FOREIGN KEY ("plan_id") REFERENCES "public"."premium_rate"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "member" ADD CONSTRAINT "member_plan_id_premium_rate_id_fk" FOREIGN KEY ("plan_id") REFERENCES "public"."premium_rate"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE VIEW "public"."branch_stats" AS (select "branch"."id" as "branch_id", "branch"."name" as "branch_name", count("member"."id") as "total_members", count("member"."id") filter (where "member"."status" = 'active') as "total_active_members", count("member"."id") as "total_policies", count("member"."id") filter (where "member"."status" = 'active') as "total_active_policies", count("claim"."id") as "total_claims" from "branch" left join "member" on "branch"."id" = "member"."branch_id" left join "claim" on "member"."id" = "claim"."member_id" group by "branch"."id", "branch"."name");