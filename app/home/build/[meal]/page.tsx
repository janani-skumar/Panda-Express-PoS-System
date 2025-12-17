"use client";
import { use } from "react";

import MealCard from "@/app/components/app-mealcard";
import { useEffect, useMemo, useState } from "react";
import { RecipeType, Recipe, MealType, RecipeSelection } from "@/lib/types";
import { useCart } from "@/app/providers/cart-provider";
import { Button } from "@/app/components/ui/button";
import { useRouter } from "next/navigation";
import { useAddToCartToast } from "@/hooks/use-add-to-cart-toast";
import { useAccessibilityStyles } from "@/hooks/use-accessibility-styles";
import { Skeleton } from "@/app/components/ui/skeleton";
import { Input } from "@/app/components/ui/input";
import { cn } from "@/lib/utils";
import {
    ShoppingCart,
    RotateCcw,
    Check,
    ChefHat,
    Coffee,
    Salad,
} from "lucide-react";
import Image from "next/image";

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
    const { textClasses } = useAccessibilityStyles();
    const [recipes, setRecipes] = useState<Recipe[]>([]);
    const [mealtypes, setMealtypes] = useState<MealType[]>([]);
    const [quantity, setQuantity] = useState<number>(1);
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
                    fetch(`/api/mealtypes`),
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
            } catch {
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

    // Calculate progress
    const progress = useMemo(() => {
        if (!mealtype) return 0;
        const total = mealtype.entrees + mealtype.sides + mealtype.drinks;
        const completed =
            mealSelections.entrees.filter(Boolean).length +
            mealSelections.sides.filter(Boolean).length +
            mealSelections.drinks.filter(Boolean).length;
        return Math.round((completed / total) * 100);
    }, [mealtype, mealSelections]);

    const premiumSelections = useMemo(() => {
        const allSelections = [
            ...mealSelections.entrees,
            ...mealSelections.sides,
            ...mealSelections.drinks,
        ];
        return allSelections.filter((recipe) => recipe?.premium).length;
    }, [mealSelections]);

    const premiumUpcharge = useMemo(
        () => premiumSelections * 1.15,
        [premiumSelections]
    );

    const mealUnitPrice = useMemo(() => {
        if (!mealtype) return 0;
        return Number((mealtype.price + premiumUpcharge).toFixed(2));
    }, [mealtype, premiumUpcharge]);

    const totalPrice = useMemo(() => {
        return Number((mealUnitPrice * quantity).toFixed(2));
    }, [mealUnitPrice, quantity]);

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
                premium: r.premium,
            })),
            sides: mealSelections.sides.map((r) => ({
                recipeId: r.id!,
                recipeName: r.name,
                premium: r.premium,
            })),
            drinks: mealSelections.drinks.map((r) => ({
                recipeId: r.id!,
                recipeName: r.name,
                premium: r.premium,
            })),
        };

        const success = await addMealWithToast(
            () =>
                addMeal({
                    mealType: mealtype.typeName,
                    quantity: quantity,
                    price: mealUnitPrice,
                    premiumUpcharge: premiumUpcharge,
                    selections: selections,
                }),
            {
                onSuccess: () => {
                    // Reset selections and quantity
                    setMealSelections({ entrees: [], sides: [], drinks: [] });
                    setSelection({ type: "Entree", num: 0 });
                    setCurrentMenu("Entree");
                    setQuantity(1);
                },
            }
        );

        if (success) {
            router.push("/home/build");
        }
    };

    const getIconForType = (type: RecipeType) => {
        switch (type) {
            case "Entree":
                return ChefHat;
            case "Side":
                return Salad;
            case "Drink":
                return Coffee;
            default:
                return ChefHat;
        }
    };

    if (isLoading) {
        return (
            <div className="flex flex-row h-full bg-gradient-to-br from-neutral-50 to-neutral-100">
                <div className="flex-1 p-8">
                    <Skeleton className="h-12 w-64 mb-8" />
                    <div className="grid grid-cols-4 gap-6">
                        {Array.from({ length: 8 }).map((_, i) => (
                            <Skeleton
                                key={i}
                                className="aspect-square w-full rounded-xl"
                            />
                        ))}
                    </div>
                </div>
                <div className="w-80 bg-white/50 backdrop-blur-sm border-l border-neutral-200 p-6">
                    <Skeleton className="h-10 w-48 mb-6" />
                    <div className="space-y-4">
                        {Array.from({ length: 3 }).map((_, i) => (
                            <Skeleton
                                key={i}
                                className="h-24 w-full rounded-xl"
                            />
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-row h-full bg-gradient-to-br from-neutral-50 via-white to-neutral-100">
            <h1 className="sr-only">{mealName}</h1>
            {/* Main Content Area */}
            <div className="flex-1 overflow-y-auto">
                {/* Header with progress */}
                <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-neutral-200/50 px-8 py-4">
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                            {(() => {
                                const Icon = getIconForType(
                                    selection?.type || "Entree"
                                );
                                return (
                                    <div className="size-10 rounded-xl bg-tamu-maroon/10 flex items-center justify-center">
                                        <Icon className="size-5 text-tamu-maroon" />
                                    </div>
                                );
                            })()}
                            <div>
                                <h2
                                    className={cn(
                                        "text-2xl font-bold text-neutral-900",
                                        textClasses
                                    )}
                                >
                                    Select {selection?.type}{" "}
                                    {selection ? selection.num + 1 : ""}
                                </h2>
                                <p
                                    className={cn(
                                        "text-sm text-neutral-500",
                                        textClasses
                                    )}
                                >
                                    Choose your {selection?.type?.toLowerCase()}{" "}
                                    from the options below
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            {/* Progress indicator */}
                            <div className="flex items-center gap-2">
                                <div className="w-32 h-2 bg-neutral-200 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-gradient-to-r from-tamu-maroon to-tamu-maroon-light rounded-full transition-all duration-500 ease-out"
                                        style={{ width: `${progress}%` }}
                                    />
                                </div>
                                <span
                                    className={cn(
                                        "text-sm font-medium text-neutral-600",
                                        textClasses
                                    )}
                                >
                                    {progress}%
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Recipe Grid */}
                <div className="p-8">
                    {currentMenu === "Entree" &&
                    mealtype &&
                    mealtype.sides > 0 ? (
                        // Show both Entrees and Sides when in Entree section
                        <div className="space-y-12">
                            {/* Entrees Section */}
                            <div>
                                <div className="flex items-center gap-2 mb-6">
                                    <ChefHat className="size-5 text-tamu-maroon" />
                                    <h3
                                        className={cn(
                                            "text-xl font-bold text-neutral-900",
                                            textClasses
                                        )}
                                    >
                                        Entrees
                                    </h3>
                                </div>
                                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                                    {recipes
                                        .filter((r) => r.type === "Entree")
                                        .map((item, i) => (
                                            <button
                                                key={`entree-${i}`}
                                                onClick={() =>
                                                    handleRecipeClick(item)
                                                }
                                                className="cursor-pointer transition-transform duration-200 active:scale-95"
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
                            </div>

                            {/* Sides Section */}
                            <div>
                                <div className="flex items-center gap-2 mb-6">
                                    <Salad className="size-5 text-tamu-maroon" />
                                    <h3
                                        className={cn(
                                            "text-xl font-bold text-neutral-900",
                                            textClasses
                                        )}
                                    >
                                        Sides Substitute
                                    </h3>
                                </div>
                                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                                    {recipes
                                        .filter((r) => r.type === "Side")
                                        .map((item, i) => (
                                            <button
                                                key={`side-${i}`}
                                                onClick={() =>
                                                    handleRecipeClick(item)
                                                }
                                                className="cursor-pointer transition-transform duration-200 active:scale-95"
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
                            </div>
                        </div>
                    ) : (
                        // Show single section for Side, Drink, or Entree without sides
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                            {recipes
                                .filter((r) => r.type === currentMenu)
                                .map((item, i) => (
                                    <button
                                        key={i}
                                        onClick={() => handleRecipeClick(item)}
                                        className="cursor-pointer transition-transform duration-200 active:scale-95"
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
                    )}
                </div>

                {/* Bottom Action Bar - Only when complete */}
                {isComplete && (
                    <div className="fixed bottom-20 left-0 right-0 z-20 px-8">
                        <div className="max-w-4xl mx-auto">
                            <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-neutral-200/50 p-6">
                                <div className="flex items-center justify-between gap-6">
                                    <div className="flex items-center gap-4">
                                        <div className="size-12 rounded-xl bg-green-500/10 flex items-center justify-center">
                                            <Check className="size-6 text-green-600" />
                                        </div>
                                        <div>
                                            <h3
                                                className={cn(
                                                    "text-lg font-bold text-neutral-900",
                                                    textClasses
                                                )}
                                            >
                                                {mealName} Ready!
                                            </h3>
                                            <p
                                                className={cn(
                                                    "text-neutral-500",
                                                    textClasses
                                                )}
                                            >
                                                ${mealUnitPrice.toFixed(2)} each
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <div className="flex items-center gap-2 bg-neutral-100 rounded-xl px-3 py-2">
                                            <label
                                                className={cn(
                                                    "text-sm font-medium text-neutral-600",
                                                    textClasses
                                                )}
                                            >
                                                Qty:
                                            </label>
                                            <Input
                                                type="number"
                                                min="1"
                                                value={quantity}
                                                onChange={(e) =>
                                                    setQuantity(
                                                        Math.max(
                                                            1,
                                                            parseInt(
                                                                e.target.value
                                                            ) || 1
                                                        )
                                                    )
                                                }
                                                className="w-16 h-8 text-center border-0 bg-white"
                                            />
                                        </div>

                                        <div className="h-8 w-px bg-neutral-200" />

                                        <div className="flex flex-col items-end">
                                            <p
                                                className={cn(
                                                    "text-xl font-bold text-neutral-900 min-w-[80px]",
                                                    textClasses
                                                )}
                                            >
                                                $
                                                {mealtype &&
                                                    totalPrice.toFixed(2)}
                                            </p>
                                            {premiumSelections > 0 && (
                                                <span
                                                    className={cn(
                                                        "text-xs text-neutral-500",
                                                        textClasses
                                                    )}
                                                >
                                                    Includes $
                                                    {premiumUpcharge.toFixed(2)}{" "}
                                                    premium add-on
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex gap-3">
                                        <Button
                                            variant="outline"
                                            onClick={() => {
                                                setMealSelections({
                                                    entrees: [],
                                                    sides: [],
                                                    drinks: [],
                                                });
                                                setSelection({
                                                    type: "Entree",
                                                    num: 0,
                                                });
                                                setCurrentMenu("Entree");
                                            }}
                                            className="gap-2 border-neutral-300 hover:bg-neutral-100"
                                        >
                                            <RotateCcw className="size-4" />
                                            Reset
                                        </Button>
                                        <Button
                                            onClick={handleAddToCart}
                                            className="gap-2 bg-tamu-maroon hover:bg-tamu-maroon-dark text-white px-6 shadow-lg shadow-tamu-maroon/25"
                                        >
                                            <ShoppingCart className="size-4" />
                                            Add to Cart
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Right Sidebar - Selection Summary */}
            <aside
                className="w-80 h-full border-l border-neutral-200/50 bg-gradient-to-b from-white to-neutral-50/50 backdrop-blur-sm flex flex-col"
                aria-label="Meal selection summary"
            >
                {/* Sidebar Header */}
                <div className="p-6 border-b border-neutral-200/50">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="size-10 rounded-xl bg-tamu-maroon flex items-center justify-center shadow-lg shadow-tamu-maroon/20">
                            <ChefHat className="size-5 text-white" />
                        </div>
                        <div>
                            <h2
                                className={cn(
                                    "text-xl font-bold text-neutral-900",
                                    textClasses
                                )}
                            >
                                {mealName}
                            </h2>
                            <p
                                className={cn(
                                    "text-sm text-neutral-500",
                                    textClasses
                                )}
                            >
                                ${mealUnitPrice.toFixed(2)}
                            </p>
                        </div>
                    </div>
                    {/* Mini progress bar */}
                    <div className="mt-4">
                        <div className="flex justify-between text-xs text-neutral-500 mb-1">
                            <span>Progress</span>
                            <span>{progress}% complete</span>
                        </div>
                        <div className="w-full h-1.5 bg-neutral-200 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-gradient-to-r from-tamu-maroon to-tamu-maroon-light rounded-full transition-all duration-500"
                                style={{ width: `${progress}%` }}
                            />
                        </div>
                    </div>
                </div>

                {/* Selection Items */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                    {/* Entrees Section */}
                    {entrees.length > 0 && (
                        <div className="space-y-2">
                            <div className="flex items-center gap-2 px-2">
                                <ChefHat className="size-4 text-tamu-maroon" />
                                <span
                                    className={cn(
                                        "text-xs font-semibold uppercase tracking-wider text-neutral-500",
                                        textClasses
                                    )}
                                >
                                    Entrees
                                </span>
                            </div>
                            {entrees.map((_, i) => {
                                const selectedRecipe =
                                    mealSelections.entrees[i];
                                const isSelected =
                                    selection?.type === "Entree" &&
                                    selection.num === i;
                                return (
                                    <button
                                        key={`entree-${i}`}
                                        onClick={() => {
                                            setCurrentMenu("Entree");
                                            setSelection({
                                                type: "Entree",
                                                num: i,
                                            });
                                        }}
                                        className={cn(
                                            "w-full p-3 rounded-xl text-left transition-all duration-200",
                                            "border-2",
                                            isSelected
                                                ? "border-tamu-maroon bg-tamu-maroon/5 shadow-md"
                                                : selectedRecipe
                                                ? "border-green-500/50 bg-green-50/50"
                                                : "border-neutral-200 bg-white hover:border-neutral-300 hover:shadow-sm"
                                        )}
                                    >
                                        <div className="flex items-center gap-3">
                                            {selectedRecipe ? (
                                                <div className="size-10 rounded-lg overflow-hidden bg-neutral-100 shrink-0">
                                                    {selectedRecipe.image ? (
                                                        <Image
                                                            src={
                                                                selectedRecipe.image
                                                            }
                                                            alt={
                                                                selectedRecipe.name
                                                            }
                                                            width={40}
                                                            height={40}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center">
                                                            <ChefHat className="size-5 text-neutral-400" />
                                                        </div>
                                                    )}
                                                </div>
                                            ) : (
                                                <div
                                                    className={cn(
                                                        "size-10 rounded-lg flex items-center justify-center shrink-0",
                                                        isSelected
                                                            ? "bg-tamu-maroon/10"
                                                            : "bg-neutral-100"
                                                    )}
                                                >
                                                    <span
                                                        className={cn(
                                                            "text-lg font-semibold",
                                                            isSelected
                                                                ? "text-tamu-maroon"
                                                                : "text-neutral-400"
                                                        )}
                                                    >
                                                        {i + 1}
                                                    </span>
                                                </div>
                                            )}
                                            <div className="flex-1 min-w-0">
                                                <p
                                                    className={cn(
                                                        "font-medium truncate",
                                                        selectedRecipe
                                                            ? "text-neutral-900"
                                                            : "text-neutral-500",
                                                        textClasses
                                                    )}
                                                >
                                                    {selectedRecipe?.name ||
                                                        `Select Entree ${
                                                            i + 1
                                                        }`}
                                                </p>
                                            </div>
                                            {selectedRecipe && (
                                                <Check className="size-4 text-green-500 shrink-0" />
                                            )}
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    )}

                    {/* Sides Section */}
                    {sides.length > 0 && (
                        <div className="space-y-2">
                            <div className="flex items-center gap-2 px-2">
                                <Salad className="size-4 text-tamu-maroon" />
                                <span
                                    className={cn(
                                        "text-xs font-semibold uppercase tracking-wider text-neutral-500",
                                        textClasses
                                    )}
                                >
                                    Sides
                                </span>
                            </div>
                            {sides.map((_, i) => {
                                const selectedRecipe = mealSelections.sides[i];
                                const isSelected =
                                    selection?.type === "Side" &&
                                    selection.num === i;
                                return (
                                    <button
                                        key={`side-${i}`}
                                        onClick={() => {
                                            setCurrentMenu("Side");
                                            setSelection({
                                                type: "Side",
                                                num: i,
                                            });
                                        }}
                                        className={cn(
                                            "w-full p-3 rounded-xl text-left transition-all duration-200",
                                            "border-2",
                                            isSelected
                                                ? "border-tamu-maroon bg-tamu-maroon/5 shadow-md"
                                                : selectedRecipe
                                                ? "border-green-500/50 bg-green-50/50"
                                                : "border-neutral-200 bg-white hover:border-neutral-300 hover:shadow-sm"
                                        )}
                                    >
                                        <div className="flex items-center gap-3">
                                            {selectedRecipe ? (
                                                <div className="size-10 rounded-lg overflow-hidden bg-neutral-100 shrink-0">
                                                    {selectedRecipe.image ? (
                                                        <Image
                                                            src={
                                                                selectedRecipe.image
                                                            }
                                                            alt={
                                                                selectedRecipe.name
                                                            }
                                                            width={40}
                                                            height={40}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center">
                                                            <Salad className="size-5 text-neutral-400" />
                                                        </div>
                                                    )}
                                                </div>
                                            ) : (
                                                <div
                                                    className={cn(
                                                        "size-10 rounded-lg flex items-center justify-center shrink-0",
                                                        isSelected
                                                            ? "bg-tamu-maroon/10"
                                                            : "bg-neutral-100"
                                                    )}
                                                >
                                                    <span
                                                        className={cn(
                                                            "text-lg font-semibold",
                                                            isSelected
                                                                ? "text-tamu-maroon"
                                                                : "text-neutral-400"
                                                        )}
                                                    >
                                                        {i + 1}
                                                    </span>
                                                </div>
                                            )}
                                            <div className="flex-1 min-w-0">
                                                <p
                                                    className={cn(
                                                        "font-medium truncate",
                                                        selectedRecipe
                                                            ? "text-neutral-900"
                                                            : "text-neutral-500",
                                                        textClasses
                                                    )}
                                                >
                                                    {selectedRecipe?.name ||
                                                        `Select Side ${i + 1}`}
                                                </p>
                                            </div>
                                            {selectedRecipe && (
                                                <Check className="size-4 text-green-500 shrink-0" />
                                            )}
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    )}

                    {/* Drinks Section */}
                    {drinks.length > 0 && (
                        <div className="space-y-2">
                            <div className="flex items-center gap-2 px-2">
                                <Coffee className="size-4 text-tamu-maroon" />
                                <span
                                    className={cn(
                                        "text-xs font-semibold uppercase tracking-wider text-neutral-500",
                                        textClasses
                                    )}
                                >
                                    Drinks
                                </span>
                            </div>
                            {drinks.map((_, i) => {
                                const selectedRecipe = mealSelections.drinks[i];
                                const isSelected =
                                    selection?.type === "Drink" &&
                                    selection.num === i;
                                return (
                                    <button
                                        key={`drink-${i}`}
                                        onClick={() => {
                                            setCurrentMenu("Drink");
                                            setSelection({
                                                type: "Drink",
                                                num: i,
                                            });
                                        }}
                                        className={cn(
                                            "w-full p-3 rounded-xl text-left transition-all duration-200",
                                            "border-2",
                                            isSelected
                                                ? "border-tamu-maroon bg-tamu-maroon/5 shadow-md"
                                                : selectedRecipe
                                                ? "border-green-500/50 bg-green-50/50"
                                                : "border-neutral-200 bg-white hover:border-neutral-300 hover:shadow-sm"
                                        )}
                                    >
                                        <div className="flex items-center gap-3">
                                            {selectedRecipe ? (
                                                <div className="size-10 rounded-lg overflow-hidden bg-neutral-100 shrink-0">
                                                    {selectedRecipe.image ? (
                                                        <Image
                                                            src={
                                                                selectedRecipe.image
                                                            }
                                                            alt={
                                                                selectedRecipe.name
                                                            }
                                                            width={40}
                                                            height={40}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center">
                                                            <Coffee className="size-5 text-neutral-400" />
                                                        </div>
                                                    )}
                                                </div>
                                            ) : (
                                                <div
                                                    className={cn(
                                                        "size-10 rounded-lg flex items-center justify-center shrink-0",
                                                        isSelected
                                                            ? "bg-tamu-maroon/10"
                                                            : "bg-neutral-100"
                                                    )}
                                                >
                                                    <span
                                                        className={cn(
                                                            "text-lg font-semibold",
                                                            isSelected
                                                                ? "text-tamu-maroon"
                                                                : "text-neutral-400"
                                                        )}
                                                    >
                                                        {i + 1}
                                                    </span>
                                                </div>
                                            )}
                                            <div className="flex-1 min-w-0">
                                                <p
                                                    className={cn(
                                                        "font-medium truncate",
                                                        selectedRecipe
                                                            ? "text-neutral-900"
                                                            : "text-neutral-500",
                                                        textClasses
                                                    )}
                                                >
                                                    {selectedRecipe?.name ||
                                                        `Select Drink ${i + 1}`}
                                                </p>
                                            </div>
                                            {selectedRecipe && (
                                                <Check className="size-4 text-green-500 shrink-0" />
                                            )}
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Sidebar Footer */}
                <div className="p-4 border-t border-neutral-200/50 bg-white/50">
                    <Button
                        variant="outline"
                        onClick={() => router.push("/home/build")}
                        className="w-full border-neutral-300 hover:bg-neutral-100"
                    >
                        ← Back to Meals
                    </Button>
                </div>
            </aside>
        </div>
    );
}
