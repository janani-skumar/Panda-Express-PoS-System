import { NextRequest, NextResponse } from 'next/server';
import { getInvRecJuncs, createInvRecJunc } from '@/app/services/invRecService';

export async function GET() {
    try {
        const juncs = await getInvRecJuncs();
        return NextResponse.json(juncs, { status: 200 });
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        return NextResponse.json(
            { error: 'Failed to fetch inventory-recipe junctions', details: errorMessage },
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

        // Validation: required fields for inv-rec-junc
        if (body.inventoryId == null || body.recipeId == null || body.inventoryQuantity == null) {
            return NextResponse.json(
                { error: 'Missing required fields: inventoryId, recipeId, inventoryQuantity' },
                { status: 400 }
            );
        }

        // Coerce to numbers (handles string inputs from forms)
        const inventoryId = Number(body.inventoryId);
        const recipeId = Number(body.recipeId);
        const inventoryQuantity = Number(body.inventoryQuantity);

        // Type validation after coercion
        if (isNaN(inventoryId) || isNaN(recipeId) || isNaN(inventoryQuantity)) {
            return NextResponse.json(
                { error: 'Invalid data types: inventoryId, recipeId, and inventoryQuantity must be valid numbers' },
                { status: 400 }
            );
        }
        if (inventoryQuantity < 0) {
            return NextResponse.json(
                { error: 'inventoryQuantity must be a non-negative number' },
                { status: 400 }
            );
        }

        const newJunc = await createInvRecJunc({
            inventoryId,
            recipeId,
            inventoryQuantity
        });
        return NextResponse.json(newJunc, { status: 201 });
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
            { error: 'Failed to create inventory-recipe junction', details: errorMessage },
            { status: 500 }
        );
    }
}

