import db from "@/drizzle/src/index";
import { inventory } from "@/drizzle/src/db/schema";
import { eq } from "drizzle-orm";

export const getInventory = async () => {
    const allInventory = await db.select().from(inventory);
    return allInventory;
};

export const getInventoryById = async (id) => {
    const inventoryItem = await db
        .select()
        .from(inventory)
        .where(eq(inventory.id, id));
    return inventoryItem;
};

export const createInventory = async (inventoryItem) => {
    console.log("Creating inventory item: ", inventoryItem);
    try {
        const [createdInventory] = await db
            .insert(inventory)
            .values(inventoryItem)
            .returning();
        console.log("Created inventory item: ", createdInventory);
        return createdInventory;
    } catch (error) {
        console.error("Database error details:", error);
        console.error("Error message:", error.message);
        console.error("Error code:", error.code);
        console.error("Error detail:", error.detail);
        throw error;
    }
};
export const updateInventory = async (id, inventoryItem) => {
    const updatedInventory = await db
        .update(inventory)
        .set(inventoryItem)
        .where(eq(inventory.id, id));
    return updatedInventory;
};

export const deleteInventory = async (id) => {
    const deletedInventory = await db
        .delete(inventory)
        .where(eq(inventory.id, id));
    return deletedInventory;
};

export const consumeInventory = async (inventoryId, quantity) => {
    const inventoryItem = await getInventoryById(inventoryId);
    console.log("Inventory item: ", inventoryItem);
    if (!inventoryItem) {
        throw new Error("Inventory not found: " + inventoryId);
    }
    if (inventoryItem[0].currentStock < quantity) {
        console.log(
            "Insufficient inventory: ",
            inventoryItem[0].name,
            inventoryItem[0].currentStock,
            quantity
        );
        throw new Error(
            "Insufficient inventory: " +
                inventoryItem[0].name +
                " " +
                inventoryItem[0].currentStock +
                " " +
                quantity
        );
    }
    inventoryItem[0].currentStock -= quantity;
    console.log("Inventory item after consumption: ", inventoryItem[0]);
    return await updateInventory(inventoryId, inventoryItem[0]);
};
