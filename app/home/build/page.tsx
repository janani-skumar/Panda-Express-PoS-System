"use client"
import { useEffect } from "react";
import { useState } from "react";

import { MealType } from "@/lib/types";
import MealCard from "@/app/components/app-mealcard";
import { Skeleton } from "@/app/components/ui/skeleton";

export default function Home() {
    const [mealtypes, setMealtypes] = useState<MealType[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // fetch meal types
    useEffect(() => {
        console.log("fetching meal types");
        const fetchData = async () => {
            console.log("fetching meal types 1");
            try {
                const response = await fetch(`/api/mealtypes`);
                console.log("response", response.ok);
                if (response.ok) {
                    const data = await response.json();
                    console.log(data);
                    setMealtypes(data);
                }
            } catch (error) {
                console.error("Failed to fetch links");
            } finally {
                setIsLoading(false);
            }
        }

        fetchData();
    }, []);

    if (isLoading) {
        return (
            <div className="grid grid-cols-5 gap-10 p-10 w-full mb-10">
                {Array.from({ length: 4 }).map((_, i) => (
                    <Skeleton key={i} className="h-48 w-full rounded-lg" />
                ))}
            </div>
        );
    }

    return (
        <div className="flex flex-col">
            <h1 className="sr-only">Build Your Own Meal</h1>
            <div className="grid grid-cols-5 gap-10 p-10 w-full mb-10">
                {mealtypes.filter(item => item.typeName != "Drink" && item.typeName != "A La Carte" && !item.typeName.includes("Party")).map((item, i) => (
                    <a href={`/home/build/${item.typeName}`} key={i}>
                        <MealCard name={item.typeName} image={item.imageFilePath} key={i}/>
                    </a>
                ))}
            </div>
        </div>
    );
}