ALTER TABLE "cooked" RENAME COLUMN "recipe_id" TO "recipeId";--> statement-breakpoint
ALTER TABLE "cooked" RENAME COLUMN "current_stock" TO "currentStock";--> statement-breakpoint
ALTER TABLE "employees" RENAME COLUMN "is_employed" TO "isEmployed";--> statement-breakpoint
ALTER TABLE "employees" RENAME COLUMN "role_id" TO "roleId";--> statement-breakpoint
ALTER TABLE "expenses" RENAME COLUMN "item_id" TO "itemId";--> statement-breakpoint
ALTER TABLE "expenses" RENAME COLUMN "expense_time" TO "expenseTime";--> statement-breakpoint
ALTER TABLE "inv_rec_junc" RENAME COLUMN "inventory_id" TO "inventoryId";--> statement-breakpoint
ALTER TABLE "inv_rec_junc" RENAME COLUMN "recipe_id" TO "recipeId";--> statement-breakpoint
ALTER TABLE "inv_rec_junc" RENAME COLUMN "inventory_quantity" TO "inventoryQuantity";--> statement-breakpoint
ALTER TABLE "inventory" RENAME COLUMN "batch_purchase_cost" TO "batchPurchaseCost";--> statement-breakpoint
ALTER TABLE "inventory" RENAME COLUMN "current_stock" TO "currentStock";--> statement-breakpoint
ALTER TABLE "inventory" RENAME COLUMN "estimated_used_per_day" TO "estimatedUsedPerDay";--> statement-breakpoint
ALTER TABLE "meal_types" RENAME COLUMN "type_name" TO "typeName";--> statement-breakpoint
ALTER TABLE "meal_types" RENAME COLUMN "image_file_path" TO "imageFilePath";--> statement-breakpoint
ALTER TABLE "orders" RENAME COLUMN "total_cost" TO "totalCost";--> statement-breakpoint
ALTER TABLE "orders" RENAME COLUMN "order_time" TO "orderTime";--> statement-breakpoint
ALTER TABLE "orders" RENAME COLUMN "cashier_id" TO "cashierId";--> statement-breakpoint
ALTER TABLE "orders" RENAME COLUMN "is_completed" TO "isCompleted";--> statement-breakpoint
ALTER TABLE "orders" RENAME COLUMN "order_info" TO "orderInfo";--> statement-breakpoint
ALTER TABLE "rec_order_junc" RENAME COLUMN "recipe_id" TO "recipeId";--> statement-breakpoint
ALTER TABLE "rec_order_junc" RENAME COLUMN "order_id" TO "orderId";--> statement-breakpoint
ALTER TABLE "recipes" RENAME COLUMN "price_per_serving" TO "pricePerServing";--> statement-breakpoint
ALTER TABLE "recipes" RENAME COLUMN "orders_per_batch" TO "ordersPerBatch";--> statement-breakpoint
ALTER TABLE "roles" RENAME COLUMN "can_discount" TO "canDiscount";--> statement-breakpoint
ALTER TABLE "roles" RENAME COLUMN "can_restock" TO "canRestock";--> statement-breakpoint
ALTER TABLE "roles" RENAME COLUMN "can_edit_employees" TO "canEditEmployees";--> statement-breakpoint
ALTER TABLE "employees" DROP CONSTRAINT "employees_is_employed_check";--> statement-breakpoint
ALTER TABLE "roles" DROP CONSTRAINT "roles_can_discount_check";--> statement-breakpoint
ALTER TABLE "roles" DROP CONSTRAINT "roles_can_restock_check";--> statement-breakpoint
ALTER TABLE "roles" DROP CONSTRAINT "roles_can_edit_employees_check";--> statement-breakpoint
ALTER TABLE "cooked" DROP CONSTRAINT "cooked_recipe_id_fkey";
--> statement-breakpoint
ALTER TABLE "employees" DROP CONSTRAINT "employees_role_id_fkey";
--> statement-breakpoint
ALTER TABLE "expenses" DROP CONSTRAINT "expenses_item_id_fkey";
--> statement-breakpoint
ALTER TABLE "inv_rec_junc" DROP CONSTRAINT "inv_rec_junc_inventory_id_fkey";
--> statement-breakpoint
ALTER TABLE "inv_rec_junc" DROP CONSTRAINT "inv_rec_junc_recipe_id_fkey";
--> statement-breakpoint
ALTER TABLE "orders" DROP CONSTRAINT "orders_cashier_id_fkey";
--> statement-breakpoint
ALTER TABLE "rec_order_junc" DROP CONSTRAINT "rec_order_junc_recipe_id_fkey";
--> statement-breakpoint
ALTER TABLE "rec_order_junc" DROP CONSTRAINT "rec_order_junc_order_id_fkey";
--> statement-breakpoint
ALTER TABLE "cooked" ADD CONSTRAINT "cooked_recipeId_fkey" FOREIGN KEY ("recipeId") REFERENCES "public"."recipes"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "employees" ADD CONSTRAINT "employees_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "public"."roles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "expenses" ADD CONSTRAINT "expenses_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "public"."inventory"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inv_rec_junc" ADD CONSTRAINT "inv_rec_junc_inventoryId_fkey" FOREIGN KEY ("inventoryId") REFERENCES "public"."inventory"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inv_rec_junc" ADD CONSTRAINT "inv_rec_junc_recipeId_fkey" FOREIGN KEY ("recipeId") REFERENCES "public"."recipes"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_cashierId_fkey" FOREIGN KEY ("cashierId") REFERENCES "public"."employees"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rec_order_junc" ADD CONSTRAINT "rec_order_junc_recipeId_fkey" FOREIGN KEY ("recipeId") REFERENCES "public"."recipes"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rec_order_junc" ADD CONSTRAINT "rec_order_junc_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "public"."orders"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "employees" ADD CONSTRAINT "employees_isEmployed_check" CHECK ("isEmployed" = ANY (ARRAY[true, false]));--> statement-breakpoint
ALTER TABLE "roles" ADD CONSTRAINT "roles_canDiscount_check" CHECK ("canDiscount" = ANY (ARRAY[true, false]));--> statement-breakpoint
ALTER TABLE "roles" ADD CONSTRAINT "roles_canRestock_check" CHECK ("canRestock" = ANY (ARRAY[true, false]));--> statement-breakpoint
ALTER TABLE "roles" ADD CONSTRAINT "roles_canEditEmployees_check" CHECK ("canEditEmployees" = ANY (ARRAY[true, false]));