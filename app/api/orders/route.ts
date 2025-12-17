import { NextRequest, NextResponse } from 'next/server';
import { getOrders, createOrder } from '@/app/services/orderService';

export async function GET() {
    try {
        const orders = await getOrders();
        return NextResponse.json(orders, { status: 200 });
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        return NextResponse.json(
            { error: 'Failed to fetch orders', details: errorMessage },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        let body;
        try {
            body = await request.json();
        } catch (parseError) {
            return NextResponse.json(
                { error: 'Invalid JSON in request body' },
                { status: 400 }
            );
        }

        // Validation: required fields for orders
        if (!body.tax || !body.totalCost || !body.orderTime || !body.cashierId) {
            return NextResponse.json(
                { error: 'Missing required fields: tax, totalCost, orderTime, cashierId' },
                { status: 400 }
            );
        }

        // Type validation
        if (typeof body.tax !== 'number' || body.tax < 0) {
            return NextResponse.json(
                { error: 'tax must be a non-negative number' },
                { status: 400 }
            );
        }
        if (typeof body.totalCost !== 'number' || body.totalCost < 0) {
            return NextResponse.json(
                { error: 'totalCost must be a non-negative number' },
                { status: 400 }
            );
        }
        if (typeof body.orderTime !== 'string' || body.orderTime.trim() === '') {
            return NextResponse.json(
                { error: 'orderTime must be a non-empty string' },
                { status: 400 }
            );
        }
        if (typeof body.cashierId !== 'number') {
            return NextResponse.json(
                { error: 'cashierId must be a number' },
                { status: 400 }
            );
        }
        if (body.isCompleted !== undefined && typeof body.isCompleted !== 'boolean') {
            return NextResponse.json(
                { error: 'isCompleted must be a boolean' },
                { status: 400 }
            );
        }
        // Validate optional customerEmail field
        if (body.customerEmail !== undefined && body.customerEmail !== null) {
            if (typeof body.customerEmail !== 'string') {
                return NextResponse.json(
                    { error: 'customerEmail must be a string' },
                    { status: 400 }
                );
            }
            // Basic email validation
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (body.customerEmail.trim() !== '' && !emailRegex.test(body.customerEmail)) {
                return NextResponse.json(
                    { error: 'customerEmail must be a valid email address' },
                    { status: 400 }
                );
            }
        }
        const newOrder = await createOrder(body);
        return NextResponse.json(newOrder, { status: 201 });
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';

        // Handle database constraint errors
        if (errorMessage.includes('foreign key') || errorMessage.includes('violates foreign key')) {
            return NextResponse.json(
                { error: 'Invalid cashierId: employee does not exist', details: errorMessage },
                { status: 400 }
            );
        }

        return NextResponse.json(
            { error: 'Failed to create order', details: errorMessage },
            { status: 500 }
        );
    }
}

