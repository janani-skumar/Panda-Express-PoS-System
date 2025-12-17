// /app/api/chat/route.ts
import { NextResponse } from "next/server";
import OpenAI from "openai";
import { OrderInfo, MealType, Recipe, MealOrder, IndividualItem, RecipeSelection } from "@/lib/types";
import { getMealTypes } from "@/app/services/mealTypeService";
import { getRecipes } from "@/app/services/recipeService";

// Lazy initialization of OpenAI client to avoid build-time errors
let client: OpenAI | null = null;

function getOpenAIClient(): OpenAI {
  if (!client) {
    if (!process.env.OPEN_AI_SECRET) {
      throw new Error("OPEN_AI_SECRET environment variable is not set");
    }
    client = new OpenAI({
      apiKey: process.env.OPEN_AI_SECRET
    });
  }
  return client;
}

export async function POST(req: Request) {
  const body = await req.json();
  const userMessage = body.message as string;
  const conversationHistory = body.conversationHistory as { role: "user" | "assistant"; text: string }[] || [];
  const cart = body.cart as { meals: MealOrder[]; individualItems: IndividualItem[] } || { meals: [], individualItems: [] };

  // Fetch available meal types and recipes
  let mealtypes: MealType[] = [];
  let recipes: Recipe[] = [];
  
  try {
    const [mealtypesData, recipesData] = await Promise.all([
      getMealTypes(),
      getRecipes()
    ]);
    
    // Filter and cast meal types - use empty string for null imageFilePath
    mealtypes = mealtypesData
      .map((mt: any) => ({
        typeName: mt.typeName,
        sides: mt.sides,
        entrees: mt.entrees,
        drinks: mt.drinks,
        price: mt.price,
        imageFilePath: mt.imageFilePath || ""
      }));
    
    // Filter and cast recipes - ensure required fields are present and filter out null types
    recipes = recipesData
      .filter((r: any) => r.type != null && r.id != null)
      .map((r: any) => ({
        name: r.name,
        image: r.image,
        id: r.id,
        pricePerServing: r.pricePerServing,
        ordersPerBatch: r.ordersPerBatch,
        type: r.type as Recipe["type"],
        premium: r.premium ?? false
      }));
  } catch (error) {
    console.error("Failed to fetch meal types or recipes:", error);
  }

  // Build system prompt with available options
  const buildSystemPrompt = (mealtypes: MealType[], recipes: Recipe[], cart: { meals: MealOrder[]; individualItems: IndividualItem[] }): string => {
    let prompt = "You are an AI assistant for a Panda Express Kiosk. Your goal is to help the customer manage their cart by adding or removing items. Please be kind and helpful. Please keep your messages brief and tell the customer what actions you take. You CAN add items to the cart using the addToCart function, and you CAN remove items from the cart using the removeFromCart function. You cannot navigate the Kiosk.\n\n";
    prompt += "You can format your responses using Markdown syntax to make them more readable. You can use:\n";
    prompt += "- **bold text** for emphasis\n";
    prompt += "- *italic text* for subtle emphasis\n";
    prompt += "- Lists (bulleted or numbered) to organize information\n";
    prompt += "- `code formatting` for item names or IDs\n";
    prompt += "- Headers (##, ###) to structure longer responses\n\n";
    
    // Add current cart contents to the system prompt
    prompt += "CURRENT CART CONTENTS (use these indices for removing items - indices start at 1):\n";
    if (cart.meals.length === 0 && cart.individualItems.length === 0) {
      prompt += "- Cart is empty\n\n";
    } else {
      if (cart.meals.length > 0) {
        prompt += "Meals in cart (use mealIndices to remove):\n";
        cart.meals.forEach((meal, index) => {
          prompt += `  Meal ${index + 1}: ${meal.mealType} (Quantity: ${meal.quantity}, Price: $${meal.price.toFixed(2)})\n`;
          prompt += `     Entrees: ${meal.selections.entrees.map((e: RecipeSelection) => e.recipeName).join(", ")}\n`;
          prompt += `     Sides: ${meal.selections.sides.map((s: RecipeSelection) => s.recipeName).join(", ")}\n`;
          prompt += `     Drinks: ${meal.selections.drinks.map((d: RecipeSelection) => d.recipeName).join(", ")}\n`;
        });
        prompt += "\n";
      }
      if (cart.individualItems.length > 0) {
        prompt += "Individual items in cart (use itemIndices to remove):\n";
        cart.individualItems.forEach((item, index) => {
          prompt += `  Item ${index + 1}: ${item.recipeName} (${item.recipeType}, Quantity: ${item.quantity}, Price: $${item.price.toFixed(2)})\n`;
        });
        prompt += "\n";
      }
    }
    
    prompt += "AVAILABLE MEAL TYPES:\n";
    mealtypes
      .filter(mt => mt.typeName !== "Drink" && mt.typeName !== "A La Carte" && !mt.typeName.includes("Party"))
      .forEach(mt => {
        prompt += `- ${mt.typeName}: $${mt.price.toFixed(2)} (${mt.entrees} entree(s), ${mt.sides} side(s), ${mt.drinks} drink(s))\n`;
      });
    
    prompt += "\nAVAILABLE RECIPES:\n";
    const recipesByType = {
      Entree: recipes.filter(r => r.type === "Entree"),
      Side: recipes.filter(r => r.type === "Side"),
      Drink: recipes.filter(r => r.type === "Drink"),
      Appetizer: recipes.filter(r => r.type === "Appetizer")
    };
    
    Object.entries(recipesByType).forEach(([type, items]) => {
      if (items.length > 0) {
        prompt += `\n${type}s:\n`;
        items.forEach(r => {
          const price = r.pricePerServing != null ? r.pricePerServing.toFixed(2) : "N/A";
          prompt += `  - ${r.name} (ID: ${r.id}) - $${price}\n`;
        });
      }
    });
    
    prompt += "\nINSTRUCTIONS:\n";
    prompt += "IMPORTANT - CART MANAGEMENT:\n";
    prompt += "- You CAN and SHOULD add items to the cart when customers want to order using the addToCart function.\n";
    prompt += "- You CAN and SHOULD remove items from the cart when customers ask to remove, delete, or take out items using the removeFromCart function.\n";
    prompt += "- When removing items, use the mealIndices array for meals and itemIndices array for individual items. Use the 1-based indices shown in the CURRENT CART CONTENTS section (e.g., Meal 1 = index 1, Item 2 = index 2).\n";
    prompt += "- If a customer wants to clear everything, use removeFromCart with clearAll: true.\n";
    prompt += "- NEVER tell the customer you cannot remove items - you absolutely can remove items!\n\n";
    prompt += "ORDERING INSTRUCTIONS:\n";
    prompt += "- When a customer orders a meal, you must select the exact number of entrees, sides, and drinks required by the meal type.\n";
    prompt += "- Use recipe IDs and names when adding items to cart.\n";
    prompt += "- For meals, provide the mealType name exactly as listed above.\n";
    prompt += "- For individual items, use the recipeType (Entree, Side, Drink, or Appetizer).\n";
    prompt += "- You can see what is currently in the customer's cart in the 'CURRENT CART CONTENTS' section above. Use this information to answer questions about their cart, suggest additional items, remove items, or help them complete their order.\n";
    
    return prompt;
  };

  const systemPrompt = buildSystemPrompt(mealtypes, recipes, cart);

  // Build messages array with system prompt, conversation history, and new user message
  const messages: Array<{ role: "system" | "user" | "assistant"; content: string }> = [
    {
      role: "system",
      content: systemPrompt
    }
  ];

  // Add conversation history (convert to OpenAI format)
  // Limit to last 15 messages to avoid token limits
  const limitedHistory = conversationHistory.slice(-15);
  limitedHistory.forEach((msg: { role: "user" | "assistant"; text: string }) => {
    if (msg.role === "user" || msg.role === "assistant") {
      messages.push({
        role: msg.role,
        content: msg.text
      });
    }
  });

  // Add the new user message
  messages.push({ role: "user", content: userMessage });

  const openai = getOpenAIClient();
  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: messages,
    max_completion_tokens: 200,
    functions: [
      {
        name: "addToCart",
        description: "Adds meals or individual items to the cart. Use this function when the customer wants to add items to their order.",
        parameters: {
          type: "object",
          properties: {
            meals: {
              type: "array",
              description: "Array of meal orders. Each meal must include all required entrees, sides, and drinks based on the meal type requirements.",
              items: {
                type: "object",
                properties: {
                  mealType: {
                    type: "string",
                    description: "The name of the meal type (e.g., 'Bowl', 'Plate', 'Bigger Plate')"
                  },
                  quantity: {
                    type: "number",
                    description: "Number of this meal to add (usually 1)"
                  },
                  price: {
                    type: "number",
                    description: "Price of the meal type"
                  },
                  selections: {
                    type: "object",
                    description: "Selections for this meal, must match the meal type requirements",
                    properties: {
                      entrees: {
                        type: "array",
                        description: "Array of entrees. Must match the number required by the meal type.",
                        items: {
                          type: "object",
                          properties: {
                            recipeId: { type: "number", description: "The recipe ID of the entree" },
                            recipeName: { type: "string", description: "The name of the entree recipe" }
                          },
                          required: ["recipeId", "recipeName"]
                        }
                      },
                      sides: {
                        type: "array",
                        description: "Array of sides. Must match the number required by the meal type.",
                        items: {
                          type: "object",
                          properties: {
                            recipeId: { type: "number", description: "The recipe ID of the side" },
                            recipeName: { type: "string", description: "The name of the side recipe" }
                          },
                          required: ["recipeId", "recipeName"]
                        }
                      },
                      drinks: {
                        type: "array",
                        description: "Array of drinks. Must match the number required by the meal type.",
                        items: {
                          type: "object",
                          properties: {
                            recipeId: { type: "number", description: "The recipe ID of the drink" },
                            recipeName: { type: "string", description: "The name of the drink recipe" }
                          },
                          required: ["recipeId", "recipeName"]
                        }
                      }
                    },
                    required: ["entrees", "sides", "drinks"]
                  }
                },
                required: ["mealType", "quantity", "price", "selections"]
              }
            },
            individualItems: {
              type: "array",
              description: "Array of individual items (entrees, sides, drinks, or appetizers) that are not part of a meal",
              items: {
                type: "object",
                properties: {
                  recipeId: {
                    type: "number",
                    description: "The recipe ID of the item"
                  },
                  recipeName: {
                    type: "string",
                    description: "The name of the recipe"
                  },
                  recipeType: {
                    type: "string",
                    enum: ["Entree", "Side", "Drink", "Appetizer"],
                    description: "The type of recipe"
                  },
                  quantity: {
                    type: "number",
                    description: "Quantity of this item"
                  },
                  price: {
                    type: "number",
                    description: "Price per serving of this recipe"
                  }
                },
                required: ["recipeId", "recipeName", "recipeType", "quantity", "price"]
              }
            }
          },
          required: []
        }
      },
      {
        name: "removeFromCart",
        description: "Removes meals or individual items from the cart. Use this function when the customer wants to remove items from their order. Use the indices from the CURRENT CART CONTENTS section (1-based indexing).",
        parameters: {
          type: "object",
          properties: {
            mealIndices: {
              type: "array",
              description: "Array of meal indices to remove (1-based, e.g., [1] to remove the first meal, [2] for the second meal). Refer to the CURRENT CART CONTENTS section for indices.",
              items: {
                type: "number"
              }
            },
            itemIndices: {
              type: "array",
              description: "Array of individual item indices to remove (1-based, e.g., [1] to remove the first individual item). Refer to the CURRENT CART CONTENTS section for indices.",
              items: {
                type: "number"
              }
            },
            clearAll: {
              type: "boolean",
              description: "If true, clears the entire cart. Use this when the customer wants to remove all items or start over."
            }
          },
          required: []
        }
      }
    ]
  });

  const msg = response.choices[0].message;

  if (msg.function_call?.name === "addToCart" || msg.function_call?.name === "removeFromCart") {
    // Return the function call to the frontend so it can handle the cart operation
    return NextResponse.json({
      type: "function-called",
      message: msg.function_call.name === "addToCart" ? "Items added to cart." : "Items removed from cart.",
      function_call: {
        name: msg.function_call.name,
        arguments: msg.function_call.arguments
      }
    });
  }

  return NextResponse.json({
    type: "message",
    message: msg.content
  });
}