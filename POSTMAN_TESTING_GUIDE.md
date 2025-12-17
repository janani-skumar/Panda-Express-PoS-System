# Postman API Testing Guide

## Base URL

```
http://localhost:3000
```

## Setup Instructions

1. Start your Next.js development server: `npm run dev`
2. Import this guide into Postman or manually create requests
3. Use the sample request bodies provided below
4. Replace placeholder IDs with actual IDs from your database

---

## 1. Cooked Endpoints

### GET /api/cooked

**Method:** GET  
**Description:** Get all cooked items

**Request:**

-   No body required
-   No parameters

**Expected Response (200):**

```json
[
    {
        "id": 1,
        "recipeId": 5,
        "currentStock": 10
    }
]
```

**Test Cases:**

-   [x] Success: Returns array of cooked items
-   [x] Empty: Returns empty array if no items exist

---

### POST /api/cooked

**Method:** POST  
**Description:** Create a new cooked item

**Request Body:**

```json
{
    "recipeId": 1,
    "currentStock": 5
}
```

**Expected Response (201):**

```json
{
    "id": 1,
    "recipeId": 1,
    "currentStock": 5
}
```

**Test Cases:**

-   [X] Success: Creates cooked item with valid data
-   [X] Validation: Missing `recipeId` → 400
-   [X] Validation: Missing `currentStock` → 400
-   [ ] Validation: Invalid `recipeId` (non-existent) → 500 (foreign key error)

---

### GET /api/cooked/[id]

**Method:** GET  
**Description:** Get cooked item by ID

**Path Parameters:**

-   `id`: integer (e.g., `1`)

**Example URL:** `http://localhost:3000/api/cooked/1`

**Expected Response (200):**

```json
[
    {
        "id": 1,
        "recipeId": 5,
        "currentStock": 10
    }
]
```

**Test Cases:**

-   [ ] Success: Returns cooked item with valid ID
-   [ ] Invalid ID: Non-numeric ID → 400
-   [ ] Not Found: Valid format but non-existent ID → 200 (empty array) - should be 404

---

### PUT /api/cooked/[id]

**Method:** PUT  
**Description:** Update a cooked item

**Path Parameters:**

-   `id`: integer (e.g., `1`)

**Request Body:**

```json
{
    "recipeId": 2,
    "currentStock": 15
}
```

**Expected Response (200):**

```json
{
    "id": 1,
    "recipeId": 2,
    "currentStock": 15
}
```

**Test Cases:**

-   [ ] Success: Updates cooked item with valid data
-   [ ] Invalid ID: Non-numeric ID → 400
-   [ ] Not Found: Valid format but non-existent ID → 200 (should be 404)
-   [ ] Validation: Invalid `recipeId` → 500 (foreign key error)

---

### DELETE /api/cooked/[id]

**Method:** DELETE  
**Description:** Delete a cooked item

**Path Parameters:**

-   `id`: integer (e.g., `1`)

**Example URL:** `http://localhost:3000/api/cooked/1`

**Expected Response (200):**

```json
{
    "message": "Cooked item deleted successfully"
}
```

**Test Cases:**

-   [ ] Success: Deletes cooked item with valid ID
-   [ ] Invalid ID: Non-numeric ID → 400
-   [ ] Not Found: Valid format but non-existent ID → 200 (should be 404)

---

### POST /api/cooked/cook/[id]

**Method:** POST  
**Description:** Cook a recipe (consumes inventory and creates/updates cooked item)

**Path Parameters:**

-   `id`: integer (recipe ID, e.g., `1`)

**Example URL:** `http://localhost:3000/api/cooked/cook/1`

**Request:**

-   No body required

**Expected Response (200):**

```json
{
    "id": 1,
    "recipeId": 1,
    "currentStock": 1
}
```

**Test Cases:**

-   [ ] Success: Cooks recipe with sufficient inventory
-   [ ] Invalid ID: Non-numeric ID → 400
-   [ ] Not Found: Recipe doesn't exist → 500 (error message)
-   [ ] Insufficient Inventory: Not enough inventory items → 500 (error message)

---

## 2. Inventory Endpoints

### GET /api/inventory

