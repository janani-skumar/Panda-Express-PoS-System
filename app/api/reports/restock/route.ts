import { NextResponse } from "next/server";
import { getRestockReport } from "@/app/services/restockReportService";

export async function GET(request: Request) {
    try {
        const restockReport = await getRestockReport();
        return NextResponse.json(restockReport, { status: 200 });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch restock report: ' + error }, { status: 500 });
    }
}

