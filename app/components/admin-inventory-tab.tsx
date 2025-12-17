"use client";

import React from "react";
import { toast } from "sonner";
import { Button } from "@/app/components/ui/button";
import { getCSTTimestamp, sortData } from "@/lib/utils";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/app/components/ui/dialog";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import {
    Table,
    TableBody,
    TableCaption,
    TableHead,
    TableHeader,
    TableRow,
    TableCell,
} from "@/app/components/ui/table";
import { Inventory } from "@/lib/types";
import { parseApiError } from "@/app/components/admin-error-utils";

type InventoryItem = Inventory;

export default function AdminInventoryTab() {
    const [inventory, setInventory] = React.useState<InventoryItem[]>([]);
    const [invDialogOpen, setInvDialogOpen] = React.useState(false);
    const [restockDialogOpen, setRestockDialogOpen] = React.useState(false);
    const [selectedInventory, setSelectedInventory] =
        React.useState<InventoryItem | null>(null);
    const [restockQuantity, setRestockQuantity] = React.useState<number>(0);
    const [invLoading, setInvLoading] = React.useState(false);
    const [invError, setInvError] = React.useState<string | null>(null);
    const [sortColumn, setSortColumn] = React.useState<
        keyof InventoryItem | null
    >(null);
    const [sortDirection, setSortDirection] = React.useState<"asc" | "desc">(
        "asc"
    );

    async function fetchInventory() {
        try {
            setInvLoading(true);
            setInvError(null);

            const res = await fetch("/api/inventory");
            if (!res.ok) {
                const text = await res.text();
                throw new Error(text || "Failed to fetch inventory");
            }

            const data = await res.json();
            setInventory(data ?? []);
        } catch (err: unknown) {
            setInvError(err instanceof Error ? err.message : "Unknown error");
        } finally {
            setInvLoading(false);
        }
    }

    React.useEffect(() => {
        void fetchInventory();
    }, []);

    function openNewInventoryDialog() {
        setSelectedInventory({
            name: "",
            batchPurchaseCost: 0,
            currentStock: 0,
            estimatedUsedPerDay: 0,
        });
        setInvError(null);
        setInvDialogOpen(true);
    }

    function openEditInventoryDialog(inv: InventoryItem) {
        setSelectedInventory({ ...inv });
        setInvError(null);
        setInvDialogOpen(true);
    }

    function openRestockDialog(inv: InventoryItem) {
        setSelectedInventory({ ...inv });
        setRestockQuantity(0);
        setInvError(null);
        setRestockDialogOpen(true);
    }

    function updateSelectedInventory<K extends keyof InventoryItem>(
        key: K,
        value: InventoryItem[K]
    ) {
        setSelectedInventory((prev) =>
            prev ? { ...prev, [key]: value } : prev
        );
    }

    async function saveInventory() {
        if (!selectedInventory) return;

        try {
            setInvLoading(true);
            setInvError(null);

            const { id, ...payload } = selectedInventory;
            const isNew = id === undefined || id === null;

            const res = await fetch(
                isNew ? "/api/inventory" : `/api/inventory/${id}`,
                {
                    method: isNew ? "POST" : "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload),
                }
            );

            if (!res.ok) {
                const parsed = await parseApiError(res);
                setInvError(parsed.message);
                toast.error(parsed.message);
                return;
            }

            await fetchInventory();
            setInvDialogOpen(false);
        } catch (err: unknown) {
            const message =
                err instanceof Error ? err.message : "Unknown error";
            setInvError(message);
            toast.error(message);
        } finally {
            setInvLoading(false);
        }
    }

    async function restockInventory() {
        if (!selectedInventory || selectedInventory.id == null) return;
        if (restockQuantity <= 0) {
            setInvError("Restock quantity must be greater than 0");
            return;
        }

        try {
            setInvLoading(true);
            setInvError(null);

            // Update inventory stock
            const newStock = selectedInventory.currentStock + restockQuantity;
            const res = await fetch(`/api/inventory/${selectedInventory.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ currentStock: newStock }),
            });

            if (!res.ok) {
                const parsed = await parseApiError(res);
                setInvError(parsed.message);
                toast.error(parsed.message);
                return;
            }

            // Create expense record
            const expenseRes = await fetch("/api/expenses", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    cost: selectedInventory.batchPurchaseCost,
                    itemId: selectedInventory.id,
                    expenseTime: getCSTTimestamp(),
                }),
            });

            if (!expenseRes.ok) {
                console.warn("Failed to create expense record");
            }

            await fetchInventory();
            setRestockDialogOpen(false);
        } catch (err: unknown) {
            setInvError(err instanceof Error ? err.message : "Unknown error");
        } finally {
            setInvLoading(false);
        }
    }

    async function deleteInventory() {
        if (!selectedInventory || selectedInventory.id == null) return;
        if (!confirm(`Delete inventory item "${selectedInventory.name}"?`))
            return;

        try {
            setInvLoading(true);
            setInvError(null);

            const res = await fetch(`/api/inventory/${selectedInventory.id}`, {
                method: "DELETE",
            });

            if (!res.ok) {
                const parsed = await parseApiError(res);
                setInvError(parsed.message);
                toast.error(parsed.message);
                return;
            }

            await fetchInventory();
            setInvDialogOpen(false);
        } catch (err: unknown) {
            const message =
                err instanceof Error ? err.message : "Unknown error";
            setInvError(message);
            toast.error(message);
        } finally {
            setInvLoading(false);
        }
    }

    function handleSort(column: keyof InventoryItem) {
        if (sortColumn === column) {
            setSortDirection(sortDirection === "asc" ? "desc" : "asc");
        } else {
            setSortColumn(column);
            setSortDirection("asc");
        }
    }

    const sortedInventory = sortColumn
        ? sortData(inventory, sortColumn, sortDirection)
        : inventory;

    return (
        <div className="mt-6 space-y-4">
            <div className="flex justify-between items-center">
                <h2 className="text-lg font-semibold">Inventory Items</h2>
                <Button
                    onClick={openNewInventoryDialog}
                    className="bg-primary hover:bg-primary/90"
                >
                    Add New Item
                </Button>
            </div>

            {invLoading && inventory.length === 0 && (
                <p className="text-sm text-muted-foreground">
                    Loading inventory…
                </p>
            )}

            {invError && <p className="text-sm text-red-500">{invError}</p>}

            <Table aria-label="Inventory table">
                <TableCaption className="sr-only">Buy Inventory</TableCaption>
                <TableHeader>
                    <TableRow>
                        <TableHead>
                            <button
                                onClick={() => handleSort("name")}
                                className="flex items-center gap-1 hover:text-primary cursor-pointer"
                            >
                                Name
                                {sortColumn === "name" && (
                                    <span>
                                        {sortDirection === "asc" ? "↑" : "↓"}
                                    </span>
                                )}
                            </button>
                        </TableHead>
                        <TableHead>
                            <button
                                onClick={() => handleSort("currentStock")}
                                className="flex items-center gap-1 hover:text-primary cursor-pointer"
                            >
                                Current Stock
                                {sortColumn === "currentStock" && (
                                    <span>
                                        {sortDirection === "asc" ? "↑" : "↓"}
                                    </span>
                                )}
                            </button>
                        </TableHead>
                        <TableHead>
                            <button
                                onClick={() => handleSort("batchPurchaseCost")}
                                className="flex items-center gap-1 hover:text-primary cursor-pointer"
                            >
                                Batch Cost
                                {sortColumn === "batchPurchaseCost" && (
                                    <span>
                                        {sortDirection === "asc" ? "↑" : "↓"}
                                    </span>
                                )}
                            </button>
                        </TableHead>
                        <TableHead>
                            <button
                                onClick={() =>
                                    handleSort("estimatedUsedPerDay")
                                }
                                className="flex items-center gap-1 hover:text-primary cursor-pointer"
                            >
                                Est. Daily Use
                                {sortColumn === "estimatedUsedPerDay" && (
                                    <span>
                                        {sortDirection === "asc" ? "↑" : "↓"}
                                    </span>
                                )}
                            </button>
                        </TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {sortedInventory.length === 0 && !invLoading && (
                        <TableRow>
                            <TableCell
                                colSpan={5}
                                className="text-center text-sm"
                            >
                                No inventory items found.
                            </TableCell>
                        </TableRow>
                    )}

                    {sortedInventory.map((inv) => (
                        <TableRow key={inv.id}>
                            <TableCell>{inv.name}</TableCell>
                            <TableCell>{inv.currentStock}</TableCell>
                            <TableCell>
                                ${inv.batchPurchaseCost.toFixed(2)}
                            </TableCell>
                            <TableCell>{inv.estimatedUsedPerDay}</TableCell>
                            <TableCell className="text-right space-x-2">
                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => openEditInventoryDialog(inv)}
                                >
                                    Edit
                                </Button>
                                <Button
                                    size="sm"
                                    className="bg-green-600 hover:bg-green-700"
                                    onClick={() => openRestockDialog(inv)}
                                >
                                    Restock
                                </Button>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>

            {/* Add/Edit Inventory Dialog */}
            <Dialog open={invDialogOpen} onOpenChange={setInvDialogOpen}>
                <DialogContent className="max-w-xl">
                    <DialogHeader>
                        <DialogTitle>
                            {selectedInventory?.id
                                ? `Edit Inventory Item #${selectedInventory.id}`
                                : "Add Inventory Item"}
                        </DialogTitle>
                        <DialogDescription>
                            Enter inventory item details.
                        </DialogDescription>
                    </DialogHeader>

                    {selectedInventory && (
                        <div className="space-y-4 mt-4">
                            {invError && (
                                <p className="text-sm text-red-500">
                                    {invError}
                                </p>
                            )}

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1 md:col-span-2">
                                    <Label htmlFor="inv-name">Name</Label>
                                    <Input
                                        id="inv-name"
                                        value={selectedInventory.name}
                                        onChange={(e) =>
                                            updateSelectedInventory(
                                                "name",
                                                e.target.value
                                            )
                                        }
                                    />
                                </div>

                                <div className="space-y-1">
                                    <Label htmlFor="inv-cost">
                                        Batch Purchase Cost
                                    </Label>
                                    <Input
                                        id="inv-cost"
                                        type="number"
                                        step={0.01}
                                        placeholder="0.00"
                                        value={
                                            selectedInventory.batchPurchaseCost ===
                                            0
                                                ? ""
                                                : selectedInventory.batchPurchaseCost
                                        }
                                        onChange={(e) => {
                                            const value =
                                                e.target.value === ""
                                                    ? 0
                                                    : Number(e.target.value);
                                            updateSelectedInventory(
                                                "batchPurchaseCost",
                                                value
                                            );
                                        }}
                                    />
                                </div>

                                <div className="space-y-1">
                                    <Label htmlFor="inv-stock">
                                        Current Stock
                                    </Label>
                                    <Input
                                        id="inv-stock"
                                        type="number"
                                        value={
                                            selectedInventory.currentStock === 0
                                                ? ""
                                                : selectedInventory.currentStock
                                        }
                                        onChange={(e) =>
                                            updateSelectedInventory(
                                                "currentStock",
                                                e.target.value === ""
                                                    ? 0
                                                    : Number(e.target.value) ||
                                                          0
                                            )
                                        }
                                        placeholder="0"
                                    />
                                </div>

                                <div className="space-y-1 md:col-span-2">
                                    <Label htmlFor="inv-daily">
                                        Estimated Used Per Day
                                    </Label>
                                    <Input
                                        id="inv-daily"
                                        type="number"
                                        value={
                                            selectedInventory.estimatedUsedPerDay ===
                                            0
                                                ? ""
                                                : selectedInventory.estimatedUsedPerDay
                                        }
                                        onChange={(e) =>
                                            updateSelectedInventory(
                                                "estimatedUsedPerDay",
                                                e.target.value === ""
                                                    ? 0
                                                    : Number(e.target.value) ||
                                                          0
                                            )
                                        }
                                        placeholder="0"
                                    />
                                </div>
                            </div>

                            <div className="flex justify-between items-center pt-4">
                                {selectedInventory.id && (
                                    <Button
                                        type="button"
                                        variant="destructive"
                                        onClick={deleteInventory}
                                        disabled={invLoading}
                                    >
                                        Delete
                                    </Button>
                                )}

                                <div className="ml-auto flex gap-2">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => setInvDialogOpen(false)}
                                        disabled={invLoading}
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        type="button"
                                        className="bg-primary hover:bg-primary/90"
                                        onClick={saveInventory}
                                        disabled={invLoading}
                                    >
                                        {invLoading ? "Saving..." : "Save"}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            {/* Restock Dialog */}
            <Dialog
                open={restockDialogOpen}
                onOpenChange={setRestockDialogOpen}
            >
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>
                            Restock {selectedInventory?.name}
                        </DialogTitle>
                        <DialogDescription>
                            Enter the quantity to add to current stock. This
                            will also create an expense record.
                        </DialogDescription>
                    </DialogHeader>

                    {selectedInventory && (
                        <div className="space-y-4 mt-4">
                            {invError && (
                                <p className="text-sm text-red-500">
                                    {invError}
                                </p>
                            )}

                            <div className="space-y-2">
                                <p className="text-sm">
                                    Current Stock:{" "}
                                    <span className="font-semibold">
                                        {selectedInventory.currentStock}
                                    </span>
                                </p>
                                <p className="text-sm">
                                    Batch Cost:{" "}
                                    <span className="font-semibold">
                                        $
                                        {selectedInventory.batchPurchaseCost.toFixed(
                                            2
                                        )}
                                    </span>
                                </p>
                            </div>

                            <div className="space-y-1">
                                <Label htmlFor="restock-qty">
                                    Restock Quantity
                                </Label>
                                <Input
                                    id="restock-qty"
                                    type="number"
                                    value={
                                        restockQuantity === 0
                                            ? ""
                                            : restockQuantity
                                    }
                                    onChange={(e) =>
                                        setRestockQuantity(
                                            e.target.value === ""
                                                ? 0
                                                : Number(e.target.value) || 0
                                        )
                                    }
                                    placeholder="0"
                                />
                            </div>

                            {restockQuantity > 0 && (
                                <p className="text-sm">
                                    New Stock:{" "}
                                    <span className="font-semibold">
                                        {selectedInventory.currentStock +
                                            restockQuantity}
                                    </span>
                                </p>
                            )}

                            <div className="flex justify-end gap-2 pt-4">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setRestockDialogOpen(false)}
                                    disabled={invLoading}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="button"
                                    className="bg-green-600 hover:bg-green-700"
                                    onClick={restockInventory}
                                    disabled={invLoading}
                                >
                                    {invLoading ? "Restocking..." : "Restock"}
                                </Button>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