**Method:** GET  
**Description:** Get all inventory items

**Request:**

-   No body required
-   No parameters

**Expected Response (200):**

```json
[
    {
        "id": 1,
        "name": "Chicken Breast",
        "batchPurchaseCost": 25.5,
        "currentStock": 100,
        "estimatedUsedPerDay": 20
    }
]
```

**Test Cases:**

-   [ ] Success: Returns array of inventory items
-   [ ] Empty: Returns empty array if no items exist

---

### POST /api/inventory

**Method:** POST  
**Description:** Create a new inventory item

**Request Body:**

```json
{
    "name": "Ground Beef",
    "batchPurchaseCost": 30.0,
    "currentStock": 50,
    "estimatedUsedPerDay": 15
}
```

**Expected Response (201):**

```json
{
    "id": 1,
    "name": "Ground Beef",
    "batchPurchaseCost": 30.0,
    "currentStock": 50,
    "estimatedUsedPerDay": 15
}
```

**Test Cases:**

-   [ ] Success: Creates inventory item with valid data
-   [ ] Validation: Missing `name` → 400
-   [ ] Validation: Missing `batchPurchaseCost` → 400
-   [ ] Validation: Missing `currentStock` → 400
-   [ ] Validation: Missing `estimatedUsedPerDay` → 400
-   [ ] Validation: Invalid types (string for number) → 500

---

### GET /api/inventory/[id]

**Method:** GET  
**Description:** Get inventory item by ID

**Path Parameters:**

-   `id`: integer (e.g., `1`)

**Example URL:** `http://localhost:3000/api/inventory/1`

**Expected Response (200):**

```json
[
    {
        "id": 1,
        "name": "Chicken Breast",
        "batchPurchaseCost": 25.5,
        "currentStock": 100,
        "estimatedUsedPerDay": 20
    }
]
```

**Test Cases:**

-   [ ] Success: Returns inventory item with valid ID
-   [ ] Invalid ID: Non-numeric ID → 400
-   [ ] Not Found: Valid format but non-existent ID → 200 (empty array) - should be 404

---

### PUT /api/inventory/[id]

**Method:** PUT  
**Description:** Update an inventory item

**Path Parameters:**

-   `id`: integer (e.g., `1`)

**Request Body:**

```json
{
    "name": "Premium Chicken Breast",
    "batchPurchaseCost": 35.0,
    "currentStock": 75,
    "estimatedUsedPerDay": 25
}
```

**Expected Response (200):**

```json
{
    "id": 1,
    "name": "Premium Chicken Breast",
    "batchPurchaseCost": 35.0,
    "currentStock": 75,
    "estimatedUsedPerDay": 25
}
```

**Test Cases:**

-   [ ] Success: Updates inventory item with valid data
-   [ ] Invalid ID: Non-numeric ID → 400
-   [ ] Not Found: Valid format but non-existent ID → 200 (should be 404)
-   [ ] Partial Update: Only update some fields → 200

---

### DELETE /api/inventory/[id]

**Method:** DELETE  
**Description:** Delete an inventory item

**Path Parameters:**

-   `id`: integer (e.g., `1`)

**Example URL:** `http://localhost:3000/api/inventory/1`

**Expected Response (200):**

```json
{
    "message": "Inventory item deleted successfully"
}
```

**Test Cases:**

-   [ ] Success: Deletes inventory item with valid ID
-   [ ] Invalid ID: Non-numeric ID → 400
-   [ ] Not Found: Valid format but non-existent ID → 200 (should be 404)
-   [ ] Foreign Key: Item referenced in inv-rec-junc → 500 (constraint error)

---

## 3. Inventory-Recipe Junction Endpoints

### GET /api/inv-rec-junc

**Method:** GET  
**Description:** Get all inventory-recipe junctions

**Request:**

-   No body required
-   No parameters

**Expected Response (200):**

```json
[
    {
        "id": 1,
        "inventoryId": 1,
        "recipeId": 5,
        "inventoryQuantity": 2
    }
]
```

**Test Cases:**

-   [ ] Success: Returns array of junctions
-   [ ] Empty: Returns empty array if no junctions exist

