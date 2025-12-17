import db from "@/drizzle/src/index";
import { expenses } from "@/drizzle/src/db/schema";
import { eq } from "drizzle-orm";

export const getExpenses = async () => {
  const allExpenses = await db.select().from(expenses);
  return allExpenses;
};

export const getExpenseById = async (id) => {
  const expense = await db.select().from(expenses).where(eq(expenses.id, id));
  return expense;
};

export const createExpense = async (expense) => {
  const [createdExpense] = await db.insert(expenses).values(expense).returning();
  return createdExpense;
};

export const updateExpense = async (id, expense) => {
  const updatedExpense = await db
    .update(expenses)
    .set(expense)
    .where(eq(expenses.id, id));
  return updatedExpense;
};

export const deleteExpense = async (id) => {
  const deletedExpense = await db.delete(expenses).where(eq(expenses.id, id));
  return deletedExpense;
};
