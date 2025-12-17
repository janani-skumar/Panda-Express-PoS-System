"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
} from "@/app/components/ui/carousel";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/app/components/ui/alert-dialog";
import { Cooked, Recipe, Inventory } from "@/lib/types";
import { toast } from "sonner";

type NeededIngredient = {
    id: number;
    inventoryId: number;
    recipeId: number;
    inventoryQuantity: number;
    inventoryName: string;
};

export const KitchenCarousel = ({ cooked }: { cooked: Cooked[] }) => {
    const [recipes, setRecipes] = useState<Recipe[]>([]);
    const [inventory, setInventory] = useState<Inventory[]>([]);
    const [alertOpen, setAlertOpen] = useState<boolean>(false);
    const [missingIngredients, setMissingIngredients] = useState<
        NeededIngredient[]
    >([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [recipesRes, inventoryRes] = await Promise.all([
                    fetch(`/api/recipes`),
                    fetch(`/api/inventory`),
                ]);
                if (recipesRes.ok) setRecipes(await recipesRes.json());
                if (inventoryRes.ok) setInventory(await inventoryRes.json());
            } catch (err) {
                console.error("Failed to fetch data", err);
            }
        };
        fetchData();
    }, []);

    async function canCook(recipe: Recipe): Promise<boolean> {
        const response = await fetch(`/api/inv-rec-junc/recipe/${recipe.id}`);
        if (response.ok) {
            const data: NeededIngredient[] = await response.json();
            const missing: NeededIngredient[] = [];
            let passed = true;

            for (const inv of data) {
                const inInv = inventory.find((i) => i.id === inv.inventoryId);
                if (!inInv) {
                } else if (inInv.currentStock < inv.inventoryQuantity) {
                    missing.push({
                        id: -1,
                        inventoryId: inInv.id!,
                        recipeId: recipe.id!,
                        inventoryQuantity:
                            inv.inventoryQuantity - inInv.currentStock,
                        inventoryName: inInv.name,
                    });
                    passed = false;
                }
            }
            if (passed == false) {
                setAlertOpen(true);
                setMissingIngredients(missing);
            }
            return passed;
        } else if (response.status === 404) return true; // no ingredients required

        // we return true so that error will be handled in toast
        return true;
    }

    async function cook(recipe: Recipe) {
        const hasIngredients = await canCook(recipe);
        if (!hasIngredients) return;

        const response = await fetch(`/api/cooked/cook/${recipe.id}`, {
            method: "POST",
        });
        if (response.ok) {
            toast.success(`Cooked ${recipe.name} successfully`);
        } else {
            toast.error(`Failed to cook ${recipe.name}`);
        }
    }

    return (
        <div>
            <AlertDialog open={alertOpen} defaultOpen={false}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>
                            Not Enough Ingredients
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            {missingIngredients.map((ingr, i) => (
                                <span key={i}>
                                    {ingr.inventoryName} -{" "}
                                    {ingr.inventoryQuantity}
                                </span>
                            ))}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogAction
                            onClick={() => {
                                setAlertOpen(false);
                            }}
                        >
                            Continue
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            <Carousel className="w-full">
                <CarouselContent className="-ml-2 mt-2">
                    {recipes.map((recipe) => {
                        const cookedItem =
                            cooked.find((c) => c.recipeId === recipe.id)
                                ?.currentStock ?? 0;

                        return (
                            <CarouselItem
                                key={recipe.id}
                                className="pl-2 sm:basis-1/2 md:basis-1/4 lg:basis-1/6 basis-1/2"
                            >
                                <Card className="border-2 border-black hover:shadow-lg hover:-translate-y-1 transition-all h-full">
                                    <CardContent className="flex flex-col justify-between h-full p-4">
                                        <div className="space-y-2 text-center">
                                            <h3 className="font-mono text-lg font-bold truncate">
                                                {recipe.name}
                                            </h3>
                                            <div className="text-xs font-mono text-gray-600">
                                                <p>Stock: {cookedItem}</p>
                                                <p>
                                                    Makes:{" "}
                                                    {recipe.ordersPerBatch}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex justify-center w-full">
                                            <Button
                                                className=" w-full mt-2 bg-black text-white font-semibold rounded-xl px-3 py-2 shadow-[0_4px_0_0_#000] hover:-translate-y-0.5 hover:shadow-[0_6px_0_0_#000] active:translate-y-[3px] active:shadow-[0_1px_0_0_#000] active:scale-[0.97] transform transition-all duration-150 ease-in-out"
                                                onClick={() => cook(recipe)}
                                            >
                                                Cook
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            </CarouselItem>
                        );
                    })}
                </CarouselContent>

                <CarouselPrevious className="border-black hover:bg-black hover:text-white transition-all" />
                <CarouselNext className="border-black hover:bg-black hover:text-white transition-all" />
            </Carousel>
        </div>
    );
};
