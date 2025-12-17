import db from "@/drizzle/src/index";
import { employees } from "@/drizzle/src/db/schema";
import { eq } from "drizzle-orm";

export const verifyLoginPassword = async (password) => {
    const cleanedPassword = password.trim();
    if (!cleanedPassword) { return null; }
    try {
        console.log("Checking employee login for password:", cleanedPassword);

        const result = await db
            .select({
                id: employees.id,
                name: employees.name,
                roleId: employees.roleId,
                isEmployed: employees.isEmployed,
                password: employees.password,
                email: employees.email,
            })
            .from(employees)
            .where(eq(employees.password, cleanedPassword));

        console.log("Query result:", result);

        if (!result || result.length === 0) {
            console.log("No matching employee found for password:", cleanedPassword);
            return null;
        }
        let user = result[0];
        console.log("Authenticated PIN employee:", user.password);

        return {
            id: user.id,
            name: user.name,
            roleId: user.roleId,
            isEmployed: user.isEmployed,
            email: user.email,
        };
    } catch (error) {
        console.error("Database login error:", error);
        throw new Error("Failed to verify employee credentials");
    }
};

export async function verifyGoogleEmail(email) {
    if (!email) return null;

    try {
        console.log("Verifying google email with database, google email:", email);

        const result = await db
            .select({
                id: employees.id,
                name: employees.name,
                roleId: employees.roleId,
                email: employees.email,
                isEmployed: employees.isEmployed,
            })
            .from(employees)
            .where(eq(employees.email, email));

        console.log("Google query result:", result);

        if (!result || result.length === 0) {
            console.warn("Google email not found in employees: ", email)
            return null; // no match
        }

        const user = result[0];

        // reject terminated employees
        if (!user.isEmployed) {
            console.warn("Google user found but is not employed: ", user);
            return null;
        }

        console.log("Authenticated Google employee: ", user);
        return {
            id: user.id,
            name: user.name,
            roleId: user.roleId,
            email: user.email,
        };
    } catch (error) {
        console.error("Database google login error:", error);
        return null;
    }
}