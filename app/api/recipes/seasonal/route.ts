import { NextRequest, NextResponse } from "next/server";
import { createSeasonalMenuItem } from "@/app/services/seasonalMenuService";

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        // Validation: required fields for recipe
        if (!body.recipe || !body.recipe.name || body.recipe.pricePerServing === undefined || 
            body.recipe.ordersPerBatch === undefined || !body.recipe.type) {
            return NextResponse.json(
                { error: 'Missing required recipe fields: name, pricePerServing, ordersPerBatch, type' },
                { status: 400 }
            );
        }

        // Validation: inventory items required
        if (!body.inventoryItems || !Array.isArray(body.inventoryItems) || body.inventoryItems.length === 0) {
            return NextResponse.json(
                { error: 'At least one inventory item is required' },
                { status: 400 }
            );
        }

        // Validate each inventory item
        for (const item of body.inventoryItems) {
            if (item.inventoryId === undefined && (!item.name || item.batchPurchaseCost === undefined || 
                item.currentStock === undefined || item.estimatedUsedPerDay === undefined)) {
                return NextResponse.json(
                    { error: 'Inventory items must have either inventoryId or all of: name, batchPurchaseCost, currentStock, estimatedUsedPerDay' },
                    { status: 400 }
                );
            }
            if (item.inventoryQuantity === undefined) {
                return NextResponse.json(
                    { error: 'All inventory items must have inventoryQuantity' },
                    { status: 400 }
                );
            }
        }

        const result = await createSeasonalMenuItem(body.recipe, body.inventoryItems);
        return NextResponse.json(result, { status: 201 });
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        return NextResponse.json({ error: 'Failed to create seasonal menu item: ' + errorMessage }, { status: 500 });
    }
}

