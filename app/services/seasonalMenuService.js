import db from "@/drizzle/src/index";
import { recipes, inventory, invRecJunc } from "@/drizzle/src/db/schema";
import { max } from "drizzle-orm";

export const createSeasonalMenuItem = async (recipeData, inventoryItems) => {
    // Use transaction to ensure atomicity
    return await db.transaction(async (tx) => {
        // Get next recipe ID
        const recipeMaxResult = await tx
            .select({ maxId: max(recipes.id) })
            .from(recipes);
        const nextRecipeId = (recipeMaxResult[0]?.maxId || 0) + 1;

        // Create recipe
        const newRecipe = {
            id: nextRecipeId,
            name: recipeData.name,
            image: recipeData.image || null,
            pricePerServing: recipeData.pricePerServing,
            ordersPerBatch: recipeData.ordersPerBatch,
            type: recipeData.type,
        };

        await tx.insert(recipes).values(newRecipe);

        // Process inventory items
        const createdInvRecJuncs = [];
        
        for (const item of inventoryItems) {
            let inventoryId;
            
            if (item.inventoryId) {
                // Use existing inventory
                inventoryId = item.inventoryId;
            } else if (item.name) {
                // Create new inventory item
                const inventoryMaxResult = await tx
                    .select({ maxId: max(inventory.id) })
                    .from(inventory);
                const nextInventoryId = (inventoryMaxResult[0]?.maxId || 0) + 1;

                const newInventory = {
                    id: nextInventoryId,
                    name: item.name,
                    batchPurchaseCost: item.batchPurchaseCost,
                    currentStock: item.currentStock,
                    estimatedUsedPerDay: item.estimatedUsedPerDay,
                };

                await tx.insert(inventory).values(newInventory);
                inventoryId = nextInventoryId;
            } else {
                throw new Error('Inventory item must have either inventoryId or name');
            }

            // Get next invRecJunc ID
            const invRecJuncMaxResult = await tx
                .select({ maxId: max(invRecJunc.id) })
                .from(invRecJunc);
            const nextInvRecJuncId = (invRecJuncMaxResult[0]?.maxId || 0) + 1;

            // Create invRecJunc entry
            const newInvRecJunc = {
                id: nextInvRecJuncId,
                inventoryId: inventoryId,
                recipeId: nextRecipeId,
                inventoryQuantity: item.inventoryQuantity,
            };

            await tx.insert(invRecJunc).values(newInvRecJunc);
            createdInvRecJuncs.push(newInvRecJunc);
        }

        // Return created recipe with inventory relationships
        return {
            recipe: newRecipe,
            inventoryRelationships: createdInvRecJuncs,
        };
    });
};

