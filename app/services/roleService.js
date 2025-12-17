import db from "@/drizzle/src/index";
import { roles } from "@/drizzle/src/db/schema";
import { eq } from "drizzle-orm";

export const getRoles = async () => {
  const allRoles = await db.select().from(roles);
  return allRoles;
};

export const getRoleById = async (id) => {
  const role = await db.select().from(roles).where(eq(roles.id, id));
  return role;
};

export const createRole = async (role) => {
  const [createdRole] = await db.insert(roles).values(role).returning();
  return createdRole;
};

export const updateRole = async (id, role) => {
  const updatedRole = await db.update(roles).set(role).where(eq(roles.id, id));
  return updatedRole;
};

export const deleteRole = async (id) => {
  const deletedRole = await db.delete(roles).where(eq(roles.id, id));
  return deletedRole;
};
