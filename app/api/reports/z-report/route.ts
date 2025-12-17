import { NextResponse } from "next/server";
import { getHourlySales } from "@/app/services/salesReportService";
import { getTodayDateCST, getCSTTimestamp } from "@/lib/utils";
import db from "@/drizzle/src/index";
import { zReportRuns } from "@/drizzle/src/db/schema";
import { eq } from "drizzle-orm";

export async function GET(request: Request) {
    try {
        // Get current day in YYYY-MM-DD format (Chicago timezone)
        const currentDay = getTodayDateCST();

        // Check if z-report has already been run today
        const existingRun = await db
            .select()
            .from(zReportRuns)
            .where(eq(zReportRuns.reportDate, currentDay))
            .limit(1);

        const hasBeenRunToday = existingRun.length > 0;
        const lastRunInfo = hasBeenRunToday ? {
            timestamp: existingRun[0].runTimestamp,
            runBy: existingRun[0].runBy
        } : null;

        // Z-report is for the full day (0-23) at end of day
        const hourlySales = await getHourlySales(currentDay, 0, 23);

        return NextResponse.json({
            data: hourlySales,
            hasBeenRunToday,
            lastRunInfo
        }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch z-report: ' + error }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        // Get current day in YYYY-MM-DD format (Chicago timezone)
        const currentDay = getTodayDateCST();

        // Check if z-report has already been run today
        const existingRun = await db
            .select()
            .from(zReportRuns)
            .where(eq(zReportRuns.reportDate, currentDay))
            .limit(1);

        if (existingRun.length > 0) {
            return NextResponse.json({
                error: 'Z-Report has already been run today. It can only be run once per day.',
                date: currentDay,
                lastRunTimestamp: existingRun[0].runTimestamp
            }, { status: 400 });
        }

        // Z-report reset functionality
        // In traditional POS systems, this marks the end of the business day
        // The "reset" is conceptual - it doesn't delete data, but marks the transition
        // between days. The next day's reports will naturally show new data due to date filtering.

        // Record that the z-report has been run today
        const timestamp = getCSTTimestamp();
        await db.insert(zReportRuns).values({
            reportDate: currentDay,
            runTimestamp: timestamp,
            runBy: null // Could be populated with employee ID from session if available
        });

        console.log(`Z-Report reset triggered for ${currentDay} at ${timestamp}`);

        return NextResponse.json({
            success: true,
            message: 'Z-Report reset completed',
            date: currentDay,
            timestamp: timestamp
        }, { status: 200 });
    } catch (error) {
        return NextResponse.json({
            error: 'Failed to reset z-report: ' + error
        }, { status: 500 });
    }
}

