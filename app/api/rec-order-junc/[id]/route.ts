import { NextRequest, NextResponse } from 'next/server';
import { getRecOrderJuncById, updateRecOrderJunc, deleteRecOrderJunc } from '@/app/services/recOrderService';

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

        const junc = await getRecOrderJuncById(id);
        
        // Check if resource exists
        if (!junc || (Array.isArray(junc) && junc.length === 0)) {
            return NextResponse.json(
                { error: 'Recipe-order junction not found' },
                { status: 404 }
            );
        }

        return NextResponse.json(junc, { status: 200 });
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        return NextResponse.json(
            { error: 'Failed to fetch recipe-order junction', details: errorMessage },
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
        const existing = await getRecOrderJuncById(id);
        if (!existing || (Array.isArray(existing) && existing.length === 0)) {
            return NextResponse.json(
                { error: 'Recipe-order junction not found' },
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
        if (body.recipeId !== undefined && typeof body.recipeId !== 'number') {
            return NextResponse.json(
                { error: 'Invalid data type: recipeId must be a number' },
                { status: 400 }
            );
        }
        if (body.orderId !== undefined && typeof body.orderId !== 'number') {
            return NextResponse.json(
                { error: 'Invalid data type: orderId must be a number' },
                { status: 400 }
            );
        }
        if (body.quantity !== undefined && (typeof body.quantity !== 'number' || body.quantity < 0)) {
            return NextResponse.json(
                { error: 'quantity must be a non-negative number' },
                { status: 400 }
            );
        }

        const updatedJunc = await updateRecOrderJunc(id, body);
        return NextResponse.json(updatedJunc, { status: 200 });
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        
        // Handle database constraint errors
        if (errorMessage.includes('foreign key') || errorMessage.includes('violates foreign key')) {
            return NextResponse.json(
                { error: 'Invalid recipeId or orderId: one or both do not exist', details: errorMessage },
                { status: 400 }
            );
        }

        return NextResponse.json(
            { error: 'Failed to update recipe-order junction', details: errorMessage },
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
        const existing = await getRecOrderJuncById(id);
        if (!existing || (Array.isArray(existing) && existing.length === 0)) {
            return NextResponse.json(
                { error: 'Recipe-order junction not found' },
                { status: 404 }
            );
        }

        await deleteRecOrderJunc(id);
        return NextResponse.json({ message: 'Recipe-order junction deleted successfully' }, { status: 200 });
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        return NextResponse.json(
            { error: 'Failed to delete recipe-order junction', details: errorMessage },
            { status: 500 }
        );
    }
}