---

### POST /api/inv-rec-junc

**Method:** POST  
**Description:** Create a new inventory-recipe junction

**Request Body:**

```json
{
    "inventoryId": 1,
    "recipeId": 5,
    "inventoryQuantity": 3
}
```

**Expected Response (201):**

```json
{
    "id": 1,
    "inventoryId": 1,
    "recipeId": 5,
    "inventoryQuantity": 3
}
```

**Test Cases:**

-   [ ] Success: Creates junction with valid data
-   [ ] Validation: Missing `inventoryId` → 400
-   [ ] Validation: Missing `recipeId` → 400
-   [ ] Validation: Missing `inventoryQuantity` → 400
-   [ ] Foreign Key: Invalid `inventoryId` → 500
-   [ ] Foreign Key: Invalid `recipeId` → 500

---

### GET /api/inv-rec-junc/[id]

**Method:** GET  
**Description:** Get inventory-recipe junction by ID

**Path Parameters:**

-   `id`: integer (e.g., `1`)

**Example URL:** `http://localhost:3000/api/inv-rec-junc/1`

**Expected Response (200):**

```json
[
    {
        "id": 1,
        "inventoryId": 1,
        "recipeId": 5,
        "inventoryQuantity": 2
    }
]
```

**Test Cases:**

-   [ ] Success: Returns junction with valid ID
-   [ ] Invalid ID: Non-numeric ID → 400
-   [ ] Not Found: Valid format but non-existent ID → 200 (empty array) - should be 404

---

### PUT /api/inv-rec-junc/[id]

**Method:** PUT  
**Description:** Update an inventory-recipe junction

**Path Parameters:**

-   `id`: integer (e.g., `1`)

**Request Body:**

```json
{
    "inventoryId": 2,
    "recipeId": 6,
    "inventoryQuantity": 5
}
```

**Expected Response (200):**

```json
{
    "id": 1,
    "inventoryId": 2,
    "recipeId": 6,
    "inventoryQuantity": 5
}
```

**Test Cases:**

-   [ ] Success: Updates junction with valid data
-   [ ] Invalid ID: Non-numeric ID → 400
-   [ ] Not Found: Valid format but non-existent ID → 200 (should be 404)
-   [ ] Foreign Key: Invalid `inventoryId` → 500
-   [ ] Foreign Key: Invalid `recipeId` → 500

---

### DELETE /api/inv-rec-junc/[id]

**Method:** DELETE  
**Description:** Delete an inventory-recipe junction

**Path Parameters:**

-   `id`: integer (e.g., `1`)

**Example URL:** `http://localhost:3000/api/inv-rec-junc/1`

**Expected Response (200):**

```json
{
    "message": "Inventory-recipe junction deleted successfully"
}
```

**Test Cases:**

-   [ ] Success: Deletes junction with valid ID
-   [ ] Invalid ID: Non-numeric ID → 400
-   [ ] Not Found: Valid format but non-existent ID → 200 (should be 404)

---

## 4. Meal Types Endpoints

### GET /api/mealtypes

**Method:** GET  
**Description:** Get all meal types

**Request:**

-   No body required
-   No parameters

**Expected Response (200):**

```json
[
    {
        "name": "Kids Meal",
        "sides": 1,
        "entrees": 1,
        "drinks": 1,
        "price": 8.99,
        "image": "/images/kids-meal.png"
    }
]
```

**Test Cases:**

-   [ ] Success: Returns array of meal types
-   [ ] Empty: Returns empty array if no meal types exist

---

### POST /api/mealtypes

**Method:** POST  
**Description:** Create a new meal type

**Request Body:**

```json
{
    "name": "Combo Meal",
    "sides": 2,
    "entrees": 1,
    "drinks": 1,
    "price": 12.99,
    "image": "/images/combo-meal.png"
}
```

**Expected Response (201):**

```json
{
    "name": "Combo Meal",
    "sides": 2,
    "entrees": 1,
    "drinks": 1,
    "price": 12.99,
    "image": "/images/combo-meal.png"
}
```

**Test Cases:**

