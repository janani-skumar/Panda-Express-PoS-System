import db from "@/drizzle/src/index";
import { orders } from "@/drizzle/src/db/schema";
import { eq } from "drizzle-orm";
import { createRecOrderJunc, deleteRecOrderJuncsByOrderId } from "@/app/services/recOrderService";

export const getOrders = async () => {
    const allOrders = await db.select().from(orders);
    return allOrders;
};

export const getOrderById = async (id) => {
    console.log("id: " + id);
    const [output] = await db.select().from(orders).where(eq(orders.id, id));
    return output;
};

export const createOrder = async (order) => {
    console.log("order: " + JSON.stringify(order));
    const [createdOrder] = await db.insert(orders).values(order).returning();
    console.log("createdOrder: " + JSON.stringify(createdOrder));

    // Parse orderInfo and create rec_order_junc entries
    if (createdOrder.orderInfo) {
        try {
            const orderInfo = createdOrder.orderInfo;
            const recipeQuantities = new Map(); // Map to aggregate quantities by recipeId

            // Process meals
            if (orderInfo.meals && Array.isArray(orderInfo.meals)) {
                for (const meal of orderInfo.meals) {
                    const mealQuantity = meal.quantity || 1;

                    // Process entrees
                    if (
                        meal.selections?.entrees &&
                        Array.isArray(meal.selections.entrees)
                    ) {
                        for (const entree of meal.selections.entrees) {
                            const recipeId = entree.recipeId;
                            const currentQty =
                                recipeQuantities.get(recipeId) || 0;
                            recipeQuantities.set(
                                recipeId,
                                currentQty + mealQuantity
                            );
                        }
                    }

                    // Process sides
                    if (
                        meal.selections?.sides &&
                        Array.isArray(meal.selections.sides)
                    ) {
                        for (const side of meal.selections.sides) {
                            const recipeId = side.recipeId;
                            const currentQty =
                                recipeQuantities.get(recipeId) || 0;
                            recipeQuantities.set(
                                recipeId,
                                currentQty + mealQuantity
                            );
                        }
                    }

                    // Process drinks
                    if (
                        meal.selections?.drinks &&
                        Array.isArray(meal.selections.drinks)
                    ) {
                        for (const drink of meal.selections.drinks) {
                            const recipeId = drink.recipeId;
                            const currentQty =
                                recipeQuantities.get(recipeId) || 0;
                            recipeQuantities.set(
                                recipeId,
                                currentQty + mealQuantity
                            );
                        }
                    }
                }
            }

            // Process individual items
            if (
                orderInfo.individualItems &&
                Array.isArray(orderInfo.individualItems)
            ) {
                for (const item of orderInfo.individualItems) {
                    const recipeId = item.recipeId;
                    const itemQuantity = item.quantity || 1;
                    const currentQty = recipeQuantities.get(recipeId) || 0;
                    recipeQuantities.set(recipeId, currentQty + itemQuantity);
                }
            }

            console.log(
                "Recipe quantities to insert:",
                Array.from(recipeQuantities.entries())
            );

            // Create rec_order_junc entries
            for (const [recipeId, quantity] of recipeQuantities.entries()) {
                console.log(
                    `Creating rec_order_junc: orderId=${createdOrder.id}, recipeId=${recipeId}, quantity=${quantity}`
                );
                await createRecOrderJunc({
                    orderId: createdOrder.id,
                    recipeId: recipeId,
                    quantity: quantity,
                });
            }
            console.log("Successfully created all rec_order_junc entries");
        } catch (error) {
            console.error("Error creating rec_order_junc entries:", error);
            throw error;
        }
    }

    return createdOrder;
};

export const updateOrder = async (id, order) => {
    const updatedOrder = await db
        .update(orders)
        .set(order)
        .where(eq(orders.id, id));
    return updatedOrder;
};

export const deleteOrder = async (id) => {
    // First delete related rec_order_junc records to avoid foreign key constraint violation
    await deleteRecOrderJuncsByOrderId(id);
    // Then delete the order
    const deletedOrder = await db.delete(orders).where(eq(orders.id, id));
    return deletedOrder;
};

export const getIncompleteOrders = async () => {
    const incompleteOrders = await db
        .select()
        .from(orders)
        .where(eq(orders.isCompleted, false));
    return incompleteOrders;
};
