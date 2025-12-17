"use client";

import CashierCard from "@/app/components/app-cashier-card";
import { Button } from "@/app/components/ui/button";

const options: {
  href: string,
  title: string
}[] = [
  {href: 'build', title: 'Build Your Own'},
  {href: 'appetizer', title: 'Appetizers'},
  {href: 'drink', title: 'Drinks'},
  {href: 'entree', title: 'Entrees'},
  {href: 'side', title: 'Sides'}
]

export default function Home() {
    return (
        <div className="h-full bg-white p-6">
            <div className="mb-6 flex items-center justify-between">
                <h1 className="text-2xl font-bold text-neutral-900">
                    Select Category
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
                {options.map((item, i) => (
                    <a href={`/employee/cashier/${item.href}`} key={i}>
                        <CashierCard name={item.title} />
                    </a>
                ))}
            </div>
        </div>
    );
}