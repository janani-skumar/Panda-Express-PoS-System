import db from "@/drizzle/src/index";
import { inventory } from "@/drizzle/src/db/schema";
import { sql } from "drizzle-orm";

export const getRestockReport = async () => {
    // Query inventory table where currentStock < estimatedUsedPerDay
    const restockItems = await db
        .select({
            id: inventory.id,
            name: inventory.name,
            currentStock: inventory.currentStock,
            estimatedUsedPerDay: inventory.estimatedUsedPerDay,
        })
        .from(inventory)
        .where(
            sql`${inventory.currentStock} < ${inventory.estimatedUsedPerDay}`
        );

    // Add needsRestock flag to each item
    const result = restockItems.map(item => ({
        ...item,
        needsRestock: true,
    }));

    return result;
};

