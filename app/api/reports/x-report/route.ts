import { NextResponse } from "next/server";
import { getHourlySales } from "@/app/services/salesReportService";
import { getTodayDateCST } from "@/lib/utils";

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const startHour = searchParams.get('startHour');
        const endHour = searchParams.get('endHour');

        // Get current day in YYYY-MM-DD format (Chicago timezone)
        const currentDay = getTodayDateCST();

        // Default to full day (0-23) if hours not provided
        const startHourNum = startHour ? parseInt(startHour) : 0;
        const endHourNum = endHour ? parseInt(endHour) : 23;

        if (isNaN(startHourNum) || isNaN(endHourNum) || startHourNum < 0 || startHourNum > 23 || endHourNum < 0 || endHourNum > 23 || startHourNum > endHourNum) {
            return NextResponse.json({ error: 'Invalid hour range. Hours must be between 0-23 and startHour must be <= endHour' }, { status: 400 });
        }

        const hourlySales = await getHourlySales(currentDay, startHourNum, endHourNum);
        return NextResponse.json(hourlySales, { status: 200 });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch x-report: ' + error }, { status: 500 });
    }
}