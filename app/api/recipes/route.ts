import { NextRequest, NextResponse } from 'next/server';
import { getRecipes, createRecipe } from '@/app/services/recipeService';

export async function GET() {
    try {
        const recipes = await getRecipes();
        return NextResponse.json(recipes, { status: 200 });
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        return NextResponse.json(
            { error: 'Failed to fetch recipes', details: errorMessage },
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

        // Validation: required fields for recipes
        if (!body.name || !body.pricePerServing || !body.ordersPerBatch) {
            return NextResponse.json(
                { error: 'Missing required fields: name, pricePerServing, ordersPerBatch' },
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
        if (typeof body.pricePerServing !== 'number' || body.pricePerServing < 0) {
            return NextResponse.json(
                { error: 'pricePerServing must be a non-negative number' },
                { status: 400 }
            );
        }
        if (typeof body.ordersPerBatch !== 'number' || body.ordersPerBatch < 1) {
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

        const newRecipe = await createRecipe(body);
        return NextResponse.json(newRecipe, { status: 201 });
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        return NextResponse.json(
            { error: 'Failed to create recipe', details: errorMessage },
            { status: 500 }
        );
    }
}

