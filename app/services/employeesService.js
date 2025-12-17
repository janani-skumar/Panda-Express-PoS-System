import db from "@/drizzle/src/index";
import { employees } from "@/drizzle/src/db/schema";
import { eq } from "drizzle-orm";

export const getEmployees = async () => {
    const allEmployees = await db.select().from(employees);
    return allEmployees;
};

export const getEmployeeById = async (id) => {
    const employee = await db
        .select()
        .from(employees)
        .where(eq(employees.id, id));
    return employee;
};

export const createEmployee = async (employeeData) => {
    const createdEmployee = await db.insert(employees).values(employeeData);
    return createdEmployee;
};

export const updateEmployee = async (id, employeeData) => {
    const updatedEmployee = await db
        .update(employees)
        .set(employeeData)
        .where(eq(employees.id, id));
    return updatedEmployee;
};

export const deleteEmployee = async (id) => {
    const removedEmployee = await db.delete(employees).where(eq(employees.id, id));
    return removedEmployee;
};