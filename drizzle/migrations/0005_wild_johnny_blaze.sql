ALTER TYPE "public"."recipe_type" ADD VALUE 'Appetizer';--> statement-breakpoint
ALTER TABLE "employees" ADD COLUMN "email" text;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "customerPhone" text;--> statement-breakpoint
ALTER TABLE "recipes" ADD COLUMN "premium" boolean DEFAULT false;