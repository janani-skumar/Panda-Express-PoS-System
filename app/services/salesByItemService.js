import db from "@/drizzle/src/index";
import { orders, recOrderJunc, recipes } from "@/drizzle/src/db/schema";
import { sql, and, gte, lte, eq, sum } from "drizzle-orm";

export const getSalesByItem = async (startDate, endDate) => {
    // Convert dates: start at beginning of start day, end at end of end day (inclusive)
    // orderTime is stored in CST format (no timezone), so we need to create CST timestamps
    // Format: YYYY-MM-DDTHH:mm:ss (CST time, no 'Z' suffix)
    const start = startDate + "T00:00:00";
    const end = endDate + "T23:59:59";

    // Query: orders -> recOrderJunc -> recipes
    // Group by recipe.id
    // Calculate: total quantity sold, total revenue (quantity * pricePerServing)
    const salesByItem = await db
        .select({
            recipeId: recipes.id,
            recipeName: recipes.name,
            recipeType: recipes.type,
            totalQuantity: sum(recOrderJunc.quantity),
            totalRevenue:
                sql`SUM(${recOrderJunc.quantity} * ${recipes.pricePerServing})`.as(
                    "totalRevenue"
                ),
        })
        .from(orders)
        .innerJoin(recOrderJunc, eq(orders.id, recOrderJunc.orderId))
        .innerJoin(recipes, eq(recOrderJunc.recipeId, recipes.id))
        .where(
            and(
                eq(orders.isCompleted, true),
                gte(orders.orderTime, start),
                lte(orders.orderTime, end)
            )
        )
        .groupBy(recipes.id, recipes.name, recipes.type);

    return salesByItem;
};