-   [ ] Success: Creates meal type with valid data
-   [ ] Validation: Missing `name` → 400
-   [ ] Validation: Missing `sides` → 400
-   [ ] Validation: Missing `entrees` → 400
-   [ ] Validation: Missing `drinks` → 400
-   [ ] Validation: Missing `price` → 400
-   [ ] Validation: Invalid types → 500

---

### GET /api/mealtypes/[name]

**Method:** GET  
**Description:** Get meal type by name

**Path Parameters:**

-   `name`: string (e.g., `Kids Meal`)

**Example URL:** `http://localhost:3000/api/mealtypes/Kids%20Meal`

**Note:** URL encode the name if it contains spaces

**Expected Response (200):**

```json
[
    {
        "name": "Kids Meal",
        "sides": 1,
        "entrees": 1,
        "drinks": 1,
        "price": 8.99,
        "image": "/images/kids-meal.png"
    }
]
```

**Test Cases:**

-   [ ] Success: Returns meal type with valid name
-   [ ] Invalid Name: Empty name → 400
-   [ ] Not Found: Valid format but non-existent name → 200 (empty array) - should be 404

---

### PUT /api/mealtypes/[name]

**Method:** PUT  
**Description:** Update a meal type

**Path Parameters:**

-   `name`: string (e.g., `Kids Meal`)

**Request Body:**

```json
{
    "sides": 2,
    "entrees": 1,
    "drinks": 1,
    "price": 9.99,
    "image": "/images/kids-meal-v2.png"
}
```

**Expected Response (200):**

```json
{
    "name": "Kids Meal",
    "sides": 2,
    "entrees": 1,
    "drinks": 1,
    "price": 9.99,
    "image": "/images/kids-meal-v2.png"
}
```

**Test Cases:**

-   [ ] Success: Updates meal type with valid data
-   [ ] Invalid Name: Empty name → 400
-   [ ] Not Found: Valid format but non-existent name → 200 (should be 404)
-   [ ] Partial Update: Only update some fields → 200

---

### DELETE /api/mealtypes/[name]

**Method:** DELETE  
**Description:** Delete a meal type

**Path Parameters:**

-   `name`: string (e.g., `Kids Meal`)

**Example URL:** `http://localhost:3000/api/mealtypes/Kids%20Meal`

**Expected Response (200):**

```json
{
    "message": "Meal type deleted successfully"
}
```

**Test Cases:**

-   [ ] Success: Deletes meal type with valid name
-   [ ] Invalid Name: Empty name → 400
-   [ ] Not Found: Valid format but non-existent name → 200 (should be 404)

---

## 5. Orders Endpoints

### GET /api/orders

**Method:** GET  
**Description:** Get all orders

**Request:**

-   No body required
-   No parameters

**Expected Response (200):**

```json
[
    {
        "id": 1,
        "tax": 1.5,
        "totalCost": 11.49,
        "orderTime": "2024-01-15T10:30:00Z",
        "cashierId": 1,
        "orderInfo": {
            "meals": [
                {
                    "mealType": "Kids Meal",
                    "mealTypeId": "Kids Meal",
                    "quantity": 1,
                    "price": 8.99,
                    "selections": {
                        "entrees": [
                            { "recipeId": 5, "recipeName": "Chicken Nuggets" }
                        ],
                        "sides": [
                            { "recipeId": 12, "recipeName": "French Fries" }
                        ],
                        "drinks": [
                            { "recipeId": 20, "recipeName": "Apple Juice" }
                        ]
                    }
                }
            ],
            "individualItems": []
        },
        "isCompleted": false
    }
]
```

**Test Cases:**

-   [ ] Success: Returns array of orders
-   [ ] Empty: Returns empty array if no orders exist

---

### POST /api/orders

**Method:** POST  
**Description:** Create a new order

**Request Body:**

```json
{
    "tax": 1.5,
    "totalCost": 11.49,
    "orderTime": "2024-01-15T10:30:00Z",
    "cashierId": 1,
    "isCompleted": false,
    "orderInfo": {
        "meals": [
            {
                "mealType": "Kids Meal",
                "mealTypeId": "Kids Meal",
                "quantity": 1,
                "price": 8.99,
                "selections": {
                    "entrees": [
                        { "recipeId": 5, "recipeName": "Chicken Nuggets" }
                    ],
                    "sides": [{ "recipeId": 12, "recipeName": "French Fries" }],
                    "drinks": [{ "recipeId": 20, "recipeName": "Apple Juice" }]
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
            }
        ]
    }
}
```

