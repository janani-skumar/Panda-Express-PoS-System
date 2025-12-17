import { NextRequest, NextResponse } from "next/server";
import { cookRecipe } from "@/app/services/cookedService";

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id: idString } = await params;
        const id = parseInt(idString);
        if (isNaN(id)) {
            return NextResponse.json({ error: 'Invalid ID: must be a number' }, { status: 400 });
        }
        console.log("HERE: ", id);
        const cooked = await cookRecipe(id);
        console.log("Cooked recipe: ", cooked);
        return NextResponse.json(cooked, { status: 200 });
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';

        // Handle specific error cases
        if (errorMessage.includes('Recipe not found')) {
            return NextResponse.json(
                { error: 'Recipe not found', details: errorMessage },
                { status: 404 }
            );
        }
        if (errorMessage.includes('Insufficient inventory') || errorMessage.includes('Inventory not found')) {
            return NextResponse.json(
                { error: errorMessage },
                { status: 400 }
            );
        }
        console.log("Error: ", errorMessage);
        return NextResponse.json(
            { error: 'Failed to cook recipe', details: errorMessage },
            { status: 500 }
        );
    }
}