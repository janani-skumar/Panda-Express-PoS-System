import { NextRequest, NextResponse } from 'next/server';
import { getMealTypes, createMealType } from '@/app/services/mealTypeService';

export async function GET() {
    try {
        const all = await getMealTypes();
        return NextResponse.json(all, { status: 200 });
    } catch (error) {
        console.error('Error fetching meal types:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        return NextResponse.json(
            { error: 'Failed to fetch meal types', details: errorMessage },
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

        // Validation: required fields for meal types
        if (!body.name || body.sides === undefined || body.entrees === undefined || body.drinks === undefined || body.price === undefined) {
            return NextResponse.json(
                { error: 'Missing required fields: name, sides, entrees, drinks, price' },
                { status: 400 }
            );
        }

        // Type validation
        if (typeof body.name !== 'string' || body.name.trim() === '') {
            return NextResponse.json(
                { error: 'name must be a non-empty string' },
                { status: 400 }
            );
        }
        if (typeof body.sides !== 'number' || body.sides < 0) {
            return NextResponse.json(
                { error: 'sides must be a non-negative number' },
                { status: 400 }
            );
        }
        if (typeof body.entrees !== 'number' || body.entrees < 0) {
            return NextResponse.json(
                { error: 'entrees must be a non-negative number' },
                { status: 400 }
            );
        }
        if (typeof body.drinks !== 'number' || body.drinks < 0) {
            return NextResponse.json(
                { error: 'drinks must be a non-negative number' },
                { status: 400 }
            );
        }
        if (typeof body.price !== 'number' || body.price < 0) {
            return NextResponse.json(
                { error: 'price must be a non-negative number' },
                { status: 400 }
            );
        }

        const created = await createMealType(body);
        return NextResponse.json(created, { status: 201 });
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        
        // Handle database constraint errors (e.g., duplicate name)
        if (errorMessage.includes('unique') || errorMessage.includes('duplicate')) {
            return NextResponse.json(
                { error: 'Meal type with this name already exists', details: errorMessage },
                { status: 409 }
            );
        }

        return NextResponse.json(
            { error: 'Failed to create meal type', details: errorMessage },
            { status: 500 }
        );
    }
}