**Simplified Request Body (minimal required fields):**

```json
{
    "tax": 1.5,
    "totalCost": 11.49,
    "orderTime": "2024-01-15T10:30:00Z",
    "cashierId": 1
}
```

**Expected Response (201):**

```json
{
  "id": 1,
  "tax": 1.50,
  "totalCost": 11.49,
  "orderTime": "2024-01-15T10:30:00Z",
  "cashierId": 1,
  "orderInfo": {...},
  "isCompleted": false
}
```

**Test Cases:**

-   [ ] Success: Creates order with valid data
-   [ ] Validation: Missing `tax` → 400
-   [ ] Validation: Missing `totalCost` → 400
-   [ ] Validation: Missing `orderTime` → 400
-   [ ] Validation: Missing `cashierId` → 400
-   [ ] Foreign Key: Invalid `cashierId` → 500
-   [ ] Invalid JSON: Malformed JSON in `orderInfo` → 500

---

### GET /api/orders/incomplete

**Method:** GET  
**Description:** Get all incomplete orders

**Request:**

-   No body required
-   No parameters

**Expected Response (200):**

```json
[
  {
    "id": 1,
    "tax": 1.50,
    "totalCost": 11.49,
    "orderTime": "2024-01-15T10:30:00Z",
    "cashierId": 1,
    "orderInfo": {...},
    "isCompleted": false
  }
]
```

**Test Cases:**

-   [ ] Success: Returns array of incomplete orders
-   [ ] Empty: Returns empty array if no incomplete orders exist

---

### GET /api/orders/[id]

**Method:** GET  
**Description:** Get order by ID

**Path Parameters:**

-   `id`: integer (e.g., `1`)

**Example URL:** `http://localhost:3000/api/orders/1`

**Expected Response (200):**

```json
[
  {
    "id": 1,
    "tax": 1.50,
    "totalCost": 11.49,
    "orderTime": "2024-01-15T10:30:00Z",
    "cashierId": 1,
    "orderInfo": {...},
    "isCompleted": false
  }
]
```

**Test Cases:**

-   [ ] Success: Returns order with valid ID
-   [ ] Invalid ID: Non-numeric ID → 400
-   [ ] Not Found: Valid format but non-existent ID → 200 (empty array) - should be 404

---

### PUT /api/orders/[id]

**Method:** PUT  
**Description:** Update an order

**Path Parameters:**

-   `id`: integer (e.g., `1`)

**Request Body:**

```json
{
    "tax": 2.0,
    "totalCost": 12.99,
    "isCompleted": true
}
```

**Expected Response (200):**

```json
{
  "id": 1,
  "tax": 2.00,
  "totalCost": 12.99,
  "orderTime": "2024-01-15T10:30:00Z",
  "cashierId": 1,
  "orderInfo": {...},
  "isCompleted": true
}
```

**Test Cases:**

-   [ ] Success: Updates order with valid data
-   [ ] Invalid ID: Non-numeric ID → 400
-   [ ] Not Found: Valid format but non-existent ID → 200 (should be 404)
-   [ ] Partial Update: Only update some fields → 200

---

### DELETE /api/orders/[id]

**Method:** DELETE  
**Description:** Delete an order

**Path Parameters:**

-   `id`: integer (e.g., `1`)

**Example URL:** `http://localhost:3000/api/orders/1`

**Expected Response (200):**

```json
{
    "message": "Order deleted successfully"
}
```

**Test Cases:**

-   [ ] Success: Deletes order with valid ID
-   [ ] Invalid ID: Non-numeric ID → 400
-   [ ] Not Found: Valid format but non-existent ID → 200 (should be 404)
-   [ ] Foreign Key: Order referenced in rec-order-junc → 500 (constraint error)

---

## 6. Recipes Endpoints

### GET /api/recipes

