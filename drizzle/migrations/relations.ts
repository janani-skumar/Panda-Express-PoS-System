import { relations } from "drizzle-orm/relations";
import { employees, orders, inventory, expenses, recipes, cooked, invRecJunc, recOrderJunc, zReportRuns, roles } from "./schema";

export const ordersRelations = relations(orders, ({one, many}) => ({
	employee: one(employees, {
		fields: [orders.cashierId],
		references: [employees.id]
	}),
	recOrderJuncs: many(recOrderJunc),
}));

export const employeesRelations = relations(employees, ({one, many}) => ({
	orders: many(orders),
	zReportRuns: many(zReportRuns),
	role: one(roles, {
		fields: [employees.roleId],
		references: [roles.id]
	}),
}));

export const expensesRelations = relations(expenses, ({one}) => ({
	inventory: one(inventory, {
		fields: [expenses.itemId],
		references: [inventory.id]
	}),
}));

export const inventoryRelations = relations(inventory, ({many}) => ({
	expenses: many(expenses),
	invRecJuncs: many(invRecJunc),
}));

export const cookedRelations = relations(cooked, ({one}) => ({
	recipe: one(recipes, {
		fields: [cooked.recipeId],
		references: [recipes.id]
	}),
}));

export const recipesRelations = relations(recipes, ({many}) => ({
	cookeds: many(cooked),
	invRecJuncs: many(invRecJunc),
	recOrderJuncs: many(recOrderJunc),
}));

export const invRecJuncRelations = relations(invRecJunc, ({one}) => ({
	inventory: one(inventory, {
		fields: [invRecJunc.inventoryId],
		references: [inventory.id]
	}),
	recipe: one(recipes, {
		fields: [invRecJunc.recipeId],
		references: [recipes.id]
	}),
}));

export const recOrderJuncRelations = relations(recOrderJunc, ({one}) => ({
	recipe: one(recipes, {
		fields: [recOrderJunc.recipeId],
		references: [recipes.id]
	}),
	order: one(orders, {
		fields: [recOrderJunc.orderId],
		references: [orders.id]
	}),
}));

export const zReportRunsRelations = relations(zReportRuns, ({one}) => ({
	employee: one(employees, {
		fields: [zReportRuns.runBy],
		references: [employees.id]
	}),
}));

export const rolesRelations = relations(roles, ({many}) => ({
	employees: many(employees),
}));