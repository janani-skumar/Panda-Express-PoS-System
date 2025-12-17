import { NextRequest, NextResponse } from 'next/server';
import { getExpenses, createExpense } from '@/app/services/expenseService';

export async function GET() {
    try {
        const expenses = await getExpenses();
        return NextResponse.json(expenses, { status: 200 });
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        return NextResponse.json(
            { error: 'Failed to fetch expenses', details: errorMessage },
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

        // Validation: required fields for expenses
        if (body.cost === undefined || !body.itemId || !body.expenseTime) {
            return NextResponse.json(
                { error: 'Missing required fields: cost, itemId, expenseTime' },
                { status: 400 }
            );
        }

        // Type validation
        if (typeof body.cost !== 'number' || body.cost < 0) {
            return NextResponse.json(
                { error: 'cost must be a non-negative number' },
                { status: 400 }
            );
        }
        if (typeof body.itemId !== 'number') {
            return NextResponse.json(
                { error: 'itemId must be a number' },
                { status: 400 }
            );
        }
        if (typeof body.expenseTime !== 'string' || body.expenseTime.trim() === '') {
            return NextResponse.json(
                { error: 'expenseTime must be a non-empty string' },
                { status: 400 }
            );
        }

        const newExpense = await createExpense(body);
        return NextResponse.json(newExpense, { status: 201 });
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';

        // Handle database constraint errors
        if (errorMessage.includes('foreign key') || errorMessage.includes('violates foreign key')) {
            return NextResponse.json(
                { error: 'Invalid itemId: inventory item does not exist', details: errorMessage },
                { status: 400 }
            );
        }

        return NextResponse.json(
            { error: 'Failed to create expense', details: errorMessage },
            { status: 500 }
        );
    }
}

