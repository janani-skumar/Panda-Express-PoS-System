import { NextResponse } from "next/server";
import { getSalesByItem } from "@/app/services/salesByItemService";

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const startDate = searchParams.get('startDate');
        const endDate = searchParams.get('endDate');
        
        if (!startDate || !endDate) {
            return NextResponse.json({ error: 'Start and end date are required' }, { status: 400 });
        }
        
        const salesByItem = await getSalesByItem(startDate, endDate);
        return NextResponse.json(salesByItem, { status: 200 });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch sales by item: ' + error }, { status: 500 });
    }
}

