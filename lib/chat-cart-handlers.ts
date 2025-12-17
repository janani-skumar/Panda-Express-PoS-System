import { OrderInfo, MealOrder, IndividualItem, MealType, Recipe } from "./types";
import { validateMeal, validateIndividualItem } from "./chat-validation";

type AddMessageCallback = (message: { role: "user" | "assistant"; text: string }) => void;
type AddMealCallback = (meal: MealOrder) => void;
type AddIndividualItemCallback = (item: IndividualItem) => void;
type RemoveMealCallback = (index: number) => void;
type RemoveIndividualItemCallback = (index: number) => void;
type ClearCartCallback = () => void;

interface CartHandlersConfig {
  addMessage: AddMessageCallback;
  addMeal: AddMealCallback;
  addIndividualItem: AddIndividualItemCallback;
  removeMeal: RemoveMealCallback;
  removeIndividualItem: RemoveIndividualItemCallback;
  clearCart: ClearCartCallback;
  meals: MealOrder[];
  individualItems: IndividualItem[];
  mealtypes: MealType[];
  recipes: Recipe[];
}

/**
 * Handles adding items to the cart from a function call
 */
export function handleAddToCart(
  jsonString: string,
  config: CartHandlersConfig
): void {
  try {
    console.log("Processing addToCart function call with arguments:", jsonString);
    const args = JSON.parse(jsonString) as OrderInfo;

    let addedCount = 0;

    // Add valid meals
    if (args.meals && Array.isArray(args.meals)) {
      args.meals.forEach(m => {
        const validMeal = validateMeal(m, config.mealtypes, config.recipes);
        if (validMeal) {
          console.log("Adding valid meal:", validMeal);
          config.addMeal(validMeal);
          addedCount++;
        }
      });
    }

    // Add valid individual items
    if (args.individualItems && Array.isArray(args.individualItems)) {
      args.individualItems.forEach(i => {
        const validItem = validateIndividualItem(i, config.recipes);
        if (validItem) {
          console.log("Adding valid individual item:", validItem);
          config.addIndividualItem(validItem);
          addedCount++;
        }
      });
    }

    if (addedCount > 0) {
      config.addMessage({ 
        role: "assistant", 
        text: `✓ Added ${addedCount} item(s) to your cart` 
      });
    } else {
      config.addMessage({ 
        role: "assistant", 
        text: "⚠ No valid items were added to cart. Please check that all items and meal selections are valid." 
      });
    }
  } catch (err) {
    console.error("Failed to parse addToCart function call", err);
    config.addMessage({ 
      role: "assistant", 
      text: "Failed to add items to cart. Please try again or rephrase your request." 
    });
  }
}

/**
 * Handles removing items from the cart from a function call
 */
export function handleRemoveFromCart(
  jsonString: string,
  config: CartHandlersConfig
): void {
  try {
    console.log("Processing removeFromCart function call with arguments:", jsonString);
    const args = JSON.parse(jsonString) as { mealIndices?: number[]; itemIndices?: number[]; clearAll?: boolean };

    if (args.clearAll) {
      config.clearCart();
      config.addMessage({ 
        role: "assistant", 
        text: "✓ Cleared all items from your cart" 
      });
      return;
    }

    let removedCount = 0;
    const removedItems: string[] = [];

    // Remove meals by index (convert from 1-based to 0-based)
    if (args.mealIndices && Array.isArray(args.mealIndices)) {
      // Sort indices in descending order to avoid index shifting issues when removing
      const sortedIndices = [...args.mealIndices]
        .map(index => index - 1) // Convert 1-based to 0-based
        .filter(index => index >= 0 && index < config.meals.length) // Validate indices
        .sort((a, b) => b - a); // Sort descending
      
      sortedIndices.forEach(actualIndex => {
        const meal = config.meals[actualIndex];
        removedItems.push(`${meal.mealType} meal`);
        config.removeMeal(actualIndex);
        removedCount++;
      });
    }

    // Remove individual items by index (convert from 1-based to 0-based)
    if (args.itemIndices && Array.isArray(args.itemIndices)) {
      // Sort indices in descending order to avoid index shifting issues when removing
      const sortedIndices = [...args.itemIndices]
        .map(index => index - 1) // Convert 1-based to 0-based
        .filter(index => index >= 0 && index < config.individualItems.length) // Validate indices
        .sort((a, b) => b - a); // Sort descending
      
      sortedIndices.forEach(actualIndex => {
        const item = config.individualItems[actualIndex];
        removedItems.push(item.recipeName);
        config.removeIndividualItem(actualIndex);
        removedCount++;
      });
    }

    if (removedCount > 0) {
      config.addMessage({ 
        role: "assistant", 
        text: `✓ Removed ${removedCount} item(s) from your cart: ${removedItems.join(", ")}` 
      });
    } else {
      config.addMessage({ 
        role: "assistant", 
        text: "⚠ No items were removed. Please check that the item indices are valid." 
      });
    }
  } catch (err) {
    console.error("Failed to parse removeFromCart function call", err);
    config.addMessage({ 
      role: "assistant", 
      text: "Failed to remove items from cart. Please try again or rephrase your request." 
    });
  }
}

/**
 * Handles function calls from the chat API
 */
export function handleFunctionCall(
  functionName: string,
  jsonString: string,
  config: CartHandlersConfig
): void {
  if (functionName === "addToCart") {
    handleAddToCart(jsonString, config);
  } else if (functionName === "removeFromCart") {
    handleRemoveFromCart(jsonString, config);
  } else {
    console.warn("Unknown function call:", functionName);
    config.addMessage({ 
      role: "assistant", 
      text: "Unknown function call. Please try again." 
    });
  }
}
