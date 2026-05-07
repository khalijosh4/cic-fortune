DROP VIEW "public"."branch_stats";--> statement-breakpoint
ALTER TABLE "branch" DROP CONSTRAINT "branch_manager_id_user_id_fk";
--> statement-breakpoint
ALTER TABLE "member" DROP CONSTRAINT "member_branch_id_branch_id_fk";
--> statement-breakpoint
ALTER TABLE "member" DROP CONSTRAINT "member_plan_id_premium_rate_id_fk";
--> statement-breakpoint
ALTER TABLE "user" DROP CONSTRAINT "user_branch_id_branch_id_fk";
--> statement-breakpoint
ALTER TABLE "user" DROP CONSTRAINT "user_hospital_id_hospital_id_fk";
--> statement-breakpoint
ALTER TABLE "branch" ADD CONSTRAINT "branch_manager_id_user_id_fk" FOREIGN KEY ("manager_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "member" ADD CONSTRAINT "member_branch_id_branch_id_fk" FOREIGN KEY ("branch_id") REFERENCES "public"."branch"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "member" ADD CONSTRAINT "member_plan_id_premium_rate_id_fk" FOREIGN KEY ("plan_id") REFERENCES "public"."premium_rate"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user" ADD CONSTRAINT "user_branch_id_branch_id_fk" FOREIGN KEY ("branch_id") REFERENCES "public"."branch"("id") ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "user" ADD CONSTRAINT "user_hospital_id_hospital_id_fk" FOREIGN KEY ("hospital_id") REFERENCES "public"."hospital"("id") ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
CREATE VIEW "public"."branch_stats" AS (select "branch"."id", "branch"."name", count("member"."id") as "total_members", count("member"."id") filter (where "member"."status" = 'active') as "total_active_members", count("member"."id") as "total_policies", count("member"."id") filter (where "member"."status" = 'active') as "total_active_policies", count("claim"."id") as "total_claims" from "branch" left join "member" on "branch"."id" = "member"."branch_id" left join "claim" on "member"."id" = "claim"."member_id" group by "branch"."id", "branch"."name");