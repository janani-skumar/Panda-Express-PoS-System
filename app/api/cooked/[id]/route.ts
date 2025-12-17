import { NextRequest, NextResponse } from 'next/server';
import { getCookedById, updateCooked } from '@/app/services/cookedService';

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

        const cookedItem = await getCookedById(id);

        // Check if resource exists
        if (!cookedItem) {
            return NextResponse.json(
                { error: 'Cooked item not found' },
                { status: 404 }
            );
        }

        return NextResponse.json(cookedItem, { status: 200 });
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        return NextResponse.json(
            { error: 'Failed to fetch cooked item', details: errorMessage },
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
        const existing = await getCookedById(id);
        if (!existing) {
            return NextResponse.json(
                { error: 'Cooked item not found' },
                { status: 404 }
            );
        }

        let body;
        try {
            body = await request.json();
        } catch (parseError) {
            return NextResponse.json(
                { error: 'Invalid JSON in request body'},
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
        if (body.currentStock !== undefined && typeof body.currentStock !== 'number') {
            return NextResponse.json(
                { error: 'Invalid data type: currentStock must be a number' },
                { status: 400 }
            );
        }
        if (body.currentStock !== undefined && body.currentStock < 0) {
            return NextResponse.json(
                { error: 'currentStock must be a non-negative number' },
                { status: 400 }
            );
        }

        const updatedCooked = await updateCooked(id, body);
        return NextResponse.json(updatedCooked, { status: 200 });
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';

        // Handle database constraint errors
        if (errorMessage.includes('foreign key') || errorMessage.includes('violates foreign key')) {
            return NextResponse.json(
                { error: 'Invalid recipeId: recipe does not exist', details: errorMessage },
                { status: 400 }
            );
        }

        return NextResponse.json(
            { error: 'Failed to update cooked item', details: errorMessage },
            { status: 500 }
        );
    }
}