**Method:** GET  
**Description:** Get all recipes

**Request:**

-   No body required
-   No parameters

**Expected Response (200):**

```json
[
    {
        "id": 1,
        "name": "Chicken Nuggets",
        "image": "/images/chicken-nuggets.png",
        "pricePerServing": 4.99,
        "ordersPerBatch": 10,
        "type": "Entree"
    }
]
```

**Test Cases:**

-   [ ] Success: Returns array of recipes
-   [ ] Empty: Returns empty array if no recipes exist

---

### POST /api/recipes

**Method:** POST  
**Description:** Create a new recipe

**Request Body:**

```json
{
    "name": "Caesar Salad",
    "image": "/images/caesar-salad.png",
    "pricePerServing": 5.99,
    "ordersPerBatch": 5,
    "type": "Side"
}
```

**Expected Response (201):**

```json
{
    "id": 1,
    "name": "Caesar Salad",
    "image": "/images/caesar-salad.png",
    "pricePerServing": 5.99,
    "ordersPerBatch": 5,
    "type": "Side"
}
```

**Test Cases:**

-   [ ] Success: Creates recipe with valid data
-   [ ] Validation: Missing `name` → 400
-   [ ] Validation: Missing `pricePerServing` → 400
-   [ ] Validation: Missing `ordersPerBatch` → 400
-   [ ] Validation: Invalid `type` (not "Side", "Entree", or "Drink") → 500
-   [ ] Optional Fields: `image` can be omitted → 201

---

### GET /api/recipes/[id]

**Method:** GET  
**Description:** Get recipe by ID

**Path Parameters:**

-   `id`: integer (e.g., `1`)

**Example URL:** `http://localhost:3000/api/recipes/1`

**Expected Response (200):**

```json
[
    {
        "id": 1,
        "name": "Chicken Nuggets",
        "image": "/images/chicken-nuggets.png",
        "pricePerServing": 4.99,
        "ordersPerBatch": 10,
        "type": "Entree"
    }
]
```

**Test Cases:**

-   [ ] Success: Returns recipe with valid ID
-   [ ] Invalid ID: Non-numeric ID → 400
-   [ ] Not Found: Valid format but non-existent ID → 200 (empty array) - should be 404

---

### PUT /api/recipes/[id]

**Method:** PUT  
**Description:** Update a recipe

**Path Parameters:**

-   `id`: integer (e.g., `1`)

**Request Body:**

```json
{
    "name": "Premium Chicken Nuggets",
    "pricePerServing": 6.99,
    "ordersPerBatch": 12
}
```

**Expected Response (200):**

```json
{
    "id": 1,
    "name": "Premium Chicken Nuggets",
    "image": "/images/chicken-nuggets.png",
    "pricePerServing": 6.99,
    "ordersPerBatch": 12,
    "type": "Entree"
}
```

**Test Cases:**

-   [ ] Success: Updates recipe with valid data
-   [ ] Invalid ID: Non-numeric ID → 400
-   [ ] Not Found: Valid format but non-existent ID → 200 (should be 404)
-   [ ] Partial Update: Only update some fields → 200

---

### DELETE /api/recipes/[id]

**Method:** DELETE  
**Description:** Delete a recipe

**Path Parameters:**

-   `id`: integer (e.g., `1`)

**Example URL:** `http://localhost:3000/api/recipes/1`

**Expected Response (200):**

```json
{
    "message": "Recipe deleted successfully"
}
```

**Test Cases:**

-   [ ] Success: Deletes recipe with valid ID
-   [ ] Invalid ID: Non-numeric ID → 400
-   [ ] Not Found: Valid format but non-existent ID → 200 (should be 404)
-   [ ] Foreign Key: Recipe referenced in inv-rec-junc or rec-order-junc → 500 (constraint error)

---

## 7. Recipe-Order Junction Endpoints

### GET /api/rec-order-junc

**Method:** GET  
**Description:** Get all recipe-order junctions

**Request:**

-   No body required
-   No parameters

**Expected Response (200):**

```json
[
    {
        "id": 1,
        "recipeId": 5,
        "orderId": 1,
        "quantity": 2
    }
]
```

