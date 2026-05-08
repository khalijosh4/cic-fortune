ALTER TABLE "branch" DROP CONSTRAINT "branch_structured_id_unique";--> statement-breakpoint
ALTER TABLE "user" DROP CONSTRAINT "user_structured_id_unique";--> statement-breakpoint
ALTER TABLE "branch" ALTER COLUMN "id" SET DATA TYPE varchar(50);--> statement-breakpoint
ALTER TABLE "branch" ALTER COLUMN "id" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "branch" ALTER COLUMN "manager_id" SET DATA TYPE varchar(50);--> statement-breakpoint
ALTER TABLE "claim" ALTER COLUMN "id" SET DATA TYPE varchar(50);--> statement-breakpoint
ALTER TABLE "claim" ALTER COLUMN "id" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "claim" ALTER COLUMN "member_id" SET DATA TYPE varchar(50);--> statement-breakpoint
ALTER TABLE "claim" ALTER COLUMN "hospital_id" SET DATA TYPE varchar(50);--> statement-breakpoint
ALTER TABLE "claim" ALTER COLUMN "plan_id" SET DATA TYPE varchar(50);--> statement-breakpoint
ALTER TABLE "hospital" ALTER COLUMN "id" SET DATA TYPE varchar(50);--> statement-breakpoint
ALTER TABLE "hospital" ALTER COLUMN "id" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "member" ALTER COLUMN "id" SET DATA TYPE varchar(50);--> statement-breakpoint
ALTER TABLE "member" ALTER COLUMN "id" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "member" ALTER COLUMN "branch_id" SET DATA TYPE varchar(50);--> statement-breakpoint
ALTER TABLE "member" ALTER COLUMN "plan_id" SET DATA TYPE varchar(50);--> statement-breakpoint
ALTER TABLE "premium" ALTER COLUMN "id" SET DATA TYPE varchar(50);--> statement-breakpoint
ALTER TABLE "premium" ALTER COLUMN "id" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "premium" ALTER COLUMN "member_id" SET DATA TYPE varchar(50);--> statement-breakpoint
ALTER TABLE "premium_rate" ALTER COLUMN "id" SET DATA TYPE varchar(50);--> statement-breakpoint
ALTER TABLE "premium_rate" ALTER COLUMN "id" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "user" ALTER COLUMN "id" SET DATA TYPE varchar(50);--> statement-breakpoint
ALTER TABLE "user" ALTER COLUMN "id" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "user" ALTER COLUMN "branch_id" SET DATA TYPE varchar(50);--> statement-breakpoint
ALTER TABLE "user" ALTER COLUMN "hospital_id" SET DATA TYPE varchar(50);--> statement-breakpoint
ALTER TABLE "branch" DROP COLUMN "structured_id";--> statement-breakpoint
ALTER TABLE "user" DROP COLUMN "structured_id";--> statement-breakpoint
ALTER TABLE "user" ADD CONSTRAINT "user_phone_number_unique" UNIQUE("phone_number");