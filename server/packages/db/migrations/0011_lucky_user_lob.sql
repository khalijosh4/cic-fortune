CREATE TABLE "user_lob" (
	"user_id" varchar(50) NOT NULL,
	"lob_id" varchar(50) NOT NULL,
	CONSTRAINT "user_lob_user_id_lob_id_pk" PRIMARY KEY("user_id","lob_id")
);

ALTER TABLE "user_lob" ADD CONSTRAINT "user_lob_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE cascade;
ALTER TABLE "user_lob" ADD CONSTRAINT "user_lob_lob_id_line_of_business_id_fk" FOREIGN KEY ("lob_id") REFERENCES "public"."line_of_business"("id") ON DELETE cascade ON UPDATE cascade;
