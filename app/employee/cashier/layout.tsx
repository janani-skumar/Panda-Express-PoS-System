"use client";

import React from "react";
import { Button } from "@/app/components/ui/button";
import { CreditCard, IdCard, Trash2 } from "lucide-react";
import { useState, useMemo, useEffect } from "react";
import { cn, getCSTTimestamp } from "@/lib/utils";
import { CartProvider, useCart } from "@/app/providers/cart-provider";
import { OrderInfo } from "@/lib/types";
import { toast } from "sonner";
import { fetchWeatherApi } from "openmeteo";
import Link from "next/link";

function CheckoutContent({ children }: { children: React.ReactNode }) {
    const { meals, individualItems, clearCart, removeMeal, removeIndividualItem } = useCart();
    const paymentMethods = [
        { id: 1, name: "Card", icon: CreditCard },
        { id: 2, name: "Student Card", icon: IdCard },
    ];
    const [selectedPayment, setSelectedPayment] = useState<number | null>(null);

    // Transform cart data to display format
    const orderItems = useMemo(() => {
        const mealItems = meals.map((meal, index) => ({
            id: `meal-${index}`,
            kind: "meal" as const,
            name: meal.mealType,
            components: [
                ...meal.selections.entrees.map((e) => e.recipeName),
                ...meal.selections.sides.map((s) => s.recipeName),
                ...meal.selections.drinks.map((d) => d.recipeName),
            ],
            quantity: meal.quantity,
            price: meal.price,
        }));

        const individualItemDisplay = individualItems.map((item, index) => ({
            id: `item-${index}`,
            kind: "ala" as const,
            name: item.recipeName,
            quantity: item.quantity,
            price: item.price,
        }));

        return [...mealItems, ...individualItemDisplay];
    }, [meals, individualItems]);

    const subtotal = useMemo(() => {
        const mealsTotal = meals.reduce(
            (sum, meal) => sum + meal.price * meal.quantity,
            0
        );
        const itemsTotal = individualItems.reduce(
            (sum, item) => sum + item.price * item.quantity,
            0
        );
        return mealsTotal + itemsTotal;
    }, [meals, individualItems]);

    const tax = useMemo(() => +(subtotal * 0.095).toFixed(2), [subtotal]);
    const total = useMemo(() => +(subtotal + tax).toFixed(2), [subtotal, tax]);

    const handlePay = async () => {
        const orderInfo: OrderInfo = {
            meals: meals,
            individualItems: individualItems,
        };
        const response = await fetch("/api/orders", {
            method: "POST",
            body: JSON.stringify({
                tax: tax,
                totalCost: total,
                orderTime: getCSTTimestamp(),
                cashierId: 2,
                orderInfo: orderInfo,
                isCompleted: true,
            }),
        });

        if (response.ok) {
            toast.success("Order placed successfully");
            clearCart();
        } else {
            const error = await response.json();
            toast.error("Failed to place order");
            console.error("Failed to place order: " + error.error);
        }
    };

    const handleClearCart = () => {
        clearCart();    
        toast.success("Cart cleared successfully");
    };

    const handleRemoveItem = (item: typeof orderItems[0]) => {
        const index = parseInt(item.id.split("-")[1]);
        
        if (item.kind === "meal") {
            removeMeal(index);
            toast.success("Meal removed from cart");
        } else {
            removeIndividualItem(index);
            toast.success("Item removed from cart");
        }
    };

    // load weather data
    useEffect(() => {
        const fetchData = async () => {
            const params = {
                latitude: 30.628,
                longitude: -96.3344,
                current: ["temperature_2m", "precipitation", "wind_speed_10m", "wind_direction_10m"],
                timezone: "auto",
                wind_speed_unit: "mph",
                temperature_unit: "fahrenheit",
                precipitation_unit: "inch",
            };
            const url = "https://api.open-meteo.com/v1/forecast";
            const responses = await fetchWeatherApi(url, params);

            const response = responses[0];
            const utcOffsetSeconds = response.utcOffsetSeconds();
            const current = response.current()!;

            const weatherData = {
                current: {
                    time: new Date((Number(current.time()) + utcOffsetSeconds) * 1000),
                    temperature_2m: current.variables(0)!.value(),
                    precipitation: current.variables(1)!.value(),
                    wind_speed_10m: current.variables(2)!.value(),
                    wind_direction_10m: current.variables(3)!.value(),
                },
            };
        }

        fetchData();
    }, []);

    return (
        <div className="flex h-screen bg-neutral-50">
            {/* Main Content Area */}
            <main className="flex-1 overflow-y-auto bg-white">
                {children}
            </main>

            {/* Right Side Order Panel */}
            <div className="w-96 bg-neutral-100 border-l-4 border-tamu-maroon flex flex-col">
                {/* Order Header */}
                <div className="bg-tamu-maroon text-white p-3 flex items-center justify-between">
                    <h2 className="text-lg font-bold">Current Order</h2>
                    <Link
                        href="/employee/kitchen"
                        className="px-3 py-1.5 bg-white hover:bg-white/90 text-tamu-maroon rounded-lg transition text-sm font-semibold"
                    >
                        Kitchen
                    </Link>
                </div>

                {/* Order Items */}
                <div className="flex-1 overflow-y-auto p-4">
                    {orderItems.length === 0 ? (
                        <div className="flex items-center justify-center h-full">
                            <p className="text-neutral-600 text-center">
                                No items in cart
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {orderItems.map((item) => (
                                <div
                                    key={item.id}
                                    className="bg-white rounded-lg p-3 shadow-sm border border-neutral-200 relative"
                                >
                                    <div className="flex items-start justify-between mb-2">
                                        <div className="flex-1 pr-8">
                                            <div className="flex items-center gap-2">
                                                <span className="font-bold text-neutral-900">
                                                    {item.kind === "meal"
                                                        ? item.name
                                                        : "A-la-carte"}
                                                </span>
                                                <span className="text-sm bg-neutral-200 px-2 py-0.5 rounded">
                                                    x{item.quantity}
                                                </span>
                                            </div>
                                            {item.kind === "ala" && (
                                                <p className="text-sm text-neutral-600 mt-1">
                                                    {item.name}
                                                </p>
                                            )}
                                        </div>
                                        <div className="font-bold text-neutral-900">
                                            ${(item.price * item.quantity).toFixed(2)}
                                        </div>
                                    </div>
                                    
                                    {item.kind === "meal" && (
                                        <ul className="text-sm text-neutral-600 space-y-1 ml-2">
                                            {item.components.map((c, idx) => (
                                                <li key={idx} className="flex items-start">
                                                    <span className="mr-2">•</span>
                                                    <span>{c}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                    
                                    <Button
                                        onClick={() => handleRemoveItem(item)}
                                        variant="ghost"
                                        size="icon"
                                        className="absolute bottom-2 right-2 h-7 w-7 text-neutral-500 hover:text-tamu-maroon hover:bg-tamu-maroon/10"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Order Summary */}
                <div className="border-t-2 border-neutral-300 bg-white p-3 space-y-3">
                    <div className="space-y-2 text-sm">
                        <div className="flex justify-between text-neutral-700">
                            <span>Subtotal</span>
                            <span className="font-semibold">${subtotal.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-neutral-700">
                            <span>Tax (8.25%)</span>
                            <span className="font-semibold">${tax.toFixed(2)}</span>
                        </div>
                        <div className="h-px bg-neutral-300" />
                        <div className="flex justify-between text-lg font-bold text-neutral-900">
                            <span>Total</span>
                            <span>${total.toFixed(2)}</span>
                        </div>
                    </div>

                    {/* Payment + Action Grid */}
                    <div className="grid grid-cols-2 gap-2 mt-2">
                        {/* Card */}
                        <Button
                            onClick={() => setSelectedPayment(1)}
                            variant="outline"
                            className={cn(
                                "h-12 justify-center border-2 bg-white text-neutral-700 hover:bg-neutral-50 font-semibold",
                                selectedPayment === 1 &&
                                    "border-tamu-maroon bg-tamu-maroon/10 text-tamu-maroon ring-2 ring-tamu-maroon ring-offset-1"
                            )}
                        >
                            <CreditCard className="h-4 w-4 mr-1" />
                            Card
                        </Button>

                        {/* Student Card */}
                        <Button
                            onClick={() => setSelectedPayment(2)}
                            variant="outline"
                            className={cn(
                                "h-12 justify-center border-2 bg-white text-neutral-700 hover:bg-neutral-50 font-semibold",
                                selectedPayment === 2 &&
                                    "border-tamu-maroon bg-tamu-maroon/10 text-tamu-maroon ring-2 ring-tamu-maroon ring-offset-1"
                            )}
                        >
                            <IdCard className="h-4 w-4 mr-1" />
                            Student
                        </Button>

                        {/* Clear */}
                        <Button
                            onClick={handleClearCart}
                            variant="outline"
                            className="h-12 w-full border-2 border-neutral-300 bg-white text-neutral-700 hover:bg-neutral-100 font-semibold"
                        >
                            <Trash2 className="h-4 w-4 mr-1" />
                            Clear
                        </Button>

                        {/* Pay */}
                        <Button
                            disabled={selectedPayment === null || orderItems.length === 0}
                            onClick={handlePay}
                            className="h-12 w-full bg-tamu-maroon hover:bg-tamu-maroon-dark text-white font-bold disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-300"
                        >
                            Pay ${total.toFixed(2)}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function Layout({ children }: { children: React.ReactNode }) {
    return (
        <CartProvider>
            <CheckoutContent>{children}</CheckoutContent>
        </CartProvider>
    );
}