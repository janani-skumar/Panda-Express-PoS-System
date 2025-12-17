import db from "@/drizzle/src/index";
import {
    orders,
    recOrderJunc,
    recipes,
    invRecJunc,
    inventory,
} from "@/drizzle/src/db/schema";
import { sql, and, gte, lte, eq } from "drizzle-orm";

export const getProductUsage = async (startDate, endDate) => {
    // Convert dates: start at beginning of start day, end at end of end day (inclusive)
    // Parse as UTC to match database timestamps
    const start = new Date(startDate + "T00:00:00.000Z");
    const end = new Date(endDate + "T23:59:59.999Z");

    // Query: orders -> recOrderJunc -> recipes -> invRecJunc -> inventory
    // Calculate: SUM(invRecJunc.inventoryQuantity * recOrderJunc.quantity) grouped by inventory item
    const productUsage = await db
        .select({
            inventoryId: inventory.id,
            inventoryName: inventory.name,
            totalUsed:
                sql`SUM(${invRecJunc.inventoryQuantity} * ${recOrderJunc.quantity})`.as(
                    "totalUsed"
                ),
        })
        .from(orders)
        .innerJoin(recOrderJunc, eq(orders.id, recOrderJunc.orderId))
        .innerJoin(recipes, eq(recOrderJunc.recipeId, recipes.id))
        .innerJoin(invRecJunc, eq(recipes.id, invRecJunc.recipeId))
        .innerJoin(inventory, eq(invRecJunc.inventoryId, inventory.id))
        .where(
            and(
                eq(orders.isCompleted, true),
                gte(orders.orderTime, start.toISOString()),
                lte(orders.orderTime, end.toISOString())
            )
        )
        .groupBy(inventory.id, inventory.name);

    return productUsage;
};
