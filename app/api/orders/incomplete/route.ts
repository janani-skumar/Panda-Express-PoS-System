import { getIncompleteOrders } from "@/app/services/orderService";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        const incompleteOrders = await getIncompleteOrders();
        return NextResponse.json(incompleteOrders, { status: 200 });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Failed to fetch incomplete orders' }, { status: 500 });
    }
}