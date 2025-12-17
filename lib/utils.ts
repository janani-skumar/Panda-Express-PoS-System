import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { OrderInfo, RecipeQuantityMap, RecipeSelection } from "./types";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

export function extractRecipeQuantities(order: OrderInfo): RecipeQuantityMap {
    const result: RecipeQuantityMap = {};

    // Process meals
    for (const meal of order.meals) {
        const { quantity, selections } = meal;

        // Helper to add all recipes from a selection array
        const addRecipes = (recipes: RecipeSelection[]) => {
            for (const { recipeId } of recipes) {
                result[recipeId] = (result[recipeId] || 0) + quantity;
            }
        };

        addRecipes(selections.entrees);
        addRecipes(selections.sides);
        addRecipes(selections.drinks);
    }

    // Process individual items
    for (const item of order.individualItems) {
        result[item.recipeId] = (result[item.recipeId] || 0) + item.quantity;
    }

    return result;
}

/**
 * Returns today's date in YYYY-MM-DD format using Chicago timezone
 * Use this for HTML date inputs and date-based queries
 */
export function getTodayDateCST(): string {
    const now = new Date();
    const year = now.toLocaleString("en-US", { timeZone: "America/Chicago", year: "numeric" });
    const month = now.toLocaleString("en-US", { timeZone: "America/Chicago", month: "2-digit" });
    const day = now.toLocaleString("en-US", { timeZone: "America/Chicago", day: "2-digit" });
    return `${year}-${month}-${day}`;
}

/**
 * Returns the current timestamp in Chicago timezone formatted as an ISO-like string
 * Use this for timestamps stored in the database
 * Note: No 'Z' suffix since the time values are in CST, not UTC
 */
export function getCSTTimestamp(): string {
    const now = new Date();
    // Get Chicago time components
    const options: Intl.DateTimeFormatOptions = {
        timeZone: "America/Chicago",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
    };
    const parts = new Intl.DateTimeFormat("en-US", options).formatToParts(now);
    const get = (type: string) => parts.find(p => p.type === type)?.value || "00";

    // Don't append 'Z' - these are CST time values, not UTC
    return `${get("year")}-${get("month")}-${get("day")}T${get("hour")}:${get("minute")}:${get("second")}`;
}

/**
 * Generic sorting function for table data
 * Handles strings (alphabetical), numbers, booleans, and null/undefined values
 */
export function sortData<T>(
    data: T[],
    column: keyof T,
    direction: "asc" | "desc"
): T[] {
    return [...data].sort((a, b) => {
        let aVal = a[column];
        let bVal = b[column];

        // Handle null/undefined - treat as empty/lowest value
        if (aVal == null && bVal == null) return 0;
        if (aVal == null) return direction === "asc" ? -1 : 1;
        if (bVal == null) return direction === "asc" ? 1 : -1;

        // Handle different types
        if (typeof aVal === "string" && typeof bVal === "string") {
            // Case-insensitive string comparison
            const comparison = aVal.toLowerCase().localeCompare(bVal.toLowerCase());
            return direction === "asc" ? comparison : -comparison;
        }

        if (typeof aVal === "number" && typeof bVal === "number") {
            return direction === "asc" ? aVal - bVal : bVal - aVal;
        }

        if (typeof aVal === "boolean" && typeof bVal === "boolean") {
            // false < true
            const comparison = Number(aVal) - Number(bVal);
            return direction === "asc" ? comparison : -comparison;
        }

        // Fallback: convert to string and compare
        const aStr = String(aVal).toLowerCase();
        const bStr = String(bVal).toLowerCase();
        const comparison = aStr.localeCompare(bStr);
        return direction === "asc" ? comparison : -comparison;
    });
}