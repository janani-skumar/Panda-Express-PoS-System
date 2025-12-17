"use client";

import React from "react";
import { SidebarProvider, SidebarInset } from "@/app/components/ui/sidebar";
import { AppSidebar } from "../components/app-sidebar";
import {
    Sheet,
    SheetContent,
    SheetFooter,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/app/components/ui/sheet";
import { ClientOnly } from "@/app/components/ui/client-only";
import { Button } from "@/app/components/ui/button";
import {
    CreditCard,
    IdCard,
    Mail,
    ShoppingCart,
    Smartphone,
    Trash2,
} from "lucide-react";
import { useState, useMemo, useEffect, useRef } from "react";
import { cn, getCSTTimestamp } from "@/lib/utils";
import { CartProvider, useCart } from "../providers/cart-provider";
import { AccessibilityProvider } from "../providers/accessibility-provider";
import { useAccessibilityStyles } from "@/hooks/use-accessibility-styles";
import { OrderInfo } from "@/lib/types";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { ManagerGuard } from "@/app/components/manager-guard";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/app/components/ui/alert-dialog";

import { fetchWeatherApi } from "openmeteo";

const IDLE_TIMEOUT = 10000; // 10 seconds
const COUNTDOWN_SECONDS = 7; // 7 seconds

function CheckoutContent({ children }: { children: React.ReactNode }) {
    const {
        meals,
        individualItems,
        clearCart,
        removeMeal,
        removeIndividualItem,
    } = useCart();
    const router = useRouter();
    const { textClasses } = useAccessibilityStyles();
    const paymentMethods = [
        { id: 1, name: "Card", icon: CreditCard },
        { id: 2, name: "Student Card", icon: IdCard },
        { id: 3, name: "Mobile Pay", icon: Smartphone },
    ];
    const [selectedPayment, setSelectedPayment] = useState<number | null>(null);
    const [customerEmail, setCustomerEmail] = useState<string>("");

    // Idle detection state
    const [showIdleDialog, setShowIdleDialog] = useState(false);
    const [cancelCountdown, setCancelCountdown] = useState(5);
    const idleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const countdownTimerRef = useRef<ReturnType<typeof setInterval> | null>(
        null
    );

    // Transform cart data to display format
    const orderItems = useMemo(() => {
        const mealItems = meals.map((meal, index) => ({
            id: `meal-${index}`,
            kind: "meal" as const,
            name: meal.mealType,
            components: [
                ...meal.selections.entrees.map((e) => ({
                    name: e.recipeName,
                    premium: Boolean(e.premium),
                })),
                ...meal.selections.sides.map((s) => ({
                    name: s.recipeName,
                    premium: Boolean(s.premium),
                })),
                ...meal.selections.drinks.map((d) => ({
                    name: d.recipeName,
                    premium: Boolean(d.premium),
                })),
            ],
            quantity: meal.quantity,
            price: meal.price,
            premiumUpcharge: meal.premiumUpcharge ?? 0,
        }));

        const individualItemDisplay = individualItems.map((item, index) => ({
            id: `item-${index}`,
            kind: "ala" as const,
            name: item.recipeName,
            quantity: item.quantity,
            price: item.price,
            premiumUpcharge: 0,
            components: [],
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

    const totalItemCount = useMemo(() => {
        const mealsCount = meals.reduce((sum, meal) => sum + meal.quantity, 0);
        const itemsCount = individualItems.reduce(
            (sum, item) => sum + item.quantity,
            0
        );
        return mealsCount + itemsCount;
    }, [meals, individualItems]);

    const handlePay = async () => {
        // If Card payment method is selected, use Stripe checkout
        if (selectedPayment === 1) {
            try {
                const response = await fetch("/api/checkout/create", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        meals: meals,
                        individualItems: individualItems,
                        subtotal: subtotal,
                        tax: tax,
                        total: total,
                        customerEmail: customerEmail.trim() || undefined,
                    }),
                });

                if (!response.ok) {
                    const error = await response.json();
                    toast.error("Failed to create checkout session");
                    console.error(
                        "Failed to create checkout session: " + error.error
                    );
                    return;
                }

                const data = await response.json();
                if (data.url) {
                    // Redirect to Stripe checkout
                    window.location.href = data.url;
                } else {
                    toast.error("Failed to get checkout URL");
                }
            } catch (error) {
                toast.error("Failed to initiate payment");
                console.error("Error initiating Stripe checkout:", error);
            }
            return;
        }

        // For other payment methods, use existing flow
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
                isCompleted: false,
                customerEmail: customerEmail.trim() || undefined,
            }),
        });

        if (response.ok) {
            toast.success("Order placed successfully");
            clearCart();
            console.log();
            router.push("/logout/" + (await response.json()).id);
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

    const handleRemoveItem = (item: (typeof orderItems)[0]) => {
        // Extract index from item.id (format: "meal-0" or "item-0")
        const index = parseInt(item.id.split("-")[1]);

        if (item.kind === "meal") {
            removeMeal(index);
            toast.success("Meal removed from cart");
        } else {
            removeIndividualItem(index);
            toast.success("Item removed from cart");
        }
    };

    const [temperature, setTemperature] = useState<number>();
    const [precipitation, setPrecipitation] = useState<number>();
    const [windSpeed, setWindSpeed] = useState<number>();
    const [windDirection, setWindDirection] = useState<number>();

    // Idle detection: Reset timer on mouse movement
    useEffect(() => {
        const handleMouseMove = () => {
            // Reset the idle timer
            if (idleTimerRef.current) {
                clearTimeout(idleTimerRef.current);
            }

            // If dialog is showing, don't reset
            if (showIdleDialog) {
                return;
            }

            // Set new timer for IDLE_TIMEOUT seconds
            idleTimerRef.current = setTimeout(() => {
                setShowIdleDialog(true);
            }, IDLE_TIMEOUT);
        };

        // Initial timer setup
        handleMouseMove();

        // Add event listener
        window.addEventListener("mousemove", handleMouseMove);

        return () => {
            window.removeEventListener("mousemove", handleMouseMove);
            if (idleTimerRef.current) {
                clearTimeout(idleTimerRef.current);
            }
        };
    }, [showIdleDialog]);

    // Handle countdown timer when idle dialog opens
    useEffect(() => {
        if (!showIdleDialog) {
            // Reset countdown when dialog closes
            setCancelCountdown(COUNTDOWN_SECONDS);
            if (countdownTimerRef.current) {
                clearInterval(countdownTimerRef.current);
                countdownTimerRef.current = null;
            }
            return;
        }

        // Start countdown when dialog opens
        let currentCount = COUNTDOWN_SECONDS;
        setCancelCountdown(COUNTDOWN_SECONDS);

        const interval = setInterval(() => {
            currentCount -= 1;
            setCancelCountdown(currentCount);

            if (currentCount <= 0) {
                clearInterval(interval);
                countdownTimerRef.current = null;
                // Auto-cancel when countdown reaches 0
                Promise.resolve().then(() => {
                    clearCart();
                    router.push("/");
                });
            }
        }, 1000);

        countdownTimerRef.current = interval;

        return () => {
            if (countdownTimerRef.current) {
                clearInterval(countdownTimerRef.current);
                countdownTimerRef.current = null;
            }
        };
    }, [showIdleDialog, clearCart, router]);

    // Handle continue button - reset idle timer and countdown
    const handleContinue = () => {
        setShowIdleDialog(false);
        // Clear countdown timer
        if (countdownTimerRef.current) {
            clearInterval(countdownTimerRef.current);
            countdownTimerRef.current = null;
        }
        setCancelCountdown(COUNTDOWN_SECONDS);
        // Reset the idle timer
        if (idleTimerRef.current) {
            clearTimeout(idleTimerRef.current);
        }
        idleTimerRef.current = setTimeout(() => {
            setShowIdleDialog(true);
        }, 7000);
    };

    // Handle cancel button - immediately cancel
    const handleCancel = () => {
        setShowIdleDialog(false);
        // Clear countdown timer
        if (countdownTimerRef.current) {
            clearInterval(countdownTimerRef.current);
            countdownTimerRef.current = null;
        }
        // Immediately cancel and redirect
        Promise.resolve().then(() => {
            clearCart();
            router.push("/");
        });
    };

    // load weather data
    useEffect(() => {
        const fetchData = async () => {
            const params = {
                latitude: 30.628,
                longitude: -96.3344,
                current: [
                    "temperature_2m",
                    "precipitation",
                    "wind_speed_10m",
                    "wind_direction_10m",
                ],
                timezone: "auto",
                wind_speed_unit: "mph",
                temperature_unit: "fahrenheit",
                precipitation_unit: "inch",
            };
            const url = "https://api.open-meteo.com/v1/forecast";
            const responses = await fetchWeatherApi(url, params);

            // Process first location. Add a for-loop for multiple locations or weather models
            const response = responses[0];
            const utcOffsetSeconds = response.utcOffsetSeconds();
            const current = response.current()!;

            // Note: The order of weather variables in the URL query and the indices below need to match!
            const weatherData = {
                current: {
                    time: new Date(
                        (Number(current.time()) + utcOffsetSeconds) * 1000
                    ),
                    temperature_2m: current.variables(0)!.value(),
                    precipitation: current.variables(1)!.value(),
                    wind_speed_10m: current.variables(2)!.value(),
                    wind_direction_10m: current.variables(3)!.value(),
                },
            };

            setTemperature(weatherData.current.temperature_2m);
            setPrecipitation(weatherData.current.precipitation);
            setWindSpeed(weatherData.current.wind_speed_10m);
            setWindDirection(weatherData.current.wind_direction_10m);
        };

        fetchData();
    }, []);

    return (
        <div className="flex flex-col">
            <AlertDialog open={showIdleDialog} onOpenChange={setShowIdleDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle className={textClasses}>
                            Are you still ordering?
                        </AlertDialogTitle>
                        <AlertDialogDescription className={textClasses}>
                            You haven&apos;t moved your mouse in a while. Are
                            you still placing an order? Your order will be
                            automatically cancelled in {cancelCountdown} second
                            {cancelCountdown !== 1 ? "s" : ""}.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel
                            onClick={handleCancel}
                            className={`bg-tamu-maroon-dark text-white hover:bg-tamu-maroon-dark/90 hover:text-white cursor-pointer font-semibold ${textClasses}`}
                        >
                            Cancel Order ({cancelCountdown})
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleContinue}
                            className={textClasses}
                        >
                            Continue Ordering
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            <SidebarProvider className="h-screen overflow-hidden flex flex-col">
                <div className="flex flex-1 min-h-0 min-w-0">
                    <nav aria-label="Main navigation">
                        <AppSidebar
                            temperature={temperature}
                            precipitation={precipitation}
                            windSpeed={windSpeed}
                            windDirection={windDirection}
                        />
                    </nav>
                    <SidebarInset
                        className="flex-1 flex flex-col min-h-0 min-w-0"
                        aria-label="Main content"
                    >
                        <div className="flex-1 overflow-y-auto overflow-x-auto min-h-0 min-w-0">
                            {children}
                        </div>
                    </SidebarInset>
                </div>
                <footer
                    className="sticky bottom-0 bg-maroon-gradient text-white h-20 flex items-center justify-between px-6 border-t border-white/10 shadow-[0_-4px_20px_rgba(0,0,0,0.15)]"
                    role="contentinfo"
                    aria-label="Footer"
                >
                    {/* Weather Info - Left */}
                    <div className="flex items-center gap-3 min-w-[160px]">
                        <div className="size-10 rounded-lg bg-white/10 flex items-center justify-center">
                            <span className="text-lg">🌤️</span>
                        </div>
                        <div className="flex flex-col text-sm leading-tight">
                            <span
                                className={`font-semibold tracking-wide ${textClasses}`}
                            >
                                {temperature?.toFixed(0)}°F
                            </span>
                            <span
                                className={`text-white/70 text-xs ${textClasses}`}
                            >
                                {precipitation?.toFixed(2)}&quot; rain
                            </span>
                        </div>
                    </div>

                    {/* Cart Summary - Center */}
                    <div className="flex items-center gap-4">
                        {totalItemCount > 0 ? (
                            <div className="flex items-center gap-3 bg-white/10 rounded-xl px-4 py-2 backdrop-blur-sm">
                                <div className="flex items-center gap-2">
                                    <ShoppingCart className="h-5 w-5 text-white/80" />
                                    <span
                                        className={`font-medium ${textClasses}`}
                                    >
                                        {totalItemCount}{" "}
                                        {totalItemCount === 1
                                            ? "item"
                                            : "items"}
                                    </span>
                                </div>
                                <div className="w-px h-6 bg-white/20" />
                                <span
                                    className={`font-bold text-lg ${textClasses}`}
                                >
                                    ${total.toFixed(2)}
                                </span>
                            </div>
                        ) : (
                            <div className="flex items-center gap-2 text-white/60">
                                <ShoppingCart className="h-5 w-5" />
                                <span className={`text-sm ${textClasses}`}>
                                    Your cart is empty
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Checkout Button - Right */}
                    <ClientOnly
                        fallback={
                            <Button
                                className={cn(
                                    "h-12 px-6 font-bold text-lg rounded-xl shadow-lg transition-all duration-300 flex items-center gap-2",
                                    totalItemCount > 0
                                        ? "bg-white text-tamu-maroon hover:bg-white/90 hover:scale-105 hover:shadow-xl"
                                        : "bg-white/20 text-white/80 hover:bg-white/30 cursor-pointer",
                                    textClasses
                                )}
                            >
                                <ShoppingCart className="h-5 w-5" />
                                Checkout
                                {totalItemCount > 0 && (
                                    <span className="ml-1 bg-tamu-maroon text-white text-sm font-bold rounded-full h-6 w-6 flex items-center justify-center">
                                        {totalItemCount}
                                    </span>
                                )}
                            </Button>
                        }
                    >
                        <Sheet>
                            <SheetTrigger asChild>
                                <Button
                                    className={cn(
                                        "h-12 px-6 font-bold text-lg rounded-xl shadow-lg transition-all duration-300 flex items-center gap-2",
                                        totalItemCount > 0
                                            ? "bg-white text-tamu-maroon hover:bg-white/90 hover:scale-105 hover:shadow-xl"
                                            : "bg-white/20 text-white/80 hover:bg-white/30 cursor-pointer",
                                        textClasses
                                    )}
                                >
                                    <ShoppingCart className="h-5 w-5" />
                                    Checkout
                                    {totalItemCount > 0 && (
                                        <span className="ml-1 bg-tamu-maroon text-white text-sm font-bold rounded-full h-6 w-6 flex items-center justify-center">
                                            {totalItemCount}
                                        </span>
                                    )}
                                </Button>
                            </SheetTrigger>
                            <SheetContent className="bg-maroon-gradient text-white border-l border-white/10">
                                <SheetHeader className="border-b border-white/30 p-4">
                                    <SheetTitle
                                        className={`text-2xl text-white ${textClasses}`}
                                    >
                                        Your Order
                                    </SheetTitle>
                                </SheetHeader>

                                        <div className="flex flex-col gap-4 p-4">
                                            <div className="max-h-64 overflow-y-auto rounded-md bg-white/5">
                                                {orderItems.length === 0 ? (
                                                    <div className="px-4 py-8 text-center text-white/70">
                                                        <p
                                                            className={
                                                                textClasses
                                                            }
                                                        >
                                                            Your cart is empty
                                                        </p>
                                                    </div>
                                                ) : (
                                                    <div className="divide-y divide-white/10">
                                                        {orderItems.map(
                                                            (item) => (
                                                                <div
                                                                    key={
                                                                        item.id
                                                                    }
                                                                    className="px-4 py-3 relative"
                                                                >
                                                                    <div className="flex items-center justify-between">
                                                                        <div className="flex items-center gap-2">
                                                                            <span
                                                                                className={`font-semibold ${textClasses}`}
                                                                            >
                                                                                {item.kind ===
                                                                                "meal"
                                                                                    ? item.name
                                                                                    : "Individual A-la-carte"}
                                                                            </span>
                                                                            <span
                                                                                className={`text-xs text-white/70 ${textClasses}`}
                                                                            >
                                                                                {
                                                                                    item.quantity
                                                                                }

                                                                                x
                                                                            </span>
                                                                        </div>
                                                                        <div className="text-right">
                                                                            <span
                                                                                className={`font-medium ${textClasses}`}
                                                                            >
                                                                                $
                                                                                {(
                                                                                    item.price *
                                                                                    item.quantity
                                                                                ).toFixed(
                                                                                    2
                                                                                )}
                                                                            </span>
                                                                        </div>
                                                                    </div>
                                                                    {item.kind ===
                                                                        "meal" && (
                                                                        <ul
                                                                            className={`mt-1 list-disc list-inside text-sm text-white/85 ${textClasses}`}
                                                                        >
                                                                            {item.components.map(
                                                                                (
                                                                                    c
                                                                                ,
                                                                                    idx
                                                                                ) => (
                                                                                    <li
                                                                                        key={`${c.name}-${idx}`}
                                                                                        className="flex items-center gap-2"
                                                                                    >
                                                                                        <span>
                                                                                            {
                                                                                                c.name
                                                                                            }
                                                                                        </span>
                                                                                        {c.premium && (
                                                                                            <span className="text-xs text-amber-200">
                                                                                                +$1.15
                                                                                            </span>
                                                                                        )}
                                                                                    </li>
                                                                                )
                                                                            )}
                                                                        </ul>
                                                                    )}
                                                                    {item.kind ===
                                                                        "ala" && (
                                                                        <div
                                                                            className={`mt-1 text-sm text-white/85 ${textClasses}`}
                                                                        >
                                                                            {
                                                                                item.name
                                                                            }
                                                                        </div>
                                                                    )}
                                                                    <Button
                                                                        onClick={() =>
                                                                            handleRemoveItem(
                                                                                item
                                                                            )
                                                                        }
                                                                        variant="ghost"
                                                                        size="icon"
                                                                        className="absolute bottom-2 right-2 h-6 w-6 text-white/70 hover:text-white hover:bg-white/20 cursor-pointer"
                                                                    >
                                                                        <Trash2 className="h-4 w-4" />
                                                                    </Button>
                                                                </div>
                                                            )
                                                        )}
                                                    </div>
                                                )}
                                            </div>

                                    <div className="space-y-2 rounded-md bg-white/5 p-4">
                                        <div
                                            className={`flex justify-between text-white/90 ${textClasses}`}
                                        >
                                            <span>Subtotal</span>
                                            <span>${subtotal.toFixed(2)}</span>
                                        </div>
                                        <div
                                            className={`flex justify-between text-white/90 ${textClasses}`}
                                        >
                                            <span>Tax</span>
                                            <span>${tax.toFixed(2)}</span>
                                        </div>
                                        <div className="h-px bg-white/20" />
                                        <div
                                            className={`flex justify-between text-lg font-semibold ${textClasses}`}
                                        >
                                            <span>Total</span>
                                            <span>${total.toFixed(2)}</span>
                                        </div>
                                    </div>

                                    {/* Email Input for Notifications */}
                                    <div className="space-y-2">
                                        <p
                                            className={`text-sm uppercase tracking-wide text-white/80 ${textClasses}`}
                                        >
                                            Email Address (optional)
                                        </p>
                                        <p
                                            className={`text-xs text-white/60 ${textClasses}`}
                                        >
                                            Get an email when your order is
                                            ready
                                        </p>
                                        <div className="relative">
                                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/50" />
                                            <input
                                                type="email"
                                                placeholder="you@example.com"
                                                value={customerEmail}
                                                onChange={(e) =>
                                                    setCustomerEmail(
                                                        e.target.value
                                                    )
                                                }
                                                className={`w-full pl-10 pr-4 py-3 rounded-lg bg-white/10 border border-white/20 
                                                        text-white placeholder:text-white/40 focus:outline-none focus:border-white/40
                                                        focus:ring-1 focus:ring-white/30 transition-all duration-200 ${textClasses}`}
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <p
                                            className={`text-sm uppercase tracking-wide text-white/80 ${textClasses}`}
                                        >
                                            Payment method
                                        </p>
                                        <div className="grid grid-cols-2 gap-3">
                                            {paymentMethods.map((method) => (
                                                <Button
                                                    onClick={() =>
                                                        setSelectedPayment(
                                                            method.id
                                                        )
                                                    }
                                                    key={method.id}
                                                    variant="outline"
                                                    className={cn(
                                                        `justify-center border-white/60 bg-white/10 text-white hover:bg-white/20 ${textClasses}`,
                                                        selectedPayment ===
                                                            method.id &&
                                                            "border-white bg-white/20 ring-2 ring-white/80",
                                                        method.id === 3 &&
                                                            "col-span-2"
                                                    )}
                                                >
                                                    <method.icon className="size-4" />
                                                    {method.name}
                                                </Button>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                <SheetFooter className="flex flex-row justify-between items-center border-t border-white/10 bg-white/5 backdrop-blur-sm p-4">
                                    <Button
                                        onClick={handleClearCart}
                                        variant="outline"
                                        className={`bg-tamu-maroon-dark cursor-pointer hover:bg-tamu-maroon-dark/90 hover:text-white border-white/20 hover:border-white/40 transition-all duration-300 ${textClasses}`}
                                    >
                                        <Trash2 className="size-4" />
                                        Clear Cart
                                    </Button>
                                    <Button
                                        disabled={
                                            selectedPayment === null ||
                                            orderItems.length === 0
                                        }
                                        onClick={handlePay}
                                        className={`cursor-pointer bg-white text-tamu-maroon hover:bg-white/90 font-semibold transition-all duration-300 ${textClasses}`}
                                    >
                                        Pay ${total.toFixed(2)}
                                    </Button>
                                </SheetFooter>
                            </SheetContent>
                        </Sheet>
                    </ClientOnly>
                </footer>
            </SidebarProvider>
        </div>
    );
}

export default function Layout({ children }: { children: React.ReactNode }) {
    return (
        <ManagerGuard>
            <AccessibilityProvider>
                <CartProvider>
                    <CheckoutContent>{children}</CheckoutContent>
                </CartProvider>
            </AccessibilityProvider>
        </ManagerGuard>
    );
}
