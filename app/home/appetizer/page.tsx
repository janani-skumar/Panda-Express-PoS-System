"use client";
import { useEffect, useState } from "react";

import { Recipe } from "@/lib/types";
import MealCard from "@/app/components/app-mealcard";
import { useCart } from "@/app/providers/cart-provider";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { useAddToCartToast } from "@/hooks/use-add-to-cart-toast";
import { useAccessibilityStyles } from "@/hooks/use-accessibility-styles";

export default function Home() {
    const [recipes, setRecipes] = useState<Recipe[]>([]);
    const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
    const [quantity, setQuantity] = useState<number>(1);
    const { addIndividualItem } = useCart();
    const { addItemWithToast } = useAddToCartToast();
    const { textClasses } = useAccessibilityStyles();

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
                recipeType: "Appetizer",
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

    return (
        <div className="flex flex-col">
            <h1 className="sr-only">Appetizers</h1>
            <div className="grid grid-cols-5 gap-10 p-10 w-full mb-10">
                {recipes
                    .filter((r) => r.type === "Appetizer")
                    .map((item, i) => (
                        <button
                            key={i}
                            onClick={() => handleRecipeClick(item)}
                            className="cursor-pointer"
                        >
                            <MealCard
                                name={item.name}
                                image={item.image}
                                premium={item.premium}
                                seasonal={item.seasonal}
                            />
                        </button>
                    ))}
            </div>

            {selectedRecipe && (
                <div className="fixed bottom-20 left-0 right-0 bg-white border-t-2 border-gray-200 p-6 shadow-lg">
                    <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <div>
                                <h3 className={`text-xl font-bold ${textClasses}`}>
                                    {selectedRecipe.name}
                                </h3>
                                <p className={`text-gray-600 ${textClasses}`}>
                                    ${selectedRecipe.pricePerServing.toFixed(2)}{" "}
                                    each
                                </p>
                            </div>
                            <div className="flex items-center gap-2">
                                <label className={`text-sm font-medium ${textClasses}`}>
                                    Quantity:
                                </label>
                                <Input
                                    type="number"
                                    min="1"
                                    value={quantity}
                                    onChange={(e) =>
                                        setQuantity(
                                            Math.max(
                                                1,
                                                parseInt(e.target.value) || 1
                                            )
                                        )
                                    }
                                    className="w-20"
                                />
                            </div>
                        </div>
                        <div className="flex gap-4 items-center">
                            <p className={`text-lg font-semibold ${textClasses}`}>
                                Total: $
                                {(
                                    selectedRecipe.pricePerServing * quantity
                                ).toFixed(2)}
                            </p>
                            <Button onClick={handleAddToCart}>
                                Add to Cart
                            </Button>
                            <Button
                                variant="outline"
                                onClick={() => setSelectedRecipe(null)}
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
