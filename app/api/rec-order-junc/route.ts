import { NextRequest, NextResponse } from 'next/server';
import { getRecOrderJuncs, createRecOrderJunc } from '@/app/services/recOrderService';

export async function GET() {
    try {
        const juncs = await getRecOrderJuncs();
        return NextResponse.json(juncs, { status: 200 });
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        return NextResponse.json(
            { error: 'Failed to fetch recipe-order junctions', details: errorMessage },
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

        // Validation: required fields for rec-order-junc
        if (!body.recipeId || !body.orderId || body.quantity === undefined) {
            return NextResponse.json(
                { error: 'Missing required fields: recipeId, orderId, quantity' },
                { status: 400 }
            );
        }

        // Type validation
        if (typeof body.recipeId !== 'number' || typeof body.orderId !== 'number' || typeof body.quantity !== 'number') {
            return NextResponse.json(
                { error: 'Invalid data types: recipeId, orderId, and quantity must be numbers' },
                { status: 400 }
            );
        }
        if (body.quantity < 0) {
            return NextResponse.json(
                { error: 'quantity must be a non-negative number' },
                { status: 400 }
            );
        }

        const newJunc = await createRecOrderJunc(body);
        return NextResponse.json(newJunc, { status: 201 });
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
            { error: 'Failed to create recipe-order junction', details: errorMessage },
            { status: 500 }
        );
    }
}

