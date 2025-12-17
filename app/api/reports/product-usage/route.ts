import { NextResponse } from "next/server";
import { getProductUsage } from "@/app/services/productUsageService";

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const startDate = searchParams.get('startDate');
        const endDate = searchParams.get('endDate');
        
        if (!startDate || !endDate) {
            return NextResponse.json({ error: 'Start and end date are required' }, { status: 400 });
        }
        
        const productUsage = await getProductUsage(startDate, endDate);
        return NextResponse.json(productUsage, { status: 200 });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch product usage: ' + error }, { status: 500 });
    }
}

