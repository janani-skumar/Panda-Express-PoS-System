"use client";

import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { Order, Cooked } from "@/lib/types";
import { extractRecipeQuantities } from "@/lib/utils";
import { toast } from "sonner";
import { useSWRConfig } from "swr";
import { Trash2 } from "lucide-react";

import { useMemo, useState } from "react";

export function KitchenOrderItem({
    order,
    cooked,
}: {
    order: Order;
    cooked: Cooked[];
}) {
    const { mutate } = useSWRConfig();
    const [isDeleting, setIsDeleting] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    async function completeOrder(id: number): Promise<void> {
        const response = await fetch(`/api/orders/complete/${id}`, {
            method: "PUT",
        });
        if (response.ok) {
            toast.success("Order completed successfully");
            mutate("/api/orders/incomplete");
        } else {
            toast.error("Failed to complete order");
        }
    }

    async function deleteOrder(id: number): Promise<void> {
        setIsDeleting(true);
        try {
            const response = await fetch(`/api/orders/${id}`, {
                method: "DELETE",
            });
            if (response.ok) {
                toast.success("Order deleted successfully");
                mutate("/api/orders/incomplete");
            } else {
                toast.error("Failed to delete order");
            }
        } catch (error) {
            toast.error("Failed to delete order");
        } finally {
            setIsDeleting(false);
            setShowDeleteConfirm(false);
        }
    }

    const orderItems = useMemo(() => {
        if (!order.orderInfo) return [];
        return extractRecipeQuantities(order.orderInfo);
    }, [order]);

    const isReady = useMemo(() => {
        for (const [recipe, quantity] of Object.entries(orderItems)) {
            const stock = cooked.find(
                (c) => +c.recipeId === +recipe
            )?.currentStock;

            if (!stock || quantity > stock) {
                return false;
            }
        }
        return true;
    }, [orderItems, cooked]);

    return (
        <div className="w-full max-w-md mx-auto">
            <Card className="border-2 border-black">
                {/* Header - Order Number and Time */}
                <CardHeader className="border-b-2 border-black pb-1.5 pt-3 px-3">
                    <div className="flex justify-between items-start">
                        <CardTitle className="text-xl font-bold">
                            ORDER #{order.id}
                        </CardTitle>
                        <span className="text-xs font-mono">
                            {new Date(order.orderTime).toLocaleDateString(
                                "en-US",
                                {
                                    month: "long",
                                    day: "numeric",
                                    year: "numeric",
                                }
                            ) +
                                " " +
                                new Date(order.orderTime).toLocaleTimeString(
                                    "en-US",
                                    { hour: "2-digit", minute: "2-digit" }
                                )}
                        </span>
                    </div>
                </CardHeader>

                {/* Items */}
                <CardContent className="px-3 py-2">
                    <div className="border-b-2 border-black pb-2 mb-2">
                        <div className="space-y-1">
                            {order.orderInfo?.meals.map((item, i) => (
                                <div
                                    key={i}
                                    className="flex justify-between items-start gap-1"
                                >
                                    <div className="flex-1">
                                        <div className="font-bold text-sm">
                                            {item.quantity}x {item.mealType}
                                        </div>
                                        {item.selections.entrees.map(
                                            (entree, j) => (
                                                <div
                                                    className="text-[10px] text-muted-foreground leading-tight"
                                                    key={j}
                                                >
                                                    • {entree.recipeName}
                                                </div>
                                            )
                                        )}
                                        {item.selections.sides.map(
                                            (side, j) => (
                                                <div
                                                    className="text-[10px] text-muted-foreground leading-tight"
                                                    key={j}
                                                >
                                                    • {side.recipeName}
                                                </div>
                                            )
                                        )}
                                        {item.selections.drinks.map(
                                            (drink, j) => (
                                                <div
                                                    className="text-[10px] text-muted-foreground leading-tight"
                                                    key={j}
                                                >
                                                    • {drink.recipeName}
                                                </div>
                                            )
                                        )}
                                    </div>
                                </div>
                            ))}
                            {order.orderInfo?.individualItems.map((item) => (
                                <div
                                    key={item.recipeName}
                                    className="flex justify-between items-start gap-1"
                                >
                                    <div className="flex-1">
                                        <div className="font-bold text-sm">
                                            {item.quantity}x {item.recipeName}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Footer Info */}
                    <div className="space-y-0.5 text-xs mb-3 font-mono">
                        <div className="flex justify-between">
                            <span>Cashier ID:</span>
                            <span>{order.cashierId}</span>
                        </div>
                        <div className="border-t-2 border-black pt-1.5 mt-1.5 flex justify-between font-bold">
                            <span>Total Items:</span>
                            <span>
                                {(order.orderInfo?.individualItems?.reduce(
                                    (sum, item) => sum + item.quantity,
                                    0
                                ) ?? 0) +
                                    (order.orderInfo?.meals?.reduce(
                                        (sum, item) => sum + item.quantity,
                                        0
                                    ) ?? 0)}
                            </span>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                        {isReady ? (
                            <Button
                                className="flex-1 font-bold text-sm py-4 bg-black text-white hover:bg-gray-800"
                                onClick={async () =>
                                    await completeOrder(order.id)
                                }
                            >
                                COMPLETE ORDER
                            </Button>
                        ) : (
                            <Button
                                className="flex-1 font-bold text-sm py-4 bg-black text-white hover:bg-gray-800"
                                disabled
                            >
                                COMPLETE ORDER
                            </Button>
                        )}

                        {showDeleteConfirm ? (
                            <div className="flex gap-1">
                                <Button
                                    className="font-bold text-sm py-4 bg-red-600 text-white hover:bg-red-700"
                                    onClick={async () =>
                                        await deleteOrder(order.id)
                                    }
                                    disabled={isDeleting}
                                >
                                    {isDeleting ? "..." : "YES"}
                                </Button>
                                <Button
                                    className="font-bold text-sm py-4 bg-gray-500 text-white hover:bg-gray-600"
                                    onClick={() => setShowDeleteConfirm(false)}
                                    disabled={isDeleting}
                                >
                                    NO
                                </Button>
                            </div>
                        ) : (
                            <Button
                                className="font-bold text-sm py-4 bg-red-600 text-white hover:bg-red-700"
                                onClick={() => setShowDeleteConfirm(true)}
                            >
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
