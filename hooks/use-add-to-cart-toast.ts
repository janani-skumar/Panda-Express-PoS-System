import { toast } from "sonner";
import { MealOrder, IndividualItem, OrderInfo } from "@/lib/types";

interface AddToCartOptions {
  onSuccess?: () => void;
  onLimitReached?: () => void;
  successMessage?: string;
  loadingMessage?: string;
  errorMessage?: string;
}

export function useAddToCartToast() {
  const addItemWithToast = async (
    addItem: () => boolean,
    options: AddToCartOptions = {}
  ) => {
    const {
      onSuccess,
      onLimitReached,
      successMessage = "Item has been added to cart",
    } = options;

    try {
      const success = addItem();
      if (success) {
        toast.success(successMessage);
        onSuccess?.();
      } else {
        // Limit was reached - cart provider already shows error toast
        onLimitReached?.();
      }
      return success;
    } catch (error) {
      toast.error("Failed to add item to cart");
      return false;
    }
  };

  const addMealWithToast = async (
    addMeal: () => boolean,
    options: AddToCartOptions = {}
  ) => {
    const {
      onSuccess,
      onLimitReached,
      successMessage = "Meal has been added to cart",
    } = options;

    try {
      const success = addMeal();
      if (success) {
        toast.success(successMessage);
        onSuccess?.();
      } else {
        // Limit was reached - cart provider already shows error toast
        onLimitReached?.();
      }
      return success;
    } catch (error) {
      toast.error("Failed to add meal to cart");
      return false;
    }
  };

  const addOrderInfoWithToast = async (
    orderInfo: OrderInfo,
  ) => {
    console.log(JSON.stringify(orderInfo, null, 2))
    toast.success("Order placed successfully")
  }

  return {
    addItemWithToast,
    addMealWithToast,
    addOrderInfoWithToast,
  };
}

