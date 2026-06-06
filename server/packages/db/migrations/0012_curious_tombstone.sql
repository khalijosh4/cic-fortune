ALTER TABLE "branch" ADD COLUMN "lob_id" varchar(50);--> statement-breakpoint
ALTER TABLE "claim" ADD COLUMN "lob_id" varchar(50);--> statement-breakpoint
ALTER TABLE "hospital" ADD COLUMN "lob_id" varchar(50);--> statement-breakpoint
ALTER TABLE "line_of_business" ADD COLUMN "config" jsonb;--> statement-breakpoint
ALTER TABLE "member" ADD COLUMN "lob_id" varchar(50);--> statement-breakpoint
ALTER TABLE "premium" ADD COLUMN "lob_id" varchar(50);--> statement-breakpoint
ALTER TABLE "premium_rate" ADD COLUMN "lob_id" varchar(50);--> statement-breakpoint
ALTER TABLE "branch" ADD CONSTRAINT "branch_lob_id_line_of_business_id_fk" FOREIGN KEY ("lob_id") REFERENCES "public"."line_of_business"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "claim" ADD CONSTRAINT "claim_lob_id_line_of_business_id_fk" FOREIGN KEY ("lob_id") REFERENCES "public"."line_of_business"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "hospital" ADD CONSTRAINT "hospital_lob_id_line_of_business_id_fk" FOREIGN KEY ("lob_id") REFERENCES "public"."line_of_business"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "member" ADD CONSTRAINT "member_lob_id_line_of_business_id_fk" FOREIGN KEY ("lob_id") REFERENCES "public"."line_of_business"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "premium" ADD CONSTRAINT "premium_lob_id_line_of_business_id_fk" FOREIGN KEY ("lob_id") REFERENCES "public"."line_of_business"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "premium_rate" ADD CONSTRAINT "premium_rate_lob_id_line_of_business_id_fk" FOREIGN KEY ("lob_id") REFERENCES "public"."line_of_business"("id") ON DELETE cascade ON UPDATE cascade;