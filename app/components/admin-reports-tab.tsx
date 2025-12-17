"use client";

import React from "react";
import { Button } from "@/app/components/ui/button";
import { getTodayDateCST, sortData } from "@/lib/utils";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/app/components/ui/accordion";
import {
    Table,
    TableBody,
    TableCaption,
    TableHead,
    TableHeader,
    TableRow,
    TableCell,
} from "@/app/components/ui/table";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";

// Type definitions
type ProductUsageRow = {
    inventoryId: number;
    inventoryName: string;
    totalUsed: number;
};

type SalesByItemRow = {
    recipeId: number;
    recipeName: string;
    recipeType: string;
    totalQuantity: number;
    totalRevenue: number;
};

type HourlyRow = {
    hour: number;
    netSales: number;
};

type RestockRow = {
    id: number;
    name: string;
    currentStock: number;
    estimatedUsedPerDay: number;
    needsRestock: boolean;
};

export default function AdminReportsTab() {
    // Product Usage state
    const [productUsageData, setProductUsageData] = React.useState<
        ProductUsageRow[] | null
    >(null);
    const [productUsageLoading, setProductUsageLoading] = React.useState(false);
    const [productUsageError, setProductUsageError] = React.useState<
        string | null
    >(null);
    const [productUsageStartDate, setProductUsageStartDate] =
        React.useState("");
    const [productUsageEndDate, setProductUsageEndDate] = React.useState("");

    // Sales By Item state
    const [salesByItemData, setSalesByItemData] = React.useState<
        SalesByItemRow[] | null
    >(null);
    const [salesByItemLoading, setSalesByItemLoading] = React.useState(false);
    const [salesByItemError, setSalesByItemError] = React.useState<
        string | null
    >(null);
    const [salesByItemStartDate, setSalesByItemStartDate] = React.useState("");
    const [salesByItemEndDate, setSalesByItemEndDate] = React.useState("");

    // X-Report state
    const [xReportData, setXReportData] = React.useState<HourlyRow[] | null>(
        null
    );
    const [xReportLoading, setXReportLoading] = React.useState(false);
    const [xReportError, setXReportError] = React.useState<string | null>(null);

    // Z-Report state
    const [zReportData, setZReportData] = React.useState<HourlyRow[] | null>(
        null
    );
    const [zReportLoading, setZReportLoading] = React.useState(false);
    const [zReportError, setZReportError] = React.useState<string | null>(null);
    const [zReportResetLoading, setZReportResetLoading] = React.useState(false);
    const [zReportHasBeenRunToday, setZReportHasBeenRunToday] =
        React.useState(false);
    const [zReportLastRunInfo, setZReportLastRunInfo] = React.useState<{
        timestamp: string;
        runBy: number | null;
    } | null>(null);

    // Restock Report state
    const [restockData, setRestockData] = React.useState<RestockRow[] | null>(
        null
    );
    const [restockLoading, setRestockLoading] = React.useState(false);
    const [restockError, setRestockError] = React.useState<string | null>(null);

    // Sorting state for each table
    const [productUsageSort, setProductUsageSort] = React.useState<{
        column: keyof ProductUsageRow | null;
        direction: "asc" | "desc";
    }>({ column: null, direction: "asc" });
    const [salesByItemSort, setSalesByItemSort] = React.useState<{
        column: keyof SalesByItemRow | null;
        direction: "asc" | "desc";
    }>({ column: null, direction: "asc" });
    const [xReportSort, setXReportSort] = React.useState<{
        column: keyof HourlyRow | null;
        direction: "asc" | "desc";
    }>({ column: null, direction: "asc" });
    const [zReportSort, setZReportSort] = React.useState<{
        column: keyof HourlyRow | null;
        direction: "asc" | "desc";
    }>({ column: null, direction: "asc" });
    const [restockSort, setRestockSort] = React.useState<{
        column: keyof RestockRow | null;
        direction: "asc" | "desc";
    }>({ column: null, direction: "asc" });

    // Fetch functions
    async function fetchProductUsage() {
        if (!productUsageStartDate || !productUsageEndDate) {
            setProductUsageError("Please select both start and end dates");
            return;
        }

        try {
            setProductUsageLoading(true);
            setProductUsageError(null);
            setProductUsageData(null);

            const res = await fetch(
                `/api/reports/product-usage?startDate=${productUsageStartDate}&endDate=${productUsageEndDate}`
            );

            if (!res.ok) {
                const text = await res.text();
                throw new Error(text || "Failed to fetch product usage report");
            }

            const data = await res.json();
            setProductUsageData(data);
        } catch (err: unknown) {
            setProductUsageError(
                err instanceof Error ? err.message : "Unknown error"
            );
        } finally {
            setProductUsageLoading(false);
        }
    }

    async function fetchSalesByItem() {
        if (!salesByItemStartDate || !salesByItemEndDate) {
            setSalesByItemError("Please select both start and end dates");
            return;
        }

        try {
            setSalesByItemLoading(true);
            setSalesByItemError(null);
            setSalesByItemData(null);

            const res = await fetch(
                `/api/reports/sales-by-item?startDate=${salesByItemStartDate}&endDate=${salesByItemEndDate}`
            );

            if (!res.ok) {
                const text = await res.text();
                throw new Error(text || "Failed to fetch sales by item report");
            }

            const data = await res.json();
            setSalesByItemData(data);
        } catch (err: unknown) {
            setSalesByItemError(
                err instanceof Error ? err.message : "Unknown error"
            );
        } finally {
            setSalesByItemLoading(false);
        }
    }

    async function fetchXReport() {
        try {
            setXReportLoading(true);
            setXReportError(null);
            setXReportData(null);

            const res = await fetch(
                `/api/reports/x-report?startHour=0&endHour=23`
            );

            if (!res.ok) {
                const text = await res.text();
                throw new Error(text || "Failed to fetch X-report");
            }

            const data = await res.json();

            const normalized: HourlyRow[] = (data ?? []).map(
                (row: { hour: number; netSales: number }) => ({
                    hour: Number(row.hour),
                    netSales: Number(row.netSales) || 0,
                })
            );

            setXReportData(normalized);
        } catch (err: unknown) {
            setXReportError(
                err instanceof Error ? err.message : "Unknown error"
            );
        } finally {
            setXReportLoading(false);
        }
    }

    async function fetchZReport() {
        try {
            setZReportLoading(true);
            setZReportError(null);
            setZReportData(null);

            const res = await fetch(`/api/reports/z-report`);

            if (!res.ok) {
                const text = await res.text();
                throw new Error(text || "Failed to fetch Z-report");
            }

            const response = await res.json();
            // Handle new response format with status info
            const data = response.data || response; // Support both old and new format
            const normalized: HourlyRow[] = (data ?? []).map(
                (row: { hour: number; netSales: number }) => ({
                    hour: Number(row.hour),
                    netSales: Number(row.netSales) || 0,
                })
            );
            setZReportData(normalized);

            // Update status if available
            if (response.hasBeenRunToday !== undefined) {
                setZReportHasBeenRunToday(response.hasBeenRunToday);
                setZReportLastRunInfo(response.lastRunInfo || null);
            }
        } catch (err: unknown) {
            setZReportError(
                err instanceof Error ? err.message : "Unknown error"
            );
        } finally {
            setZReportLoading(false);
        }
    }

    async function resetZReport() {
        try {
            setZReportResetLoading(true);
            const res = await fetch(`/api/reports/z-report`, {
                method: "POST",
            });

            if (!res.ok) {
                const errorData = await res
                    .json()
                    .catch(async () => ({ error: await res.text() }));
                throw new Error(errorData.error || "Failed to reset Z-report");
            }

            const result = await res.json();
            alert("Z-Report has been reset for the day");

            // Update status after successful reset
            setZReportHasBeenRunToday(true);
            setZReportLastRunInfo({
                timestamp: result.timestamp,
                runBy: null,
            });

            // Refresh the report data
            await fetchZReport();
        } catch (err: unknown) {
            const errorMessage =
                err instanceof Error ? err.message : "Unknown error";
            alert("Failed to reset Z-report: " + errorMessage);
            setZReportError(errorMessage);
        } finally {
            setZReportResetLoading(false);
        }
    }

    async function fetchRestockReport() {
        try {
            setRestockLoading(true);
            setRestockError(null);
            setRestockData(null);

            const res = await fetch(`/api/reports/restock`);

            if (!res.ok) {
                const text = await res.text();
                throw new Error(text || "Failed to fetch restock report");
            }

            const data = await res.json();
            setRestockData(data);
        } catch (err: unknown) {
            setRestockError(
                err instanceof Error ? err.message : "Unknown error"
            );
        } finally {
            setRestockLoading(false);
        }
    }

    // Sort handlers for each table
    function handleProductUsageSort(column: keyof ProductUsageRow) {
        setProductUsageSort((prev) => ({
            column,
            direction:
                prev.column === column && prev.direction === "asc"
                    ? "desc"
                    : "asc",
        }));
    }

    function handleSalesByItemSort(column: keyof SalesByItemRow) {
        setSalesByItemSort((prev) => ({
            column,
            direction:
                prev.column === column && prev.direction === "asc"
                    ? "desc"
                    : "asc",
        }));
    }

    function handleXReportSort(column: keyof HourlyRow) {
        setXReportSort((prev) => ({
            column,
            direction:
                prev.column === column && prev.direction === "asc"
                    ? "desc"
                    : "asc",
        }));
    }

    function handleZReportSort(column: keyof HourlyRow) {
        setZReportSort((prev) => ({
            column,
            direction:
                prev.column === column && prev.direction === "asc"
                    ? "desc"
                    : "asc",
        }));
    }

    function handleRestockSort(column: keyof RestockRow) {
        setRestockSort((prev) => ({
            column,
            direction:
                prev.column === column && prev.direction === "asc"
                    ? "desc"
                    : "asc",
        }));
    }

    // Sorted data for each table
    const sortedProductUsage = productUsageData
        ? productUsageSort.column
            ? sortData(
                  productUsageData,
                  productUsageSort.column,
                  productUsageSort.direction
              )
            : productUsageData
        : null;

    const sortedSalesByItem = salesByItemData
        ? salesByItemSort.column
            ? sortData(
                  salesByItemData,
                  salesByItemSort.column,
                  salesByItemSort.direction
              )
            : salesByItemData
        : null;

    const sortedXReport = xReportData
        ? xReportSort.column
            ? sortData(xReportData, xReportSort.column, xReportSort.direction)
            : xReportData
        : null;

    const sortedZReport = zReportData
        ? zReportSort.column
            ? sortData(zReportData, zReportSort.column, zReportSort.direction)
            : zReportData
        : null;

    const sortedRestock = restockData
        ? restockSort.column
            ? sortData(restockData, restockSort.column, restockSort.direction)
            : restockData
        : null;

    return (
        <div className="mt-6">
            <Accordion type="single" collapsible className="w-full">
                {/* Product Usage Report */}
                <AccordionItem value="product-usage">
                    <AccordionTrigger>Product Usage Report</AccordionTrigger>
                    <AccordionContent>
                        <div className="space-y-4">
                            <div className="flex gap-4 items-end">
                                <div className="flex-1">
                                    <Label htmlFor="product-usage-start">
                                        Start Date
                                    </Label>
                                    <Input
                                        id="product-usage-start"
                                        type="date"
                                        value={productUsageStartDate}
                                        onChange={(e) =>
                                            setProductUsageStartDate(
                                                e.target.value
                                            )
                                        }
                                    />
                                </div>
                                <div className="flex-1">
                                    <Label htmlFor="product-usage-end">
                                        End Date
                                    </Label>
                                    <Input
                                        id="product-usage-end"
                                        type="date"
                                        value={productUsageEndDate}
                                        onChange={(e) =>
                                            setProductUsageEndDate(
                                                e.target.value
                                            )
                                        }
                                    />
                                </div>
                                <Button
                                    variant="outline"
                                    onClick={() => {
                                        const today = getTodayDateCST();
                                        setProductUsageStartDate(today);
                                        setProductUsageEndDate(today);
                                    }}
                                >
                                    Today
                                </Button>
                                <Button
                                    onClick={fetchProductUsage}
                                    disabled={productUsageLoading}
                                >
                                    {productUsageLoading
                                        ? "Loading..."
                                        : "Generate Report"}
                                </Button>
                            </div>

                            {productUsageError && (
                                <p className="text-sm text-red-500">
                                    {productUsageError}
                                </p>
                            )}

                            {sortedProductUsage &&
                                sortedProductUsage.length > 0 && (
                                    <Table>
                                        <TableCaption>
                                            Inventory usage for the selected
                                            period
                                        </TableCaption>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>
                                                    <button
                                                        onClick={() =>
                                                            handleProductUsageSort(
                                                                "inventoryName"
                                                            )
                                                        }
                                                        className="flex items-center gap-1 hover:text-primary cursor-pointer"
                                                    >
                                                        Inventory Name
                                                        {productUsageSort.column ===
                                                            "inventoryName" && (
                                                            <span>
                                                                {productUsageSort.direction ===
                                                                "asc"
                                                                    ? "↑"
                                                                    : "↓"}
                                                            </span>
                                                        )}
                                                    </button>
                                                </TableHead>
                                                <TableHead className="text-right">
                                                    <button
                                                        onClick={() =>
                                                            handleProductUsageSort(
                                                                "totalUsed"
                                                            )
                                                        }
                                                        className="flex items-center gap-1 hover:text-primary cursor-pointer ml-auto"
                                                    >
                                                        Total Used
                                                        {productUsageSort.column ===
                                                            "totalUsed" && (
                                                            <span>
                                                                {productUsageSort.direction ===
                                                                "asc"
                                                                    ? "↑"
                                                                    : "↓"}
                                                            </span>
                                                        )}
                                                    </button>
                                                </TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {sortedProductUsage.map((row) => (
                                                <TableRow key={row.inventoryId}>
                                                    <TableCell>
                                                        {row.inventoryName}
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        {Number(
                                                            row.totalUsed
                                                        ).toFixed(2)}
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                )}

                            {sortedProductUsage &&
                                sortedProductUsage.length === 0 && (
                                    <p className="text-sm text-muted-foreground">
                                        No data for this period.
                                    </p>
                                )}
                        </div>
                    </AccordionContent>
                </AccordionItem>

                {/* Sales By Item Report */}
                <AccordionItem value="sales-by-item">
                    <AccordionTrigger>Sales Report (By Item)</AccordionTrigger>
                    <AccordionContent>
                        <div className="space-y-4">
                            <div className="flex gap-4 items-end">
                                <div className="flex-1">
                                    <Label htmlFor="sales-by-item-start">
                                        Start Date
                                    </Label>
                                    <Input
                                        id="sales-by-item-start"
                                        type="date"
                                        value={salesByItemStartDate}
                                        onChange={(e) =>
                                            setSalesByItemStartDate(
                                                e.target.value
                                            )
                                        }
                                    />
                                </div>
                                <div className="flex-1">
                                    <Label htmlFor="sales-by-item-end">
                                        End Date
                                    </Label>
                                    <Input
                                        id="sales-by-item-end"
                                        type="date"
                                        value={salesByItemEndDate}
                                        onChange={(e) =>
                                            setSalesByItemEndDate(
                                                e.target.value
                                            )
                                        }
                                    />
                                </div>
                                <Button
                                    variant="outline"
                                    onClick={() => {
                                        const today = getTodayDateCST();
                                        setSalesByItemStartDate(today);
                                        setSalesByItemEndDate(today);
                                    }}
                                >
                                    Today
                                </Button>
                                <Button
                                    onClick={fetchSalesByItem}
                                    disabled={salesByItemLoading}
                                >
                                    {salesByItemLoading
                                        ? "Loading..."
                                        : "Generate Report"}
                                </Button>
                            </div>

                            {salesByItemError && (
                                <p className="text-sm text-red-500">
                                    {salesByItemError}
                                </p>
                            )}

                            {sortedSalesByItem &&
                                sortedSalesByItem.length > 0 && (
                                    <Table>
                                        <TableCaption>
                                            Sales by item for the selected
                                            period
                                        </TableCaption>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>
                                                    <button
                                                        onClick={() =>
                                                            handleSalesByItemSort(
                                                                "recipeName"
                                                            )
                                                        }
                                                        className="flex items-center gap-1 hover:text-primary cursor-pointer"
                                                    >
                                                        Recipe Name
                                                        {salesByItemSort.column ===
                                                            "recipeName" && (
                                                            <span>
                                                                {salesByItemSort.direction ===
                                                                "asc"
                                                                    ? "↑"
                                                                    : "↓"}
                                                            </span>
                                                        )}
                                                    </button>
                                                </TableHead>
                                                <TableHead>
                                                    <button
                                                        onClick={() =>
                                                            handleSalesByItemSort(
                                                                "recipeType"
                                                            )
                                                        }
                                                        className="flex items-center gap-1 hover:text-primary cursor-pointer"
                                                    >
                                                        Type
                                                        {salesByItemSort.column ===
                                                            "recipeType" && (
                                                            <span>
                                                                {salesByItemSort.direction ===
                                                                "asc"
                                                                    ? "↑"
                                                                    : "↓"}
                                                            </span>
                                                        )}
                                                    </button>
                                                </TableHead>
                                                <TableHead className="text-right">
                                                    <button
                                                        onClick={() =>
                                                            handleSalesByItemSort(
                                                                "totalQuantity"
                                                            )
                                                        }
                                                        className="flex items-center gap-1 hover:text-primary cursor-pointer ml-auto"
                                                    >
                                                        Quantity Sold
                                                        {salesByItemSort.column ===
                                                            "totalQuantity" && (
                                                            <span>
                                                                {salesByItemSort.direction ===
                                                                "asc"
                                                                    ? "↑"
                                                                    : "↓"}
                                                            </span>
                                                        )}
                                                    </button>
                                                </TableHead>
                                                <TableHead className="text-right">
                                                    <button
                                                        onClick={() =>
                                                            handleSalesByItemSort(
                                                                "totalRevenue"
                                                            )
                                                        }
                                                        className="flex items-center gap-1 hover:text-primary cursor-pointer ml-auto"
                                                    >
                                                        Revenue ($)
                                                        {salesByItemSort.column ===
                                                            "totalRevenue" && (
                                                            <span>
                                                                {salesByItemSort.direction ===
                                                                "asc"
                                                                    ? "↑"
                                                                    : "↓"}
                                                            </span>
                                                        )}
                                                    </button>
                                                </TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {sortedSalesByItem.map((row) => (
                                                <TableRow key={row.recipeId}>
                                                    <TableCell>
                                                        {row.recipeName}
                                                    </TableCell>
                                                    <TableCell>
                                                        {row.recipeType}
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        {Number(
                                                            row.totalQuantity
                                                        )}
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        $
                                                        {Number(
                                                            row.totalRevenue
                                                        ).toFixed(2)}
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                )}

                            {salesByItemData &&
                                salesByItemData.length === 0 && (
                                    <p className="text-sm text-muted-foreground">
                                        No data for this period.
                                    </p>
                                )}
                        </div>
                    </AccordionContent>
                </AccordionItem>

                {/* X-Report */}
                <AccordionItem value="x-report">
                    <AccordionTrigger>
                        X-Report (Hourly Sales - Current Day)
                    </AccordionTrigger>
                    <AccordionContent>
                        <div className="space-y-4">
                            <div className="flex gap-4 items-center">
                                <p className="text-sm text-muted-foreground flex-1">
                                    Hourly sales for today. Run as often as
                                    needed.
                                </p>
                                <Button
                                    onClick={fetchXReport}
                                    disabled={xReportLoading}
                                >
                                    {xReportLoading
                                        ? "Loading..."
                                        : "Generate Report"}
                                </Button>
                            </div>

                            {xReportError && (
                                <p className="text-sm text-red-500">
                                    {xReportError}
                                </p>
                            )}

                            {sortedXReport && sortedXReport.length > 0 && (
                                <Table>
                                    <TableCaption>
                                        Hourly sales for the current day
                                    </TableCaption>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>
                                                <button
                                                    onClick={() =>
                                                        handleXReportSort(
                                                            "hour"
                                                        )
                                                    }
                                                    className="flex items-center gap-1 hover:text-primary cursor-pointer"
                                                >
                                                    Hour
                                                    {xReportSort.column ===
                                                        "hour" && (
                                                        <span>
                                                            {xReportSort.direction ===
                                                            "asc"
                                                                ? "↑"
                                                                : "↓"}
                                                        </span>
                                                    )}
                                                </button>
                                            </TableHead>
                                            <TableHead className="text-right">
                                                <button
                                                    onClick={() =>
                                                        handleXReportSort(
                                                            "netSales"
                                                        )
                                                    }
                                                    className="flex items-center gap-1 hover:text-primary cursor-pointer ml-auto"
                                                >
                                                    Net Sales ($)
                                                    {xReportSort.column ===
                                                        "netSales" && (
                                                        <span>
                                                            {xReportSort.direction ===
                                                            "asc"
                                                                ? "↑"
                                                                : "↓"}
                                                        </span>
                                                    )}
                                                </button>
                                            </TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {sortedXReport.map((row) => (
                                            <TableRow key={row.hour}>
                                                <TableCell>
                                                    {row.hour}:00
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    ${row.netSales.toFixed(2)}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            )}

                            {sortedXReport && sortedXReport.length === 0 && (
                                <p className="text-sm text-muted-foreground">
                                    No sales data for today.
                                </p>
                            )}
                        </div>
                    </AccordionContent>
                </AccordionItem>

                {/* Z-Report */}
                <AccordionItem value="z-report">
                    <AccordionTrigger>
                        Z-Report (End of Day Summary)
                    </AccordionTrigger>
                    <AccordionContent>
                        <div className="space-y-4">
                            <div className="flex gap-4 items-center">
                                <p className="text-sm text-muted-foreground flex-1">
                                    End-of-day totals. Run once per day at
                                    closing.
                                </p>
                                <Button
                                    onClick={fetchZReport}
                                    disabled={zReportLoading}
                                >
                                    {zReportLoading
                                        ? "Loading..."
                                        : "Generate Report"}
                                </Button>
                            </div>

                            {zReportError && (
                                <p className="text-sm text-red-500">
                                    {zReportError}
                                </p>
                            )}

                            {zReportHasBeenRunToday && (
                                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                                    <p className="text-sm text-yellow-800 font-medium">
                                        ⚠️ Z-Report has already been run today
                                    </p>
                                    {zReportLastRunInfo && (
                                        <p className="text-xs text-yellow-700 mt-1">
                                            Last run:{" "}
                                            {new Date(
                                                zReportLastRunInfo.timestamp
                                            ).toLocaleString()}
                                        </p>
                                    )}
                                    <p className="text-xs text-yellow-700 mt-1">
                                        The Z-Report can only be run once per
                                        day. It resets totals and should only be
                                        run at the end of the business day.
                                    </p>
                                </div>
                            )}

                            {sortedZReport && sortedZReport.length > 0 && (
                                <>
                                    <Table>
                                        <TableCaption>
                                            End-of-day sales summary
                                        </TableCaption>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>
                                                    <button
                                                        onClick={() =>
                                                            handleZReportSort(
                                                                "hour"
                                                            )
                                                        }
                                                        className="flex items-center gap-1 hover:text-primary cursor-pointer"
                                                    >
                                                        Hour
                                                        {zReportSort.column ===
                                                            "hour" && (
                                                            <span>
                                                                {zReportSort.direction ===
                                                                "asc"
                                                                    ? "↑"
                                                                    : "↓"}
                                                            </span>
                                                        )}
                                                    </button>
                                                </TableHead>
                                                <TableHead className="text-right">
                                                    <button
                                                        onClick={() =>
                                                            handleZReportSort(
                                                                "netSales"
                                                            )
                                                        }
                                                        className="flex items-center gap-1 hover:text-primary cursor-pointer ml-auto"
                                                    >
                                                        Net Sales ($)
                                                        {zReportSort.column ===
                                                            "netSales" && (
                                                            <span>
                                                                {zReportSort.direction ===
                                                                "asc"
                                                                    ? "↑"
                                                                    : "↓"}
                                                            </span>
                                                        )}
                                                    </button>
                                                </TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {sortedZReport.map((row) => (
                                                <TableRow key={row.hour}>
                                                    <TableCell>
                                                        {row.hour}:00
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        $
                                                        {row.netSales.toFixed(
                                                            2
                                                        )}
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                    <div className="flex justify-end">
                                        <Button
                                            onClick={resetZReport}
                                            disabled={
                                                zReportResetLoading ||
                                                zReportHasBeenRunToday
                                            }
                                            variant="destructive"
                                        >
                                            {zReportResetLoading
                                                ? "Resetting..."
                                                : zReportHasBeenRunToday
                                                ? "Already Run Today"
                                                : "Reset Z-Report (End of Day)"}
                                        </Button>
                                    </div>
                                </>
                            )}

                            {sortedZReport && sortedZReport.length === 0 && (
                                <p className="text-sm text-muted-foreground">
                                    No sales data for today.
                                </p>
                            )}
                        </div>
                    </AccordionContent>
                </AccordionItem>

                {/* Restock Report */}
                <AccordionItem value="restock-report">
                    <AccordionTrigger>Restock Report</AccordionTrigger>
                    <AccordionContent>
                        <div className="space-y-4">
                            <div className="flex gap-4 items-center">
                                <p className="text-sm text-muted-foreground flex-1">
                                    Items with current stock below estimated
                                    daily usage.
                                </p>
                                <Button
                                    onClick={fetchRestockReport}
                                    disabled={restockLoading}
                                >
                                    {restockLoading
                                        ? "Loading..."
                                        : "Generate Report"}
                                </Button>
                            </div>

                            {restockError && (
                                <p className="text-sm text-red-500">
                                    {restockError}
                                </p>
                            )}

                            {sortedRestock && sortedRestock.length > 0 && (
                                <Table>
                                    <TableCaption>
                                        Items that need restocking
                                    </TableCaption>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>
                                                <button
                                                    onClick={() =>
                                                        handleRestockSort(
                                                            "name"
                                                        )
                                                    }
                                                    className="flex items-center gap-1 hover:text-primary cursor-pointer"
                                                >
                                                    Item Name
                                                    {restockSort.column ===
                                                        "name" && (
                                                        <span>
                                                            {restockSort.direction ===
                                                            "asc"
                                                                ? "↑"
                                                                : "↓"}
                                                        </span>
                                                    )}
                                                </button>
                                            </TableHead>
                                            <TableHead className="text-right">
                                                <button
                                                    onClick={() =>
                                                        handleRestockSort(
                                                            "currentStock"
                                                        )
                                                    }
                                                    className="flex items-center gap-1 hover:text-primary cursor-pointer ml-auto"
                                                >
                                                    Current Stock
                                                    {restockSort.column ===
                                                        "currentStock" && (
                                                        <span>
                                                            {restockSort.direction ===
                                                            "asc"
                                                                ? "↑"
                                                                : "↓"}
                                                        </span>
                                                    )}
                                                </button>
                                            </TableHead>
                                            <TableHead className="text-right">
                                                <button
                                                    onClick={() =>
                                                        handleRestockSort(
                                                            "estimatedUsedPerDay"
                                                        )
                                                    }
                                                    className="flex items-center gap-1 hover:text-primary cursor-pointer ml-auto"
                                                >
                                                    Est. Daily Usage
                                                    {restockSort.column ===
                                                        "estimatedUsedPerDay" && (
                                                        <span>
                                                            {restockSort.direction ===
                                                            "asc"
                                                                ? "↑"
                                                                : "↓"}
                                                        </span>
                                                    )}
                                                </button>
                                            </TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {sortedRestock.map((row) => (
                                            <TableRow key={row.id}>
                                                <TableCell>
                                                    {row.name}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    {row.currentStock}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    {row.estimatedUsedPerDay}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            )}

                            {sortedRestock && sortedRestock.length === 0 && (
                                <p className="text-sm text-muted-foreground">
                                    All items are adequately stocked.
                                </p>
                            )}
                        </div>
                    </AccordionContent>
                </AccordionItem>
            </Accordion>
        </div>
    );
}
