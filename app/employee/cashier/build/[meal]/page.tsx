"use client";
import { use } from "react";

import { useEffect, useMemo, useState } from "react";
import { RecipeType, Recipe, MealType, RecipeSelection } from "@/lib/types";
import { useCart } from "@/app/providers/cart-provider";
import { Button } from "@/app/components/ui/button";
import { useRouter } from "next/navigation";
import { useAddToCartToast } from "@/hooks/use-add-to-cart-toast";
import CashierCard from "@/app/components/app-cashier-card";
import { Skeleton } from "@/app/components/ui/skeleton";

interface Selection {
    type: RecipeType;
    num: number;
}

interface MealSelections {
    entrees: Recipe[];
    sides: Recipe[];
    drinks: Recipe[];
}

export default function Build({
    params,
}: {
    params: Promise<{ meal: string }>;
}) {
    const { meal } = use(params);
    const { addMeal } = useCart();
    const router = useRouter();
    const { addMealWithToast } = useAddToCartToast();
    const [recipes, setRecipes] = useState<Recipe[]>([]);
    const [mealtypes, setMealtypes] = useState<MealType[]>([]);
    const [currentMenu, setCurrentMenu] = useState<RecipeType>();
    const [selection, setSelection] = useState<Selection>();
    const [isLoading, setIsLoading] = useState(true);
    const [mealSelections, setMealSelections] = useState<MealSelections>({
        entrees: [],
        sides: [],
        drinks: [],
    });

    // fetch recipes
    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch both APIs in parallel for better performance
                const [recipesResponse, mealtypesResponse] = await Promise.all([
                    fetch(`/api/recipes`),
                    fetch(`/api/mealtypes`)
                ]);

                if (recipesResponse.ok) {
                    const data = await recipesResponse.json();
                    setRecipes(data);
                }

                if (mealtypesResponse.ok) {
                    const data = await mealtypesResponse.json();
                    setMealtypes(data);
                }

                setCurrentMenu("Entree");
                setSelection({
                    type: "Entree",
                    num: 0,
                });
            } catch (error) {
                console.error("Failed to fetch links");
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, []);

    const mealName = useMemo(() => meal.replaceAll("%20", " "), [meal]);

    const mealtype = useMemo(
        () => mealtypes.find((t) => t.typeName === mealName),
        [mealName, mealtypes]
    );

    const entrees = useMemo(
        () => [...Array(mealtype?.entrees || 0)],
        [mealtype]
    );

    const sides = useMemo(() => [...Array(mealtype?.sides || 0)], [mealtype]);

    const drinks = useMemo(() => [...Array(mealtype?.drinks || 0)], [mealtype]);

    const isComplete = useMemo(() => {
        if (!mealtype) return false;
        const entreesComplete =
            mealSelections.entrees.filter(Boolean).length === mealtype.entrees;
        const sidesComplete =
            mealSelections.sides.filter(Boolean).length === mealtype.sides;
        const drinksComplete =
            mealSelections.drinks.filter(Boolean).length === mealtype.drinks;
        return entreesComplete && sidesComplete && drinksComplete;
    }, [mealtype, mealSelections]);

    const handleRecipeClick = (recipe: Recipe) => {
        if (!selection) return;

        const newSelections = { ...mealSelections };

        if (selection.type === "Entree") {
            const updatedEntrees = [...newSelections.entrees];
            updatedEntrees[selection.num] = recipe;
            newSelections.entrees = updatedEntrees;
        } else if (selection.type === "Side") {
            const updatedSides = [...newSelections.sides];
            updatedSides[selection.num] = recipe;
            newSelections.sides = updatedSides;
        } else if (selection.type === "Drink") {
            const updatedDrinks = [...newSelections.drinks];
            updatedDrinks[selection.num] = recipe;
            newSelections.drinks = updatedDrinks;
        }

        setMealSelections(newSelections);

        // Auto-advance to next selection
        if (
            selection.type === "Entree" &&
            selection.num < (mealtype?.entrees || 0) - 1
        ) {
            setSelection({ type: "Entree", num: selection.num + 1 });
            setCurrentMenu("Entree");
        } else if (
            selection.type === "Entree" &&
            mealtype &&
            mealtype.sides > 0
        ) {
            setSelection({ type: "Side", num: 0 });
            setCurrentMenu("Side");
        } else if (
            selection.type === "Side" &&
            selection.num < (mealtype?.sides || 0) - 1
        ) {
            setSelection({ type: "Side", num: selection.num + 1 });
            setCurrentMenu("Side");
        } else if (
            selection.type === "Side" &&
            mealtype &&
            mealtype.drinks > 0
        ) {
            setSelection({ type: "Drink", num: 0 });
            setCurrentMenu("Drink");
        } else if (
            selection.type === "Drink" &&
            selection.num < (mealtype?.drinks || 0) - 1
        ) {
            setSelection({ type: "Drink", num: selection.num + 1 });
            setCurrentMenu("Drink");
        }
    };

    const handleAddToCart = async () => {
        if (!mealtype || !isComplete) return;

        const selections: {
            entrees: RecipeSelection[];
            sides: RecipeSelection[];
            drinks: RecipeSelection[];
        } = {
            entrees: mealSelections.entrees.map((r) => ({
                recipeId: r.id!,
                recipeName: r.name,
            })),
            sides: mealSelections.sides.map((r) => ({
                recipeId: r.id!,
                recipeName: r.name,
            })),
            drinks: mealSelections.drinks.map((r) => ({
                recipeId: r.id!,
                recipeName: r.name,
            })),
        };

        const success = await addMealWithToast(
            () => addMeal({
                mealType: mealtype.typeName,
                quantity: 1,
                price: mealtype.price,
                selections: selections,
            }),
            {
                onSuccess: () => {
                    // Reset selections
                    setMealSelections({ entrees: [], sides: [], drinks: [] });
                    setSelection({ type: "Entree", num: 0 });
                    setCurrentMenu("Entree");
                },
            }
        );
        
        if (success) {
            router.push("/employee/cashier/build");
        }
    };

    if (isLoading) {
        return (
            <div className="flex h-full">
                <div className="w-48 bg-neutral-100 border-r-2 border-neutral-300 p-4 space-y-3">
                    <Skeleton className="h-8 w-32 mb-4" />
                    {Array.from({ length: 5 }).map((_, i) => (
                        <Skeleton key={i} className="h-16 w-full rounded" />
                    ))}
                </div>
                <div className="flex-1 bg-white p-6">
                    <Skeleton className="h-8 w-48 mb-6" />
                    <div className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 max-w-5xl">
                        {Array.from({ length: 8 }).map((_, i) => (
                            <Skeleton key={i} className="h-32 w-full rounded-lg" />
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex h-full">
            {/* Left Sidebar - Meal Selections */}
            <div className="w-48 bg-neutral-100 border-r-2 border-neutral-300 p-4 space-y-3 overflow-y-auto">
                <div className="mb-4">
                    <h3 className="text-lg font-bold text-neutral-900 mb-1">
                        {mealName}
                    </h3>
                    {mealtype && (
                        <p className="text-sm text-neutral-600">
                            ${mealtype.price.toFixed(2)}
                        </p>
                    )}
                </div>

                {entrees?.map((e, i) => {
                    const selectedRecipe = mealSelections.entrees[i];
                    const isSelected =
                        selection &&
                        selection.type === "Entree" &&
                        selection.num === i;
                    return (
                        <button
                            key={i}
                            onClick={() => {
                                setCurrentMenu("Entree");
                                setSelection({
                                    type: "Entree",
                                    num: i,
                                });
                            }}
                            className={`w-full p-3 rounded text-left text-sm font-semibold transition-all ${
                                isSelected
                                    ? "bg-tamu-maroon text-white shadow-md"
                                    : selectedRecipe
                                    ? "bg-white text-neutral-900 border-2 border-green-500"
                                    : "bg-white text-neutral-700 border-2 border-neutral-300"
                            } hover:shadow-md`}
                        >
                            {selectedRecipe
                                ? selectedRecipe.name
                                : `Entree ${i + 1}`}
                        </button>
                    );
                })}

                {sides?.map((e, i) => {
                    const selectedRecipe = mealSelections.sides[i];
                    const isSelected =
                        selection &&
                        selection.type === "Side" &&
                        selection.num === i;
                    return (
                        <button
                            key={i}
                            onClick={() => {
                                setCurrentMenu("Side");
                                setSelection({
                                    type: "Side",
                                    num: i,
                                });
                            }}
                            className={`w-full p-3 rounded text-left text-sm font-semibold transition-all ${
                                isSelected
                                    ? "bg-tamu-maroon text-white shadow-md"
                                    : selectedRecipe
                                    ? "bg-white text-neutral-900 border-2 border-green-500"
                                    : "bg-white text-neutral-700 border-2 border-neutral-300"
                            } hover:shadow-md`}
                        >
                            {selectedRecipe
                                ? selectedRecipe.name
                                : `Side ${i + 1}`}
                        </button>
                    );
                })}

                {drinks?.map((e, i) => {
                    const selectedRecipe = mealSelections.drinks[i];
                    const isSelected =
                        selection &&
                        selection.type === "Drink" &&
                        selection.num === i;
                    return (
                        <button
                            key={i}
                            onClick={() => {
                                setCurrentMenu("Drink");
                                setSelection({
                                    type: "Drink",
                                    num: i,
                                });
                            }}
                            className={`w-full p-3 rounded text-left text-sm font-semibold transition-all ${
                                isSelected
                                    ? "bg-tamu-maroon text-white shadow-md"
                                    : selectedRecipe
                                    ? "bg-white text-neutral-900 border-2 border-green-500"
                                    : "bg-white text-neutral-700 border-2 border-neutral-300"
                            } hover:shadow-md`}
                        >
                            {selectedRecipe
                                ? selectedRecipe.name
                                : `Drink ${i + 1}`}
                        </button>
                    );
                })}

                {isComplete && (
                    <Button
                        onClick={handleAddToCart}
                        className="w-full h-12 bg-green-600 hover:bg-green-700 text-white font-bold mt-4"
                    >
                        Add to Cart
                    </Button>
                )}
            </div>

            {/* Main Content - Recipe Selection */}
            <div className="flex-1 bg-white p-6 overflow-y-auto">
                <div className="mb-6">
                    <div className="mb-6 flex items-center justify-between">
                        <h2 className="text-2xl font-bold text-neutral-900">
                            Select {selection?.type}{" "}
                        {selection ? selection.num + 1 : ""}
                        </h2>

                        <a href="/employee/cashier">
                            <Button
                                variant="default"
                                className="px-6 py-3 text-lg font-bold bg-tamu-maroon hover:bg-tamu-maroon-dark text-white shadow-md rounded-md transition-colors duration-300"
                            >
                                Home
                            </Button>
                        </a>
                    </div>
                </div>
                <div className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 max-w-5xl">
                    {recipes
                        .filter((r) => r.type === currentMenu)
                        .map((item, i) => (
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
        </div>
    );
}
