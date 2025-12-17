import { NextRequest, NextResponse } from 'next/server';
import { getRoles, createRole } from '@/app/services/roleService';

export async function GET() {
    try {
        const roles = await getRoles();
        return NextResponse.json(roles, { status: 200 });
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        return NextResponse.json(
            { error: 'Failed to fetch roles', details: errorMessage },
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

        // Validation: required fields for roles
        if (!body.name || body.canDiscount === undefined ||
            body.canRestock === undefined || body.canEditEmployees === undefined) {
            return NextResponse.json(
                { error: 'Missing required fields: name, canDiscount, canRestock, canEditEmployees' },
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
        if (typeof body.canDiscount !== 'boolean') {
            return NextResponse.json(
                { error: 'canDiscount must be a boolean' },
                { status: 400 }
            );
        }
        if (typeof body.canRestock !== 'boolean') {
            return NextResponse.json(
                { error: 'canRestock must be a boolean' },
                { status: 400 }
            );
        }
        if (typeof body.canEditEmployees !== 'boolean') {
            return NextResponse.json(
                { error: 'canEditEmployees must be a boolean' },
                { status: 400 }
            );
        }

        const newRole = await createRole(body);
        return NextResponse.json(newRole, { status: 201 });
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        return NextResponse.json(
            { error: 'Failed to create role', details: errorMessage },
            { status: 500 }
        );
    }
}

