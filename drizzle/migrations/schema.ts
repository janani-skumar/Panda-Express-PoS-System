import { pgTable, foreignKey, real, integer, text, boolean, jsonb, check, pgEnum } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"

export const recipeType = pgEnum("recipe_type", ['Side', 'Entree', 'Drink', 'Appetizer'])


export const orders = pgTable("orders", {
	tax: real().notNull(),
	totalCost: real().notNull(),
	id: integer().primaryKey().generatedByDefaultAsIdentity({ name: "orders_id_seq", startWith: 1, increment: 1, minValue: 1, maxValue: 2147483647, cache: 1 }),
	orderTime: text().notNull(),
	cashierId: integer().notNull(),
	isCompleted: boolean().notNull(),
	orderInfo: jsonb(),
	customerEmail: text(),
}, (table) => [
	foreignKey({
			columns: [table.cashierId],
			foreignColumns: [employees.id],
			name: "orders_cashierId_fkey"
		}),
]);

export const inventory = pgTable("inventory", {
	name: text().notNull().unique(),
	id: integer().primaryKey().generatedByDefaultAsIdentity({ name: "inventory_id_seq", startWith: 1, increment: 1, minValue: 1, maxValue: 2147483647, cache: 1 }),
	batchPurchaseCost: real().notNull(),
	currentStock: integer().notNull(),
	estimatedUsedPerDay: integer().notNull(),
});

export const expenses = pgTable("expenses", {
	cost: real().notNull(),
	id: integer().primaryKey().generatedByDefaultAsIdentity({ name: "expenses_id_seq", startWith: 1, increment: 1, minValue: 1, maxValue: 2147483647, cache: 1 }),
	itemId: integer().notNull(),
	expenseTime: text().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.itemId],
			foreignColumns: [inventory.id],
			name: "expenses_itemId_fkey"
		}),
]);

export const cooked = pgTable("cooked", {
	id: integer().primaryKey().generatedByDefaultAsIdentity({ name: "cooked_id_seq", startWith: 1, increment: 1, minValue: 1, maxValue: 2147483647, cache: 1 }),
	recipeId: integer().notNull(),
	currentStock: integer().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.recipeId],
			foreignColumns: [recipes.id],
			name: "cooked_recipeId_fkey"
		}),
]);

export const invRecJunc = pgTable("inv_rec_junc", {
	id: integer().primaryKey().generatedByDefaultAsIdentity({ name: "inv_rec_junc_id_seq", startWith: 1, increment: 1, minValue: 1, maxValue: 2147483647, cache: 1 }),
	inventoryId: integer().notNull(),
	recipeId: integer().notNull(),
	inventoryQuantity: integer().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.inventoryId],
			foreignColumns: [inventory.id],
			name: "inv_rec_junc_inventoryId_fkey"
		}),
	foreignKey({
			columns: [table.recipeId],
			foreignColumns: [recipes.id],
			name: "inv_rec_junc_recipeId_fkey"
		}),
]);

export const recOrderJunc = pgTable("rec_order_junc", {
	quantity: integer().notNull(),
	id: integer().primaryKey().generatedByDefaultAsIdentity({ name: "rec_order_junc_id_seq", startWith: 1, increment: 1, minValue: 1, maxValue: 2147483647, cache: 1 }),
	recipeId: integer().notNull(),
	orderId: integer().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.recipeId],
			foreignColumns: [recipes.id],
			name: "rec_order_junc_recipeId_fkey"
		}),
	foreignKey({
			columns: [table.orderId],
			foreignColumns: [orders.id],
			name: "rec_order_junc_orderId_fkey"
		}),
]);

export const zReportRuns = pgTable("z_report_runs", {
	id: integer().primaryKey().generatedByDefaultAsIdentity({ name: "z_report_runs_id_seq", startWith: 1, increment: 1, minValue: 1, maxValue: 2147483647, cache: 1 }),
	reportDate: text().notNull(),
	runTimestamp: text().notNull(),
	runBy: integer(),
}, (table) => [
	foreignKey({
			columns: [table.runBy],
			foreignColumns: [employees.id],
			name: "z_report_runs_runBy_fkey"
		}),
]);



export const roles = pgTable("roles", {
	name: text().notNull(),
	canDiscount: boolean().notNull(),
	canRestock: boolean().notNull(),
	id: integer().primaryKey().generatedByDefaultAsIdentity({ name: "roles_id_seq", startWith: 1, increment: 1, minValue: 1, maxValue: 2147483647, cache: 1 }),
	canEditEmployees: boolean().notNull(),
}, (table) => [
	check("roles_canDiscount_check", sql`"canDiscount" = ANY (ARRAY[true, false])`),
	check("roles_canRestock_check", sql`"canRestock" = ANY (ARRAY[true, false])`),
	check("roles_canEditEmployees_check", sql`"canEditEmployees" = ANY (ARRAY[true, false])`),
]);

export const employees = pgTable("employees", {
	name: text().notNull(),
	salary: real().notNull(),
	hours: integer().notNull(),
	password: text().notNull(),
	isEmployed: boolean().notNull(),
	id: integer().primaryKey().generatedByDefaultAsIdentity({ name: "employees_id_seq", startWith: 1, increment: 1, minValue: 1, maxValue: 2147483647, cache: 1 }),
	roleId: integer().notNull(),
	email: text(),
}, (table) => [
	foreignKey({
			columns: [table.roleId],
			foreignColumns: [roles.id],
			name: "employees_roleId_fkey"
		}),
	check("employees_isEmployed_check", sql`"isEmployed" = ANY (ARRAY[true, false])`),
]);

export const recipes = pgTable("recipes", {
	name: text().notNull().unique(),
	image: text(),
	id: integer().primaryKey().generatedByDefaultAsIdentity({ name: "recipes_id_seq", startWith: 1, increment: 1, minValue: 1, maxValue: 2147483647, cache: 1 }),
	pricePerServing: real().notNull(),
	ordersPerBatch: integer().notNull(),
	type: recipeType(),
	premium: boolean().default(false),
	seasonal: boolean().default(false),
});

export const mealTypes = pgTable("meal_types", {
	typeName: text().primaryKey().notNull(),
	sides: integer().notNull(),
	entrees: integer().notNull(),
	drinks: integer().notNull(),
	price: real().notNull(),
	imageFilePath: text(),
});
