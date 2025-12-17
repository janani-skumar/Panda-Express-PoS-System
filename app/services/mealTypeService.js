import db from "@/drizzle/src/index";
import { mealTypes } from "@/drizzle/src/db/schema";
import { eq } from "drizzle-orm";

export const getMealTypes = async () => {
  const allMealTypes = await db.select().from(mealTypes);
  return allMealTypes;
};

export const getMealTypeByName = async (name) => {
  const result = await db.select().from(mealTypes).where(eq(mealTypes.name, name));
  return result;
};

export const createMealType = async (mealType) => {
  const created = await db.insert(mealTypes).values(mealType);
  return created;
};

export const updateMealType = async (name, updates) => {
  const updated = await db.update(mealTypes).set(updates).where(eq(mealTypes.name, name));
  return updated;
};

export const deleteMealType = async (name) => {
  const deleted = await db.delete(mealTypes).where(eq(mealTypes.name, name));
  return deleted;
};


