import db from "@/drizzle/src/index";
import { recOrderJunc } from "@/drizzle/src/db/schema";
import { eq } from "drizzle-orm";

export const getRecOrderJuncs = async () => {
  const allRecOrderJuncs = await db.select().from(recOrderJunc);
  return allRecOrderJuncs;
};

export const getRecOrderJuncById = async (id) => {
  const recOrderJunc = await db
    .select()
    .from(recOrderJunc)
    .where(eq(recOrderJunc.id, id));
  return recOrderJunc;
};

export const createRecOrderJunc = async (recOrderJuncData) => {
  const [createdRecOrderJunc] = await db
    .insert(recOrderJunc)
    .values(recOrderJuncData)
    .returning();
  return createdRecOrderJunc;
};

export const updateRecOrderJunc = async (id, recOrderJuncData) => {
  const [updatedRecOrderJunc] = await db
    .update(recOrderJunc)
    .set(recOrderJuncData)
    .where(eq(recOrderJunc.id, id))
    .returning();
  return updatedRecOrderJunc;
};

export const deleteRecOrderJunc = async (id) => {
  const deletedRecOrderJunc = await db
    .delete(recOrderJunc)
    .where(eq(recOrderJunc.id, id));
  return deletedRecOrderJunc;
};

export const deleteRecOrderJuncsByOrderId = async (orderId) => {
  const deleted = await db
    .delete(recOrderJunc)
    .where(eq(recOrderJunc.orderId, orderId));
  return deleted;
};
