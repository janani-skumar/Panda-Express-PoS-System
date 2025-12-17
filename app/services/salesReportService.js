import db from "@/drizzle/src/index";
import { orders } from "@/drizzle/src/db/schema";
import { sum, sql, and, gte, lte, eq } from "drizzle-orm";

export const getSalesReport = async (startDate, endDate) => {
    // Convert dates: start at beginning of start day, end at end of end day (inclusive)
    // orderTime is stored in CST format (no timezone), so we need to create CST timestamps
    // Format: YYYY-MM-DDTHH:mm:ss (CST time, no 'Z' suffix)
    const start = startDate + "T00:00:00";
    const end = endDate + "T23:59:59";

    const salesReport = await db
        .select({
            profit: sum(orders.totalCost),
            totalTax: sum(orders.tax),
            totalProfit: sql`SUM(${orders.totalCost}) + SUM(${orders.tax})`.as(
                "totalProfit"
            ),
        })
        .from(orders)
        .where(
            and(
                eq(orders.isCompleted, true),
                gte(orders.orderTime, start),
                lte(orders.orderTime, end)
            )
        );
    return salesReport;
};

export const getHourlySalesReport = async (startDate, endDate) => {
    // orderTime is stored in CST format (no timezone), so extract hour directly
    const hourlySalesReport = await db
        .select({
            hour: sql`EXTRACT(HOUR FROM ${orders.orderTime}::timestamp)`.as(
                "hour"
            ),
            netSales: sum(orders.totalCost),
        })
        .from(orders)
        .where(
            and(
                eq(orders.isCompleted, true),
                gte(orders.orderTime, startDate),
                lte(orders.orderTime, endDate)
            )
        )
        .groupBy(
            sql`EXTRACT(HOUR FROM ${orders.orderTime}::timestamp)`
        );
    return hourlySalesReport;
};

export const getHourlySales = async (day, startHour, endHour) => {
    // Build time window: [day@startHour, day@(endHour+1))  (end-exclusive)
    // orderTime is stored in CST format (no timezone), so we create CST timestamps
    // Format: YYYY-MM-DDTHH:mm:ss (CST time, no 'Z' suffix)
    const formatHour = (h) => String(h).padStart(2, '0');
    const startDate = `${day}T${formatHour(startHour)}:00:00`;
    
    let endDate;
    if (endHour === 23) {
        // Next day at 00:00:00
        const nextDay = new Date(day + "T00:00:00");
        nextDay.setDate(nextDay.getDate() + 1);
        const nextDayStr = nextDay.toISOString().split('T')[0];
        endDate = `${nextDayStr}T00:00:00`;
    } else {
        endDate = `${day}T${formatHour(endHour + 1)}:00:00`;
    }

    const hourlySalesData = await db
        .select({
            // Extract hour directly from CST timestamp (orderTime is already in CST format)
            hour: sql`EXTRACT(HOUR FROM ${orders.orderTime}::timestamp)`.as(
                "hour"
            ),
            netSales: sum(orders.totalCost),
        })
        .from(orders)
        .where(
            and(
                eq(orders.isCompleted, true),
                gte(orders.orderTime, startDate),
                lte(orders.orderTime, endDate)
            )
        )
        .groupBy(
            sql`EXTRACT(HOUR FROM ${orders.orderTime}::timestamp)`
        );

    // Collect into a map so we can zero-fill missing hours
    const byHour = new Map();
    hourlySalesData.forEach((row) => {
        byHour.set(parseInt(row.hour), parseFloat(row.netSales) || 0);
    });

    // Zero-fill missing hours in the range
    const hourly = [];
    for (let h = startHour; h <= endHour; h++) {
        const sales = byHour.get(h) || 0.0;
        hourly.push({ hour: h, netSales: sales });
    }

    return hourly;
};
