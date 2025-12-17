import { NextRequest, NextResponse } from 'next/server';
import { getOrderById, updateOrder, deleteOrder } from '@/app/services/orderService';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: idString } = await params;
        const id = parseInt(idString);
        if (isNaN(id)) {
            return NextResponse.json({ error: 'Invalid ID: must be a number' }, { status: 400 });
        }

        const order = await getOrderById(id);
        
        // Check if resource exists
        if (!order || (Array.isArray(order) && order.length === 0)) {
            return NextResponse.json(
                { error: 'Order not found' },
                { status: 404 }
            );
        }

        return NextResponse.json(order, { status: 200 });
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        return NextResponse.json(
            { error: 'Failed to fetch order', details: errorMessage },
            { status: 500 }
        );
    }
}

export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: idString } = await params;
        const id = parseInt(idString);
        if (isNaN(id)) {
            return NextResponse.json({ error: 'Invalid ID: must be a number' }, { status: 400 });
        }

        // Check if resource exists before updating
        const existing = await getOrderById(id);
        if (!existing || (Array.isArray(existing) && existing.length === 0)) {
            return NextResponse.json(
                { error: 'Order not found' },
                { status: 404 }
            );
        }

        let body;
        try {
            body = await request.json();
        } catch (parseError) {
            return NextResponse.json(
                { error: 'Invalid JSON in request body' },
                { status: 400 }
            );
        }

        // Type validation
        if (body.tax !== undefined && (typeof body.tax !== 'number' || body.tax < 0)) {
            return NextResponse.json(
                { error: 'tax must be a non-negative number' },
                { status: 400 }
            );
        }
        if (body.totalCost !== undefined && (typeof body.totalCost !== 'number' || body.totalCost < 0)) {
            return NextResponse.json(
                { error: 'totalCost must be a non-negative number' },
                { status: 400 }
            );
        }
        if (body.orderTime !== undefined && (typeof body.orderTime !== 'string' || body.orderTime.trim() === '')) {
            return NextResponse.json(
                { error: 'orderTime must be a non-empty string' },
                { status: 400 }
            );
        }
        if (body.cashierId !== undefined && typeof body.cashierId !== 'number') {
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

        const updatedOrder = await updateOrder(id, body);
        return NextResponse.json(updatedOrder, { status: 200 });
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
            { error: 'Failed to update order', details: errorMessage },
            { status: 500 }
        );
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: idString } = await params;
        const id = parseInt(idString);
        if (isNaN(id)) {
            return NextResponse.json({ error: 'Invalid ID: must be a number' }, { status: 400 });
        }

        // Check if resource exists before deleting
        const existing = await getOrderById(id);
        if (!existing || (Array.isArray(existing) && existing.length === 0)) {
            return NextResponse.json(
                { error: 'Order not found' },
                { status: 404 }
            );
        }

        await deleteOrder(id);
        return NextResponse.json({ message: 'Order deleted successfully' }, { status: 200 });
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        
        // Handle database constraint errors
        if (errorMessage.includes('foreign key') || errorMessage.includes('violates foreign key')) {
            return NextResponse.json(
                { error: 'Cannot delete: order is referenced by other records', details: errorMessage },
                { status: 409 }
            );
        }

        return NextResponse.json(
            { error: 'Failed to delete order', details: errorMessage },
            { status: 500 }
        );
    }
}

