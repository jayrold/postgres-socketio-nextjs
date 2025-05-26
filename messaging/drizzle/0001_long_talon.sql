CREATE TABLE "dynamic-table_chat_message" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"content" text NOT NULL,
	"fromUserId" varchar(255) NOT NULL,
	"toUserId" varchar(255) NOT NULL,
	"createdAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updatedAt" timestamp with time zone,
	"readAt" timestamp with time zone
);
--> statement-breakpoint
ALTER TABLE "dynamic-table_chat_message" ADD CONSTRAINT "dynamic-table_chat_message_fromUserId_dynamic-table_user_id_fk" FOREIGN KEY ("fromUserId") REFERENCES "public"."dynamic-table_user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dynamic-table_chat_message" ADD CONSTRAINT "dynamic-table_chat_message_toUserId_dynamic-table_user_id_fk" FOREIGN KEY ("toUserId") REFERENCES "public"."dynamic-table_user"("id") ON DELETE cascade ON UPDATE no action;