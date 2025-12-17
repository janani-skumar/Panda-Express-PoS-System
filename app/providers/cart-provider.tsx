"use client"

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo, ReactNode } from "react";
import { MealOrder, IndividualItem } from "@/lib/types";
import { toast } from "sonner";
import { APP_CONFIG } from "@/lib/config";

interface CartContextType {
  meals: MealOrder[];
  individualItems: IndividualItem[];
  addMeal: (meal: MealOrder) => boolean;
  addIndividualItem: (item: IndividualItem) => boolean;
  removeMeal: (index: number) => void;
  removeIndividualItem: (index: number) => void;
  clearCart: () => void;
  totalItemCount: number;
  isAtLimit: boolean;
  canAddItems: (quantity: number) => boolean;
  maxItems: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = "cart_state";

export function CartProvider({ children }: { children: ReactNode }) {
  const [meals, setMeals] = useState<MealOrder[]>([]);
  const [individualItems, setIndividualItems] = useState<IndividualItem[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);

  // Load cart from localStorage on mount
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem(CART_STORAGE_KEY);
      if (savedCart) {
        const parsed = JSON.parse(savedCart);
        setMeals(parsed.meals || []);
        setIndividualItems(parsed.individualItems || []);
      }
    } catch (error) {
      console.error("Failed to load cart from localStorage:", error);
    } finally {
      setIsInitialized(true);
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    if (isInitialized) {
      try {
        localStorage.setItem(
          CART_STORAGE_KEY,
          JSON.stringify({ meals, individualItems })
        );
      } catch (error) {
        console.error("Failed to save cart to localStorage:", error);
      }
    }
  }, [meals, individualItems, isInitialized]);

  // Calculate total item count
  const totalItemCount = useMemo(() => {
    const mealsCount = meals.reduce((sum, meal) => sum + meal.quantity, 0);
    const itemsCount = individualItems.reduce((sum, item) => sum + item.quantity, 0);
    return mealsCount + itemsCount;
  }, [meals, individualItems]);

  // Check if cart is at the limit
  const isAtLimit = useMemo(() => {
    return totalItemCount >= APP_CONFIG.KIOSK_MAX_ITEMS;
  }, [totalItemCount]);

  // Check if a quantity can be added
  const canAddItems = useCallback((quantity: number) => {
    return totalItemCount + quantity <= APP_CONFIG.KIOSK_MAX_ITEMS;
  }, [totalItemCount]);

  const addMeal = useCallback((meal: MealOrder): boolean => {
    if (!canAddItems(meal.quantity)) {
      toast.error(`Cannot add ${meal.quantity} item(s). Maximum ${APP_CONFIG.KIOSK_MAX_ITEMS} items allowed per order.`);
      return false;
    }
    setMeals((prev) => [...prev, meal]);
    return true;
  }, [canAddItems]);

  const addIndividualItem = useCallback((item: IndividualItem): boolean => {
    if (!canAddItems(item.quantity)) {
      toast.error(`Cannot add ${item.quantity} item(s). Maximum ${APP_CONFIG.KIOSK_MAX_ITEMS} items allowed per order.`);
      return false;
    }
    setIndividualItems((prev) => [...prev, item]);
    return true;
  }, [canAddItems]);

  const removeMeal = useCallback((index: number) => {
    setMeals((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const removeIndividualItem = useCallback((index: number) => {
    setIndividualItems((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const clearCart = useCallback(() => {
    setMeals([]);
    setIndividualItems([]);
    localStorage.removeItem(CART_STORAGE_KEY);
  }, []);

  return (
    <CartContext.Provider
      value={{
        meals,
        individualItems,
        addMeal,
        addIndividualItem,
        removeMeal,
        removeIndividualItem,
        clearCart,
        totalItemCount,
        isAtLimit,
        canAddItems,
        maxItems: APP_CONFIG.KIOSK_MAX_ITEMS,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}

