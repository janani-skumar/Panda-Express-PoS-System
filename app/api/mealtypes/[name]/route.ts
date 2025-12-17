import { NextRequest, NextResponse } from 'next/server';
import { getMealTypeByName, updateMealType, deleteMealType } from '@/app/services/mealTypeService';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ name: string }> }
) {
    try {
        const { name } = await params;
        if (!name || name.trim() === '') {
            return NextResponse.json({ error: 'Invalid name: name cannot be empty' }, { status: 400 });
        }

        const mealType = await getMealTypeByName(name);
        
        // Check if resource exists
        if (!mealType || (Array.isArray(mealType) && mealType.length === 0)) {
            return NextResponse.json(
                { error: 'Meal type not found' },
                { status: 404 }
            );
        }

        return NextResponse.json(mealType, { status: 200 });
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        return NextResponse.json(
            { error: 'Failed to fetch meal type', details: errorMessage },
            { status: 500 }
        );
    }
}

export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ name: string }> }
) {
    try {
        const { name } = await params;
        if (!name || name.trim() === '') {
            return NextResponse.json({ error: 'Invalid name: name cannot be empty' }, { status: 400 });
        }

        // Check if resource exists before updating
        const existing = await getMealTypeByName(name);
        if (!existing || (Array.isArray(existing) && existing.length === 0)) {
            return NextResponse.json(
                { error: 'Meal type not found' },
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
        if (body.sides !== undefined && (typeof body.sides !== 'number' || body.sides < 0)) {
            return NextResponse.json(
                { error: 'sides must be a non-negative number' },
                { status: 400 }
            );
        }
        if (body.entrees !== undefined && (typeof body.entrees !== 'number' || body.entrees < 0)) {
            return NextResponse.json(
                { error: 'entrees must be a non-negative number' },
                { status: 400 }
            );
        }
        if (body.drinks !== undefined && (typeof body.drinks !== 'number' || body.drinks < 0)) {
            return NextResponse.json(
                { error: 'drinks must be a non-negative number' },
                { status: 400 }
            );
        }
        if (body.price !== undefined && (typeof body.price !== 'number' || body.price < 0)) {
            return NextResponse.json(
                { error: 'price must be a non-negative number' },
                { status: 400 }
            );
        }

        const updated = await updateMealType(name, body);
        return NextResponse.json(updated, { status: 200 });
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        return NextResponse.json(
            { error: 'Failed to update meal type', details: errorMessage },
            { status: 500 }
        );
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ name: string }> }
) {
    try {
        const { name } = await params;
        if (!name || name.trim() === '') {
            return NextResponse.json({ error: 'Invalid name: name cannot be empty' }, { status: 400 });
        }

        // Check if resource exists before deleting
        const existing = await getMealTypeByName(name);
        if (!existing || (Array.isArray(existing) && existing.length === 0)) {
            return NextResponse.json(
                { error: 'Meal type not found' },
                { status: 404 }
            );
        }

        await deleteMealType(name);
        return NextResponse.json({ message: 'Meal type deleted successfully' }, { status: 200 });
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        
        // Handle database constraint errors
        if (errorMessage.includes('foreign key') || errorMessage.includes('violates foreign key')) {
            return NextResponse.json(
                { error: 'Cannot delete: meal type is referenced by other records', details: errorMessage },
                { status: 409 }
            );
        }

        return NextResponse.json(
            { error: 'Failed to delete meal type', details: errorMessage },
            { status: 500 }
        );
    }
}