**Test Cases:**

-   [ ] Success: Returns array of junctions
-   [ ] Empty: Returns empty array if no junctions exist

---

### POST /api/rec-order-junc

**Method:** POST  
**Description:** Create a new recipe-order junction

**Request Body:**

```json
{
    "recipeId": 5,
    "orderId": 1,
    "quantity": 3
}
```

**Expected Response (201):**

```json
{
    "id": 1,
    "recipeId": 5,
    "orderId": 1,
    "quantity": 3
}
```

**Test Cases:**

-   [ ] Success: Creates junction with valid data
-   [ ] Validation: Missing `recipeId` → 400
-   [ ] Validation: Missing `orderId` → 400
-   [ ] Validation: Missing `quantity` → 400
-   [ ] Foreign Key: Invalid `recipeId` → 500
-   [ ] Foreign Key: Invalid `orderId` → 500

---

### GET /api/rec-order-junc/[id]

**Method:** GET  
**Description:** Get recipe-order junction by ID

**Path Parameters:**

-   `id`: integer (e.g., `1`)

**Example URL:** `http://localhost:3000/api/rec-order-junc/1`

**Expected Response (200):**

```json
[
    {
        "id": 1,
        "recipeId": 5,
        "orderId": 1,
        "quantity": 2
    }
]
```

**Test Cases:**

-   [ ] Success: Returns junction with valid ID
-   [ ] Invalid ID: Non-numeric ID → 400
-   [ ] Not Found: Valid format but non-existent ID → 200 (empty array) - should be 404

---

### PUT /api/rec-order-junc/[id]

**Method:** PUT  
**Description:** Update a recipe-order junction

**Path Parameters:**

-   `id`: integer (e.g., `1`)

**Request Body:**

```json
{
    "recipeId": 6,
    "orderId": 2,
    "quantity": 5
}
```

**Expected Response (200):**

```json
{
    "id": 1,
    "recipeId": 6,
    "orderId": 2,
    "quantity": 5
}
```

**Test Cases:**

-   [ ] Success: Updates junction with valid data
-   [ ] Invalid ID: Non-numeric ID → 400
-   [ ] Not Found: Valid format but non-existent ID → 200 (should be 404)
-   [ ] Foreign Key: Invalid `recipeId` → 500
-   [ ] Foreign Key: Invalid `orderId` → 500

---

### DELETE /api/rec-order-junc/[id]

**Method:** DELETE  
**Description:** Delete a recipe-order junction

**Path Parameters:**

-   `id`: integer (e.g., `1`)

**Example URL:** `http://localhost:3000/api/rec-order-junc/1`

**Expected Response (200):**

```json
{
    "message": "Recipe-order junction deleted successfully"
}
```

**Test Cases:**

-   [ ] Success: Deletes junction with valid ID
-   [ ] Invalid ID: Non-numeric ID → 400
-   [ ] Not Found: Valid format but non-existent ID → 200 (should be 404)

---

## 8. Roles Endpoints

### GET /api/roles

**Method:** GET  
**Description:** Get all roles

**Request:**

-   No body required
-   No parameters

**Expected Response (200):**

```json
[
    {
        "id": 1,
        "name": "Manager",
        "canDiscount": true,
        "canRestock": true,
        "canEditEmployees": true
    }
]
```

**Test Cases:**

-   [ ] Success: Returns array of roles
-   [ ] Empty: Returns empty array if no roles exist

---

### POST /api/roles

**Method:** POST  
**Description:** Create a new role

**Request Body:**

```json
{
    "name": "Cashier",
    "canDiscount": false,
    "canRestock": false,
    "canEditEmployees": false
}
```

**Expected Response (201):**

```json
{
    "id": 1,
    "name": "Cashier",
    "canDiscount": false,
    "canRestock": false,
    "canEditEmployees": false
}
```

**Test Cases:**

-   [ ] Success: Creates role with valid data
-   [ ] Validation: Missing `name` → 400
-   [ ] Validation: Missing `canDiscount` → 400
-   [ ] Validation: Missing `canRestock` → 400
-   [ ] Validation: Missing `canEditEmployees` → 400
-   [ ] Validation: Invalid types (string for boolean) → 500

