ALTER TABLE "claim" DROP CONSTRAINT "claim_member_id_member_id_fk";
--> statement-breakpoint
ALTER TABLE "claim" DROP CONSTRAINT "claim_hospital_id_hospital_id_fk";
--> statement-breakpoint
ALTER TABLE "claim" DROP CONSTRAINT "claim_plan_id_premium_rate_id_fk";
--> statement-breakpoint
ALTER TABLE "member" DROP CONSTRAINT "member_branch_id_branch_id_fk";
--> statement-breakpoint
ALTER TABLE "member" DROP CONSTRAINT "member_plan_id_premium_rate_id_fk";
--> statement-breakpoint
ALTER TABLE "premium" DROP CONSTRAINT "premium_member_id_member_id_fk";
--> statement-breakpoint
ALTER TABLE "audit_log" ADD COLUMN "entity_id" varchar(50);--> statement-breakpoint
ALTER TABLE "audit_log" ADD COLUMN "entity_type" varchar(50);--> statement-breakpoint
ALTER TABLE "audit_log" ADD COLUMN "details" text;--> statement-breakpoint
ALTER TABLE "branch" ADD COLUMN "structured_id" varchar(50);--> statement-breakpoint
ALTER TABLE "premium" ADD COLUMN "created_at" timestamp DEFAULT now();--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "structured_id" varchar(50);--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "must_change_password" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "claim" ADD CONSTRAINT "claim_member_id_member_id_fk" FOREIGN KEY ("member_id") REFERENCES "public"."member"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "claim" ADD CONSTRAINT "claim_hospital_id_hospital_id_fk" FOREIGN KEY ("hospital_id") REFERENCES "public"."hospital"("id") ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "claim" ADD CONSTRAINT "claim_plan_id_premium_rate_id_fk" FOREIGN KEY ("plan_id") REFERENCES "public"."premium_rate"("id") ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "member" ADD CONSTRAINT "member_branch_id_branch_id_fk" FOREIGN KEY ("branch_id") REFERENCES "public"."branch"("id") ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "member" ADD CONSTRAINT "member_plan_id_premium_rate_id_fk" FOREIGN KEY ("plan_id") REFERENCES "public"."premium_rate"("id") ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "premium" ADD CONSTRAINT "premium_member_id_member_id_fk" FOREIGN KEY ("member_id") REFERENCES "public"."member"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "branch" ADD CONSTRAINT "branch_structured_id_unique" UNIQUE("structured_id");--> statement-breakpoint
ALTER TABLE "user" ADD CONSTRAINT "user_structured_id_unique" UNIQUE("structured_id");