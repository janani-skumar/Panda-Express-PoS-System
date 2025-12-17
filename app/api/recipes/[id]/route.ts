import { NextRequest, NextResponse } from 'next/server';
import { getRecipeById, updateRecipe, deleteRecipe } from '@/app/services/recipeService';

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

        const recipe = await getRecipeById(id);

        // Check if resource exists
        if (!recipe || (Array.isArray(recipe) && recipe.length === 0)) {
            return NextResponse.json(
                { error: 'Recipe not found' },
                { status: 404 }
            );
        }

        return NextResponse.json(recipe, { status: 200 });
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        return NextResponse.json(
            { error: 'Failed to fetch recipe', details: errorMessage },
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
        const existing = await getRecipeById(id);
        if (!existing || (Array.isArray(existing) && existing.length === 0)) {
            return NextResponse.json(
                { error: 'Recipe not found' },
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
        if (body.pricePerServing !== undefined && (typeof body.pricePerServing !== 'number' || body.pricePerServing < 0)) {
            return NextResponse.json(
                { error: 'pricePerServing must be a non-negative number' },
                { status: 400 }
            );
        }
        if (body.ordersPerBatch !== undefined && (typeof body.ordersPerBatch !== 'number' || body.ordersPerBatch < 1)) {
            return NextResponse.json(
                { error: 'ordersPerBatch must be a positive number' },
                { status: 400 }
            );
        }
        if (body.type !== undefined && !['Side', 'Entree', 'Drink', 'Appetizer'].includes(body.type)) {
            return NextResponse.json(
                { error: 'type must be one of: Side, Entree, Drink, Appetizer' },
                { status: 400 }
            );
        }
        if (body.image !== undefined && typeof body.image !== 'string') {
            return NextResponse.json(
                { error: 'image must be a string' },
                { status: 400 }
            );
        }

        const updatedRecipe = await updateRecipe(id, body);
        return NextResponse.json(updatedRecipe, { status: 200 });
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        return NextResponse.json(
            { error: 'Failed to update recipe', details: errorMessage },
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
        const existing = await getRecipeById(id);
        if (!existing || (Array.isArray(existing) && existing.length === 0)) {
            return NextResponse.json(
                { error: 'Recipe not found' },
                { status: 404 }
            );
        }

        await deleteRecipe(id);
        return NextResponse.json({ message: 'Recipe deleted successfully' }, { status: 200 });
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';

        // Handle database constraint errors
        if (errorMessage.includes('foreign key') || errorMessage.includes('violates foreign key')) {
            return NextResponse.json(
                { error: 'Cannot delete: recipe is referenced by other records', details: errorMessage },
                { status: 409 }
            );
        }

        return NextResponse.json(
            { error: 'Failed to delete recipe', details: errorMessage },
            { status: 500 }
        );
    }
}

