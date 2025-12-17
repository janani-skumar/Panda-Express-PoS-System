import { NextRequest, NextResponse } from 'next/server';
import { getInventoryById, updateInventory, deleteInventory } from '@/app/services/inventoryService';

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

        const inventoryItem = await getInventoryById(id);
        
        // Check if resource exists
        if (!inventoryItem || (Array.isArray(inventoryItem) && inventoryItem.length === 0)) {
            return NextResponse.json(
                { error: 'Inventory item not found' },
                { status: 404 }
            );
        }

        return NextResponse.json(inventoryItem, { status: 200 });
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        return NextResponse.json(
            { error: 'Failed to fetch inventory item', details: errorMessage },
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
        const existing = await getInventoryById(id);
        if (!existing || (Array.isArray(existing) && existing.length === 0)) {
            return NextResponse.json(
                { error: 'Inventory item not found' },
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
        if (body.name !== undefined && (typeof body.name !== 'string' || body.name.trim() === '')) {
            return NextResponse.json(
                { error: 'name must be a non-empty string' },
                { status: 400 }
            );
        }
        if (body.batchPurchaseCost !== undefined && (typeof body.batchPurchaseCost !== 'number' || body.batchPurchaseCost < 0)) {
            return NextResponse.json(
                { error: 'batchPurchaseCost must be a non-negative number' },
                { status: 400 }
            );
        }
        if (body.currentStock !== undefined && (typeof body.currentStock !== 'number' || body.currentStock < 0)) {
            return NextResponse.json(
                { error: 'currentStock must be a non-negative number' },
                { status: 400 }
            );
        }
        if (body.estimatedUsedPerDay !== undefined && (typeof body.estimatedUsedPerDay !== 'number' || body.estimatedUsedPerDay < 0)) {
            return NextResponse.json(
                { error: 'estimatedUsedPerDay must be a non-negative number' },
                { status: 400 }
            );
        }

        const updatedInventory = await updateInventory(id, body);
        return NextResponse.json(updatedInventory, { status: 200 });
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        return NextResponse.json(
            { error: 'Failed to update inventory item', details: errorMessage },
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
        const existing = await getInventoryById(id);
        if (!existing || (Array.isArray(existing) && existing.length === 0)) {
            return NextResponse.json(
                { error: 'Inventory item not found' },
                { status: 404 }
            );
        }

        await deleteInventory(id);
        return NextResponse.json({ message: 'Inventory item deleted successfully' }, { status: 200 });
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        
        // Handle database constraint errors
        if (errorMessage.includes('foreign key') || errorMessage.includes('violates foreign key')) {
            return NextResponse.json(
                { error: 'Cannot delete: item is referenced by other records', details: errorMessage },
                { status: 409 }
            );
        }

        return NextResponse.json(
            { error: 'Failed to delete inventory item', details: errorMessage },
            { status: 500 }
        );
    }
}

