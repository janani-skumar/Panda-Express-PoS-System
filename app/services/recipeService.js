import db from "@/drizzle/src/index";
import { recipes } from "@/drizzle/src/db/schema";
import { getIngredientsByRecipeId } from "@/app/services/invRecService";
import { consumeInventory } from "@/app/services/inventoryService";
import { eq } from "drizzle-orm";

export const getRecipes = async () => {
    const allRecipes = await db.select().from(recipes);
    return allRecipes;
};

export const getRecipeById = async (id) => {
    const [recipe] = await db.select().from(recipes).where(eq(recipes.id, id));
    return recipe;
};

export const createRecipe = async (recipe) => {
    const [newRecipe] = await db.insert(recipes).values(recipe).returning();
    return newRecipe;
};

export const updateRecipe = async (id, recipe) => {
    const [updatedRecipe] = await db
        .update(recipes)
        .set(recipe)
        .where(eq(recipes.id, id))
        .returning();
    return updatedRecipe;
};

export const deleteRecipe = async (id) => {
    const deletedRecipe = await db.delete(recipes).where(eq(recipes.id, id));
    return deletedRecipe;
};

// Get each inventory item in recipe and consume it
export const cookIngredients = async (recipeId) => {
    const invRecJuncs = await getIngredientsByRecipeId(recipeId);
    console.log("InvRecJuncs: ", invRecJuncs);
    if (!invRecJuncs) {
        throw new Error("Inventory recipe junction not found: " + recipeId);
    }
    for (const junction of invRecJuncs) {
        await consumeInventory(
            junction.inventoryId,
            junction.inventoryQuantity
        );
    }
    console.log("Ingredients cooked");
};
