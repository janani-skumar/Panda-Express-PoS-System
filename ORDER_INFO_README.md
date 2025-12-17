# Order Info JSON Structure

This document describes the JSON structure used for the `orderInfo` field in the `orders` table.

## Overview

The `orderInfo` JSONB field stores complete order information, including:

- **Meals**: Meal types with selected entrees, sides, and drinks
- **Individual Items**: Standalone recipes (sides, entrees, or drinks) ordered separately

**Note**: Pricing calculations (subtotal, tax, totalCost) and notes are stored in separate fields on the `orders` table.

## Full Detail Structure (Recommended)

### Example JSON

```json
{
  "meals": [
    {
      "mealType": "Kids Meal",
      "mealTypeId": "Kids Meal",
      "quantity": 2,
      "price": 8.99,
      "selections": {
        "entrees": [
          {
            "recipeId": 5,
            "recipeName": "Chicken Nuggets"
          }
        ],
        "sides": [
          {
            "recipeId": 12,
            "recipeName": "French Fries"
          }
        ],
        "drinks": [
          {
            "recipeId": 20,
            "recipeName": "Apple Juice"
          }
        ]
      }
    },
    {
      "mealType": "Combo Meal",
      "mealTypeId": "Combo Meal",
      "quantity": 1,
      "price": 12.99,
      "selections": {
        "entrees": [
          {
            "recipeId": 3,
            "recipeName": "Burger"
          }
        ],
        "sides": [
          {
            "recipeId": 12,
            "recipeName": "French Fries"
          },
          {
            "recipeId": 15,
            "recipeName": "Onion Rings"
          }
        ],
        "drinks": [
          {
            "recipeId": 18,
            "recipeName": "Coca Cola"
          }
        ]
      }
    }
  ],
  "individualItems": [
    {
      "recipeId": 25,
      "recipeName": "Caesar Salad",
      "recipeType": "Side",
      "quantity": 1,
      "price": 4.99
    },
    {
      "recipeId": 30,
      "recipeName": "Water",
      "recipeType": "Drink",
      "quantity": 2,
      "price": 0.0
    }
  ]
}
```

### Template Structure

```json
{
  "meals": [
    {
      "mealType": "<meal type name>",
      "mealTypeId": "<meal type name>",
      "quantity": <number>,
      "price": <number>,
      "selections": {
        "entrees": [
          {
            "recipeId": <number>,
            "recipeName": "<string>"
          }
        ],
        "sides": [
          {
            "recipeId": <number>,
            "recipeName": "<string>"
          }
        ],
        "drinks": [
          {
            "recipeId": <number>,
            "recipeName": "<string>"
          }
        ]
      }
    }
  ],
  "individualItems": [
    {
      "recipeId": <number>,
      "recipeName": "<string>",
      "recipeType": "Side" | "Entree" | "Drink",
      "quantity": <number>,
      "price": <number>
    }
  ]
}
```

## Field Descriptions

### Root Level

- **`meals`** (array): Array of meal type orders
- **`individualItems`** (array): Array of standalone recipe items

### Meal Object

- **`mealType`** (string): Display name of the meal type
- **`mealTypeId`** (string): Identifier for the meal type (matches `mealTypes.name`)
- **`quantity`** (number): Number of this meal type ordered
- **`price`** (number): Price per meal
- **`selections`** (object): Selected recipes for this meal
  - **`entrees`** (array): Selected entree recipes
  - **`sides`** (array): Selected side recipes
  - **`drinks`** (array): Selected drink recipes

### Selection Object (within meals)

- **`recipeId`** (number): ID of the recipe (matches `recipes.id`)
- **`recipeName`** (string): Display name of the recipe

**Note**: Recipe prices can be retrieved from the `recipes` table if needed.

### Individual Item Object

- **`recipeId`** (number): ID of the recipe (matches `recipes.id`)
- **`recipeName`** (string): Display name of the recipe
- **`recipeType`** (string): Type of recipe - "Side", "Entree", or "Drink"
- **`quantity`** (number): Number of this item ordered
- **`price`** (number): Price per item

## Alternative: Compact Structure

If you prefer a more compact structure that relies on database relationships:

```json
{
  "meals": [
    {
      "mealTypeId": "Kids Meal",
      "quantity": 2,
      "selectedRecipeIds": {
        "entrees": [5],
        "sides": [12],
        "drinks": [20]
      }
    }
  ],
  "individualItems": [
    {
      "recipeId": 25,
      "quantity": 1
    },
    {
      "recipeId": 30,
      "quantity": 2
    }
  ]
}
```

**Note**: This compact structure requires additional database queries to fetch recipe names and prices when displaying order details.

## Design Considerations

### Full Detail Structure (Recommended)

✅ Self-contained - no additional queries needed for display  
✅ Easier to use for reporting and analytics  
✅ Includes all information needed for order display  
❌ Larger JSON size

### Compact Structure

✅ Smaller JSON size  
✅ Less redundancy  
❌ Requires database joins to display order details  
❌ More complex queries for order processing

## Database Schema Reference

- **Meal Types**: `mealTypes` table (name, sides, entrees, drinks, price)
- **Recipes**: `recipes` table (id, name, type, pricePerServing)
- **Recipe Types**: Enum values - "Side", "Entree", "Drink"
