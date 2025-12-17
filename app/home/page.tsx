"use client";

import MealCard from "../components/app-mealcard";
import { useAccessibilityStyles } from "@/hooks/use-accessibility-styles";
import { ManagerGuard } from "@/app/components/manager-guard";

const options = [
    { href: "build", title: "Build Your Own" },
    { href: "appetizer", title: "Appetizers" },
    { href: "drink", title: "Drinks" },
    { href: "entree", title: "Entrees" },
    { href: "side", title: "Sides" },
];

export default function Home() {
    const { textClasses } = useAccessibilityStyles();

    return (
        <ManagerGuard>
            <div className="flex flex-col">
                <h1 className="sr-only">Menu Options</h1>
                <div className="grid grid-cols-5 gap-10 p-10 w-full mb-10">
                    {options.map((item, i) => (
                        <a href={`/home/${item.href}`} key={i}>
                            <MealCard
                                name={item.title}
                                image={"/images/image.png"}
                            />
                        </a>
                    ))}
                </div>
            </div>
        </ManagerGuard>
    );
}
