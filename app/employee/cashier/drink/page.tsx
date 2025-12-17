"use client";
import { useEffect, useState } from "react";

import { Recipe } from "@/lib/types";
import CashierCard from "@/app/components/app-cashier-card";
import { useCart } from "@/app/providers/cart-provider";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { useAddToCartToast } from "@/hooks/use-add-to-cart-toast";
import { Skeleton } from "@/app/components/ui/skeleton";

export default function Home() {
    const [recipes, setRecipes] = useState<Recipe[]>([]);
    const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
    const [quantity, setQuantity] = useState<number>(1);
    const [isLoading, setIsLoading] = useState(true);
    const { addIndividualItem } = useCart();
    const { addItemWithToast } = useAddToCartToast();

    // fetch recipes
    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch(`/api/recipes`);
                if (response.ok) {
                    const data = await response.json();
                    setRecipes(data);
                }
            } catch (error) {
                console.error("Failed to fetch links");
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, []);

    const handleRecipeClick = (recipe: Recipe) => {
        setSelectedRecipe(recipe);
        setQuantity(1);
    };

    const handleAddToCart = async () => {
        if (!selectedRecipe) return;

        await addItemWithToast(
            () => addIndividualItem({
                recipeId: selectedRecipe.id!,
                recipeName: selectedRecipe.name,
                recipeType: "Drink",
                quantity: quantity,
                price: selectedRecipe.pricePerServing,
            }),
            {
                onSuccess: () => {
                    setSelectedRecipe(null);
                    setQuantity(1);
                },
            }
        );
    };

  if (isLoading) {
        return (
            <div className="flex flex-col">
                <div className="h-full bg-white p-6">
                    <div className="mb-6 flex items-center justify-between">
                        <Skeleton className="h-8 w-64" />
                        <Skeleton className="h-12 w-24" />
                    </div>
                    <div className="grid sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 max-w-5xl">
                        {Array.from({ length: 5 }).map((_, i) => (
                            <Skeleton key={i} className="h-32 w-full rounded-lg" />
                        ))}
                    </div>
                </div>
            </div>
        );
    }

  return (
    <div className="flex flex-col">
      <div className="h-full bg-white p-6">
            <div className="mb-6 flex items-center justify-between">
                <h1 className="text-2xl font-bold text-neutral-900">
                    Select A Drink
                </h1>
                <a href="/employee/cashier">
                    <Button
                        variant="default"
                        className="px-6 py-3 text-lg font-bold bg-tamu-maroon hover:bg-tamu-maroon-dark text-white shadow-md rounded-md transition-colors duration-300"
                    >
                        Home
                    </Button>
                </a>
            </div>
            <div className="grid sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 max-w-5xl">
                {recipes.filter(r => r.type === "Drink").map((item, i) => (
                  <button
                    key={i}
                    onClick={() => handleRecipeClick(item)}
                    className="cursor-pointer"
                  >
                    <CashierCard name={item.name} />
                  </button>
                ))}
            </div>
        </div>
      
      {selectedRecipe && (
        <div className="fixed bottom-0 left-0 right-96 bg-neutral-100 border-t-2 border-tamu-maroon p-6 shadow-lg">
          <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div>
                <h3 className="text-xl font-bold text-neutral-900">{selectedRecipe.name}</h3>
                <p className="text-neutral-600">${selectedRecipe.pricePerServing.toFixed(2)} each</p>
              </div>
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-neutral-700">Quantity:</label>
                <Input
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-20"
                />
              </div>
            </div>
            <div className="flex gap-4 items-center">
              <p className="text-lg font-semibold text-neutral-900">
                Total: ${(selectedRecipe.pricePerServing * quantity).toFixed(2)}
              </p>
              <Button 
                onClick={handleAddToCart}
                className="bg-tamu-maroon hover:bg-tamu-maroon-dark text-white font-bold"
              >
                Add to Cart
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setSelectedRecipe(null)}
                className="border-neutral-300 text-neutral-700 hover:bg-neutral-200"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
