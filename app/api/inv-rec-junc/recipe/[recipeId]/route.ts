import { NextRequest, NextResponse } from 'next/server';
import { getIngredientsByRecipeId } from '@/app/services/invRecService';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ recipeId: string }> }
) {
    try {
        const { recipeId: recipeIdString } = await params;
        const recipeId = parseInt(recipeIdString);
        if (isNaN(recipeId)) {
            return NextResponse.json({ error: 'Invalid recipeId: must be a number' }, { status: 400 });
        }

        const ingredients = await getIngredientsByRecipeId(recipeId);
        
        return NextResponse.json(ingredients ?? [], { status: 200 });
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        return NextResponse.json(
            { error: 'Failed to fetch ingredients by recipe ID', details: errorMessage },
            { status: 500 }
        );
    }
}

