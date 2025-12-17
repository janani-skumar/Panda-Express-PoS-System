import db from "@/drizzle/src/index";
import { cooked } from "@/drizzle/src/db/schema";
import { getRecipeById, cookIngredients } from "@/app/services/recipeService";
import { eq } from "drizzle-orm";

export const getCooked = async () => {
    const allCooked = await db.select().from(cooked);
    return allCooked;
};

export const getCookedById = async (id) => {
    const [output] = await db.select().from(cooked).where(eq(cooked.id, id));
    return output;
};

export const getCookedByRecipeId = async (recipeId) => {
    const [output] = await db
        .select()
        .from(cooked)
        .where(eq(cooked.recipeId, recipeId));
    return output;
};

export const createCooked = async (newCooked) => {
    const insertData = {
        recipeId: newCooked.recipeId,
        currentStock: newCooked.currentStock,
    };

    const [created] = await db.insert(cooked).values(insertData).returning({
        id: cooked.id,
        recipeId: cooked.recipeId,
        currentStock: cooked.currentStock,
    });

    return created;
};

// Cook a recipe and return the cooked item
// If the recipe is already cooked, update the current stock
// If the recipe is not cooked, create a new cooked item
export const cookRecipe = async (recipeId) => {
    const recipe = await getRecipeById(recipeId);
    console.log("Recipe: ", recipe);
    if (!recipe) {
        throw new Error("Recipe not found");
    }
    await cookIngredients(recipeId);
    const cookedByRecipeId = await getCookedByRecipeId(recipeId); // See if already cooked
    if (cookedByRecipeId) {
        const newStock =
            (cookedByRecipeId.currentStock || 0) + recipe.ordersPerBatch;
        const updatedCooked = await updateCooked(cookedByRecipeId.id, {
            currentStock: newStock,
        });
        return updatedCooked;
    } else {
        const newCooked = await createCooked({
            recipeId,
            currentStock: recipe.ordersPerBatch,
        });
        return newCooked;
    }
};

export const updateCooked = async (id, newCooked) => {
    const [updatedCooked] = await db
        .update(cooked)
        .set(newCooked)
        .where(eq(cooked.id, id))
        .returning({
            id: cooked.id,
            recipeId: cooked.recipeId,
            currentStock: cooked.currentStock,
        });
    return updatedCooked;
};

export const consumeCooked = async (recipeId, quantity) => {
    const cookedByRecipeId = await getCookedByRecipeId(recipeId);
    if (!cookedByRecipeId) {
        throw new Error("Cooked not found");
    }
    if (cookedByRecipeId.currentStock < quantity) {
        throw new Error("Insufficient cooked");
    }
    const updatedCooked = await updateCooked(cookedByRecipeId.id, {
        currentStock: cookedByRecipeId.currentStock - quantity,
    });
    return updatedCooked;
};
