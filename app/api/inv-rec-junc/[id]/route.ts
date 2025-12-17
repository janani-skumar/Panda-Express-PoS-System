import { NextRequest, NextResponse } from 'next/server';
import { getInvRecJuncById, updateInvRecJunc, deleteInvRecJunc } from '@/app/services/invRecService';

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

        const junc = await getInvRecJuncById(id);
        
        // Check if resource exists
        if (!junc || (Array.isArray(junc) && junc.length === 0)) {
            return NextResponse.json(
                { error: 'Inventory-recipe junction not found' },
                { status: 404 }
            );
        }

        return NextResponse.json(junc, { status: 200 });
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        return NextResponse.json(
            { error: 'Failed to fetch inventory-recipe junction', details: errorMessage },
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
        const existing = await getInvRecJuncById(id);
        if (!existing || (Array.isArray(existing) && existing.length === 0)) {
            return NextResponse.json(
                { error: 'Inventory-recipe junction not found' },
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
        if (body.inventoryId !== undefined && typeof body.inventoryId !== 'number') {
            return NextResponse.json(
                { error: 'Invalid data type: inventoryId must be a number' },
                { status: 400 }
            );
        }
        if (body.recipeId !== undefined && typeof body.recipeId !== 'number') {
            return NextResponse.json(
                { error: 'Invalid data type: recipeId must be a number' },
                { status: 400 }
            );
        }
        if (body.inventoryQuantity !== undefined && (typeof body.inventoryQuantity !== 'number' || body.inventoryQuantity < 0)) {
            return NextResponse.json(
                { error: 'inventoryQuantity must be a non-negative number' },
                { status: 400 }
            );
        }

        const updatedJunc = await updateInvRecJunc(id, body);
        return NextResponse.json(updatedJunc, { status: 200 });
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        
        // Handle database constraint errors
        if (errorMessage.includes('foreign key') || errorMessage.includes('violates foreign key')) {
            return NextResponse.json(
                { error: 'Invalid inventoryId or recipeId: one or both do not exist', details: errorMessage },
                { status: 400 }
            );
        }

        return NextResponse.json(
            { error: 'Failed to update inventory-recipe junction', details: errorMessage },
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
        const existing = await getInvRecJuncById(id);
        if (!existing || (Array.isArray(existing) && existing.length === 0)) {
            return NextResponse.json(
                { error: 'Inventory-recipe junction not found' },
                { status: 404 }
            );
        }

        await deleteInvRecJunc(id);
        return NextResponse.json({ message: 'Inventory-recipe junction deleted successfully' }, { status: 200 });
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        return NextResponse.json(
            { error: 'Failed to delete inventory-recipe junction', details: errorMessage },
            { status: 500 }
        );
    }
}

