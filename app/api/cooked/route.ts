import { NextRequest, NextResponse } from 'next/server';
import { getCooked, createCooked } from '@/app/services/cookedService';
import { Cooked } from '@/lib/types';

export async function GET() {
    try {
        const cookedItems = await getCooked();
        return NextResponse.json(cookedItems, { status: 200 });
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        return NextResponse.json(
            { error: 'Failed to fetch cooked items', details: errorMessage },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        let body: Cooked;
        try {
            body = await request.json();
        } catch {
            return NextResponse.json(
                { error: 'Invalid JSON in request body' },
                { status: 400 }
            );
        }

        // Validation: required fields for cooked
        if (!body.recipeId || body.currentStock === undefined) {
            return NextResponse.json(
                { error: 'Missing required fields: recipeId, currentStock' },
                { status: 400 }
            );
        }

        // Type validation
        if (typeof body.recipeId !== 'number' || typeof body.currentStock !== 'number') {
            return NextResponse.json(
                { error: 'Invalid data types: recipeId and currentStock must be numbers' },
                { status: 400 }
            );
        }

        if (body.currentStock < 0) {
            return NextResponse.json(
                { error: 'currentStock must be a non-negative number' },
                { status: 400 }
            );
        }

        const newCooked = await createCooked(body);
        return NextResponse.json(newCooked, { status: 201 });
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
            { error: 'Failed to create cooked item', details: errorMessage },
            { status: 500 }
        );
    }
}

