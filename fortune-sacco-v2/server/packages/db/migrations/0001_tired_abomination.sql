CREATE TABLE "audit_log" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"timestamp" timestamp DEFAULT now(),
	"user_email" varchar(100),
	"user_role" varchar(50),
	"branch_name" varchar(100),
	"action" text NOT NULL,
	"module" varchar(50),
	"ip_address" varchar(45),
	"status" varchar(20),
	"type" varchar(20)
);
--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "email" varchar(100);--> statement-breakpoint
ALTER TABLE "user" ADD CONSTRAINT "user_email_unique" UNIQUE("email");