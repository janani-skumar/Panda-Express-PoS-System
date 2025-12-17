"use client";

import type { Recipe, MealType } from "@/lib/types";
import { useState, useEffect } from "react";
import { Skeleton } from "@/app/components/ui/skeleton";
import { ManagerGuard } from "@/app/components/manager-guard";
import { cn } from "@/lib/utils";

export default function KitchenPage() {
    const [recipes, setRecipes] = useState<Recipe[]>([]);
    const [mealTypes, setMealTypes] = useState<MealType[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [r1, r2] = await Promise.all([
                    fetch("/api/recipes"),
                    fetch("/api/mealtypes"),
                ]);

                const [d1, d2] = await Promise.all([r1.json(), r2.json()]);

                setRecipes(d1);
                setMealTypes(d2);
            } catch (error) {
                console.error("Failed to fetch menu data:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, []);

    if (isLoading) {
        return (
            <div className="min-h-screen w-full bg-white p-8">
                <div className="max-w-7xl mx-auto">
                    <Skeleton className="h-12 w-48 mb-12 rounded-lg" />
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-16">
                        {Array.from({ length: 4 }).map((_, i) => (
                            <Skeleton
                                key={i}
                                className="h-32 w-full rounded-xl"
                            />
                        ))}
                    </div>
                    <Skeleton className="h-10 w-40 mb-6 rounded-lg" />
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                        {Array.from({ length: 10 }).map((_, i) => (
                            <Skeleton
                                key={i}
                                className="h-48 w-full rounded-xl"
                            />
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    const price = (n: number) => n.toFixed(2);

    // Side badge component that expands on hover (expands right into the card)
    const SideBadge = ({
        text,
        fullText,
        color,
    }: {
        text: string;
        fullText: string;
        color: string;
    }) => (
        <div className="group/badge flex items-center">
            <div
                className={cn(
                    "flex items-center gap-1 px-2 py-1 rounded-r-md shadow-lg",
                    color,
                    "text-white text-xs font-extrabold",
                    "transition-all duration-300 ease-out",
                    "w-6 group-hover/badge:w-20",
                    "overflow-hidden"
                )}
            >
                <span className="text-sm shrink-0 group-hover/badge:hidden">
                    {text}
                </span>
                <span className="whitespace-nowrap opacity-0 group-hover/badge:opacity-100 transition-opacity duration-300">
                    {fullText}
                </span>
            </div>
        </div>
    );

    const itemCard = (
        name: string,
        cost: number,
        image: string | null,
        premium: boolean = false,
        seasonal: boolean = false
    ) => {
        const isPremium = Boolean(premium);
        const isSeasonal = Boolean(seasonal);

        return (
            <div className="group relative bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 hover:scale-[1.05] border border-stone-100">
                <div className="relative w-full h-40 bg-gradient-to-br from-stone-50 to-stone-100 overflow-hidden">
                    <img
                        src={
                            image ||
                            "/placeholder.svg?height=160&width=160&query=food"
                        }
                        alt={name}
                        className="w-full h-full object-contain object-center p-2 transition-transform duration-300 group-hover:scale-110"
                    />
                    <div className="absolute top-0 right-0 bg-[#ce123d] text-white px-3 py-1 text-xs font-bold rounded-bl-lg z-10">
                        ${price(cost)}
                    </div>
                    {/* Side badges container - positioned on left side, expand right into card */}
                    {(isPremium || isSeasonal) && (
                        <div className="absolute left-0 top-0 z-10 flex flex-col gap-1">
                            {isSeasonal && (
                                <SideBadge
                                    text="🎄"
                                    fullText="Seasonal"
                                    color="bg-green-600"
                                />
                            )}
                            {isPremium && (
                                <SideBadge
                                    text="P"
                                    fullText="Premium"
                                    color="bg-amber-500"
                                />
                            )}
                        </div>
                    )}
                </div>
                <div className="p-3 bg-white">
                    <p className="text-sm font-bold text-stone-900 line-clamp-2 leading-tight">
                        {name}
                    </p>
                </div>
            </div>
        );
    };

    return (
        <ManagerGuard>
            <div className="min-h-screen w-full bg-white">
                <div className="bg-maroon-gradient text-white px-8 py-12 shadow-lg">
                    <div className="max-w-7xl mx-auto">
                        <h1 className="text-5xl md:text-6xl font-black tracking-tight mb-2">
                            Our Menu
                        </h1>
                        <p className="text-lg text-maroon-50 font-medium">
                            Crafted with quality & tradition
                        </p>
                    </div>
                </div>

                <div className="max-w-7xl mx-auto px-8 py-12">
                    {/* Meal Plans Section */}
                    <div className="mb-16">
                        <h2 className="text-3xl font-black text-maroon mb-8 tracking-tight">
                            Meal Plans
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {mealTypes
                                .filter(
                                    (m) =>
                                        m.typeName !== "A La Carte" &&
                                        m.typeName !== "Drink"
                                )
                                .map((m, i) => (
                                    <div
                                        key={i}
                                        className="group bg-white rounded-xl border-2 border-[#ce123d] shadow-md hover:shadow-xl transition-all duration-300 hover:border-maroon overflow-hidden"
                                    >
                                        <div className="bg-gradient-to-br from-[#ce123d] to-[#a50a2f] h-24 flex items-center justify-center relative overflow-hidden">
                                            <div className="absolute inset-0 opacity-10 bg-pattern"></div>
                                            <h3 className="text-2xl font-black text-white relative z-10 text-center px-4">
                                                {m.typeName}
                                            </h3>
                                        </div>
                                        <div className="p-4">
                                            <div className="text-center mb-4">
                                                <p className="text-4xl font-black text-[#ce123d]">
                                                    ${price(m.price)}
                                                </p>
                                                <p className="text-xs text-stone-500 font-medium mt-1 uppercase tracking-wide">
                                                    per meal
                                                </p>
                                            </div>
                                            <div className="space-y-2 border-t border-stone-100 pt-4">
                                                {m.entrees !== undefined &&
                                                    m.entrees != 0 && (
                                                        <div className="flex items-center justify-between">
                                                            <span className="text-sm text-stone-700 font-semibold">
                                                                Entrees
                                                            </span>
                                                            <span className="bg-[#f5e6eb] text-[#ce123d] px-3 py-1 rounded-full text-xs font-bold">
                                                                {m.entrees}
                                                            </span>
                                                        </div>
                                                    )}
                                                {m.sides !== undefined &&
                                                    m.sides != 0 && (
                                                        <div className="flex items-center justify-between">
                                                            <span className="text-sm text-stone-700 font-semibold">
                                                                Sides
                                                            </span>
                                                            <span className="bg-[#732626] text-white px-3 py-1 rounded-full text-xs font-bold">
                                                                {m.sides}
                                                            </span>
                                                        </div>
                                                    )}
                                                {m.drinks !== undefined &&
                                                    m.drinks != 0 && (
                                                        <div className="flex items-center justify-between">
                                                            <span className="text-sm text-stone-700 font-semibold">
                                                                Drinks
                                                            </span>
                                                            <span className="bg-stone-100 text-stone-700 px-3 py-1 rounded-full text-xs font-bold">
                                                                {m.drinks}
                                                            </span>
                                                        </div>
                                                    )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                        </div>
                    </div>

                    {/* Entrees Section */}
                    <div className="mb-16">
                        <div className="flex items-center gap-3 mb-8">
                            <div className="w-1 h-10 bg-gradient-to-b from-[#ce123d] to-[#500000] rounded-full"></div>
                            <h2 className="text-3xl font-black text-maroon tracking-tight">
                                Entrees
                            </h2>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-6 gap-4">
                            {recipes
                                .filter((r) => r.type === "Entree")
                                .map((r, i) => (
                                    <div key={i}>
                                        {itemCard(
                                            r.name,
                                            r.pricePerServing,
                                            r.image,
                                            r.premium ?? false,
                                            r.seasonal ?? false
                                        )}
                                    </div>
                                ))}
                        </div>
                    </div>

                    {/* Sides & Drinks Section */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
                        {/* Sides */}
                        <div>
                            <div className="flex items-center gap-3 mb-8">
                                <div className="w-1 h-10 bg-gradient-to-b from-[#ce123d] to-[#500000] rounded-full"></div>
                                <h2 className="text-3xl font-black text-maroon tracking-tight">
                                    Sides
                                </h2>
                            </div>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                {recipes
                                    .filter((r) => r.type === "Side")
                                    .map((r, i) => (
                                        <div key={i}>
                                            {itemCard(
                                                r.name,
                                                r.pricePerServing,
                                                r.image,
                                                r.premium ?? false,
                                                r.seasonal ?? false
                                            )}
                                        </div>
                                    ))}
                            </div>
                        </div>

                        {/* Drinks */}
                        <div>
                            <div className="flex items-center gap-3 mb-8">
                                <div className="w-1 h-10 bg-gradient-to-b from-[#ce123d] to-[#500000] rounded-full"></div>
                                <h2 className="text-3xl font-black text-maroon tracking-tight">
                                    Drinks
                                </h2>
                            </div>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                {recipes
                                    .filter((r) => r.type === "Drink")
                                    .map((r, i) => (
                                        <div key={i}>
                                            {itemCard(
                                                r.name,
                                                r.pricePerServing,
                                                r.image,
                                                r.premium ?? false,
                                                r.seasonal ?? false
                                            )}
                                        </div>
                                    ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </ManagerGuard>
    );
}