---

### GET /api/roles/[id]

**Method:** GET  
**Description:** Get role by ID

**Path Parameters:**

-   `id`: integer (e.g., `1`)

**Example URL:** `http://localhost:3000/api/roles/1`

**Expected Response (200):**

```json
[
    {
        "id": 1,
        "name": "Manager",
        "canDiscount": true,
        "canRestock": true,
        "canEditEmployees": true
    }
]
```

**Test Cases:**

-   [ ] Success: Returns role with valid ID
-   [ ] Invalid ID: Non-numeric ID → 400
-   [ ] Not Found: Valid format but non-existent ID → 200 (empty array) - should be 404

---

### PUT /api/roles/[id]

**Method:** PUT  
**Description:** Update a role

**Path Parameters:**

-   `id`: integer (e.g., `1`)

**Request Body:**

```json
{
    "name": "Senior Manager",
    "canDiscount": true,
    "canRestock": true,
    "canEditEmployees": true
}
```

**Expected Response (200):**

```json
{
    "id": 1,
    "name": "Senior Manager",
    "canDiscount": true,
    "canRestock": true,
    "canEditEmployees": true
}
```

**Test Cases:**

-   [ ] Success: Updates role with valid data
-   [ ] Invalid ID: Non-numeric ID → 400
-   [ ] Not Found: Valid format but non-existent ID → 200 (should be 404)
-   [ ] Partial Update: Only update some fields → 200

---

### DELETE /api/roles/[id]

**Method:** DELETE  
**Description:** Delete a role

**Path Parameters:**

-   `id`: integer (e.g., `1`)

**Example URL:** `http://localhost:3000/api/roles/1`

**Expected Response (200):**

```json
{
    "message": "Role deleted successfully"
}
```

**Test Cases:**

-   [ ] Success: Deletes role with valid ID
-   [ ] Invalid ID: Non-numeric ID → 400
-   [ ] Not Found: Valid format but non-existent ID → 200 (should be 404)
-   [ ] Foreign Key: Role referenced in employees → 500 (constraint error)

---

## Testing Checklist Summary

### General Test Scenarios for All Endpoints

1. **Success Cases:**

    - [ ] Valid request with correct data
    - [ ] GET requests return data
    - [ ] POST requests create resources
    - [ ] PUT requests update resources
    - [ ] DELETE requests remove resources

2. **Validation Errors (400):**

    - [ ] Missing required fields
    - [ ] Invalid data types
    - [ ] Invalid ID format (non-numeric for ID endpoints)
    - [ ] Empty required string fields

3. **Not Found Errors (404):**

    - [ ] Valid format but non-existent resource (currently returns 200 with empty array - should be fixed)

4. **Server Errors (500):**

    - [ ] Database constraint violations (foreign keys)
    - [ ] Database connection errors
    - [ ] Malformed JSON in request body
    - [ ] Invalid enum values

5. **Edge Cases:**
    - [ ] Empty arrays for GET all endpoints
    - [ ] Partial updates (PUT with only some fields)
    - [ ] URL encoding for path parameters with spaces
    - [ ] Large request bodies
    - [ ] Special characters in string fields

---

## Postman Collection Setup Tips

1. **Environment Variables:**

    - Create a Postman environment with `base_url` = `http://localhost:3000`
    - Use `{{base_url}}` in your requests

2. **Test Scripts:**

    - Add assertions to check status codes
    - Validate response structure
    - Save IDs from POST requests for use in subsequent requests

3. **Pre-request Scripts:**

    - Generate timestamps for `orderTime` fields
    - Set dynamic values based on previous responses

4. **Organize by Resource:**
    - Create folders for each resource type
    - Order requests: GET all → POST → GET by ID → PUT → DELETE

---

## Notes

-   All endpoints return JSON responses
-   Status codes: 200 (success), 201 (created), 400 (bad request), 404 (not found), 500 (server error)
-   Path parameters should be URL-encoded if they contain special characters
-   Foreign key relationships must exist before creating junction records
-   Some endpoints currently return 200 with empty arrays instead of 404 for not found - this should be improved in error handling updates
