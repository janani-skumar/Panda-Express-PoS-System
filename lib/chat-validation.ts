import { MealOrder, IndividualItem, MealType, Recipe } from "./types";

/**
 * Validates a meal order against available meal types and recipes
 */
export function validateMeal(
  meal: MealOrder,
  mealtypes: MealType[],
  recipes: Recipe[]
): MealOrder | null {
  const validMealType = mealtypes.find(mt => mt.typeName === meal.mealType);
  if (!validMealType) {
    console.warn("Invalid meal type:", meal.mealType);
    return null;
  }

  const validateSelections = (selections: { entrees: any[], sides: any[], drinks: any[] }) => {
    const filterValid = (items: any[], type: "Entree" | "Side" | "Drink") =>
      items.filter(i => {
        const valid = recipes.some(r => r.id === i.recipeId && r.type === type);
        if (!valid) console.warn(`Invalid ${type}:`, i);
        return valid;
      });
    
    const validated = {
      entrees: filterValid(selections.entrees || [], "Entree"),
      sides: filterValid(selections.sides || [], "Side"),
      drinks: filterValid(selections.drinks || [], "Drink")
    };
    
    // Validate that counts match meal type requirements
    if (validated.entrees.length !== validMealType.entrees) {
      console.warn(`Meal requires ${validMealType.entrees} entrees, got ${validated.entrees.length}`);
      return null;
    }
    if (validated.sides.length !== validMealType.sides) {
      console.warn(`Meal requires ${validMealType.sides} sides, got ${validated.sides.length}`);
      return null;
    }
    if (validated.drinks.length !== validMealType.drinks) {
      console.warn(`Meal requires ${validMealType.drinks} drinks, got ${validated.drinks.length}`);
      return null;
    }
    
    return validated;
  };

  const validatedSelections = validateSelections(meal.selections);
  if (!validatedSelections) {
    return null;
  }

  // Use the correct price from meal type if not provided or different
  const price = validMealType.price;

  return {
    ...meal,
    price: price,
    quantity: meal.quantity || 1,
    selections: validatedSelections
  };
}

/**
 * Validates an individual item against available recipes
 */
export function validateIndividualItem(
  item: IndividualItem,
  recipes: Recipe[]
): IndividualItem | null {
  const recipe = recipes.find(r => r.id === item.recipeId && r.type === item.recipeType);
  if (!recipe) {
    console.warn("Invalid individual item:", item);
    return null;
  }
  
  // Auto-fill price if missing or invalid
  const price = item.price && item.price > 0 ? item.price : (recipe.pricePerServing || 0);
  
  return {
    ...item,
    price: price,
    quantity: item.quantity || 1
  };
}
