"use client"
import { useEffect } from "react";
import { useState } from "react";

import { MealType } from "@/lib/types";
import CashierCard from "@/app/components/app-cashier-card";
import { Button } from "@/app/components/ui/button";
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
      <div className="h-full bg-white p-6">
            <div className="mb-6 flex items-center justify-between">
                <Skeleton className="h-8 w-64" />
                <Skeleton className="h-12 w-24" />
            </div>
            <div className="grid sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 max-w-5xl">
                {Array.from({ length: 4 }).map((_, i) => (
                    <Skeleton key={i} className="h-32 w-full rounded-lg" />
                ))}
            </div>
        </div>
    );
  }

  return (
    <div className="h-full bg-white p-6">
            <div className="mb-6 flex items-center justify-between">
                <h1 className="text-2xl font-bold text-neutral-900">
                    Select Meal Type
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
                {mealtypes.filter(item => item.typeName != "Drink" && item.typeName != "A La Carte").map((item, i) => (
                    <a href={`/employee/cashier/build/${item.typeName}`} key={i}>
                      <CashierCard name={item.typeName} />
                    </a>
                ))}
            </div>
        </div>
  );
}