import { NextRequest, NextResponse } from 'next/server';
import { getInventory, createInventory } from '@/app/services/inventoryService';

export async function GET() {
    try {
        const inventoryItems = await getInventory();
        return NextResponse.json(inventoryItems, { status: 200 });
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        return NextResponse.json(
            { error: 'Failed to fetch inventory', details: errorMessage },
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

        // Validation: required fields for inventory
        if (!body.name || body.batchPurchaseCost === undefined ||
            body.currentStock === undefined || body.estimatedUsedPerDay === undefined) {
            return NextResponse.json(
                { error: 'Missing required fields: name, batchPurchaseCost, currentStock, estimatedUsedPerDay' },
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
        if (typeof body.batchPurchaseCost !== 'number' || body.batchPurchaseCost < 0) {
            return NextResponse.json(
                { error: 'batchPurchaseCost must be a non-negative number' },
                { status: 400 }
            );
        }
        if (typeof body.currentStock !== 'number' || body.currentStock < 0) {
            return NextResponse.json(
                { error: 'currentStock must be a non-negative number' },
                { status: 400 }
            );
        }
        if (typeof body.estimatedUsedPerDay !== 'number' || body.estimatedUsedPerDay < 0) {
            return NextResponse.json(
                { error: 'estimatedUsedPerDay must be a non-negative number' },
                { status: 400 }
            );
        }

        const newInventory = await createInventory(body);
        return NextResponse.json(newInventory, { status: 201 });
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        return NextResponse.json(
            { error: 'Failed to create inventory item', details: errorMessage },
            { status: 500 }
        );
    }
}

