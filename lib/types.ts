export type Role = {
    id: number;
    name: string;
    canDiscount: boolean;
    canRestock: boolean;
    canEditEmployees: boolean;
}

export type Employee = {
    id?: number;
    name: string;
    salary: number;
    hours: number;
    password: string;
    isEmployed: boolean;
    roleId: number;
    role?: Role;
}

export type Order = {
    id: number;
    tax: number;
    totalCost: number;
    orderTime: string;
    cashierId: number;
    orderInfo?: OrderInfo;
    isCompleted: boolean;
    customerEmail?: string;
}

export type Inventory = {
    id?: number;
    name: string;
    batchPurchaseCost: number;
    currentStock: number;
    estimatedUsedPerDay: number;
}

export type Expense = {
    id: number;
    cost: number;
    itemId: number;
    expenseTime: string;
}

export type Cooked = {
    id?: number;
    recipeId: number;
    currentStock: number;
}

export type MealType = {
    typeName: string;
    sides: number;
    entrees: number;
    drinks: number;
    price: number;
    imageFilePath: string;
}

export type InvRecJunc = {
    id: number;
    inventoryId: number;
    recipeId: number;
    inventoryQuantity: number;
}

export type RecOrderJunc = {
    id: number;
    recipeId: number;
    orderId: number;
    quantity: number;
}

export type Recipe = {
    name: string;
    image: string | null;
    id?: number;
    pricePerServing: number;
    ordersPerBatch: number;
    type: RecipeType | null;
    premium: boolean;
    seasonal?: boolean;
}

export type RecipeType = "Side" | "Entree" | "Drink" | "Appetizer";

export type RecipeSelection = {
    recipeId: number;
    recipeName: string;
    premium?: boolean;
    seasonal?: boolean;
};

export type MealSelections = {
    entrees: RecipeSelection[];
    sides: RecipeSelection[];
    drinks: RecipeSelection[];
};

export type MealOrder = {
    mealType: string;
    quantity: number;
    price: number;
    selections: MealSelections;
    premiumUpcharge?: number;
};

export type IndividualItem = {
    recipeId: number;
    recipeName: string;
    recipeType: RecipeType;
    quantity: number;
    price: number;
};

export type OrderInfo = {
    meals: MealOrder[];
    individualItems: IndividualItem[];
};

export type RecipeQuantityMap = Record<number, number>;