import { NextRequest, NextResponse } from 'next/server';
import { getRoleById, updateRole, deleteRole } from '@/app/services/roleService';

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

        const role = await getRoleById(id);
        
        // Check if resource exists
        if (!role || (Array.isArray(role) && role.length === 0)) {
            return NextResponse.json(
                { error: 'Role not found' },
                { status: 404 }
            );
        }

        return NextResponse.json(role, { status: 200 });
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        return NextResponse.json(
            { error: 'Failed to fetch role', details: errorMessage },
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
        const existing = await getRoleById(id);
        if (!existing || (Array.isArray(existing) && existing.length === 0)) {
            return NextResponse.json(
                { error: 'Role not found' },
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
        if (body.canDiscount !== undefined && typeof body.canDiscount !== 'boolean') {
            return NextResponse.json(
                { error: 'canDiscount must be a boolean' },
                { status: 400 }
            );
        }
        if (body.canRestock !== undefined && typeof body.canRestock !== 'boolean') {
            return NextResponse.json(
                { error: 'canRestock must be a boolean' },
                { status: 400 }
            );
        }
        if (body.canEditEmployees !== undefined && typeof body.canEditEmployees !== 'boolean') {
            return NextResponse.json(
                { error: 'canEditEmployees must be a boolean' },
                { status: 400 }
            );
        }

        const updatedRole = await updateRole(id, body);
        return NextResponse.json(updatedRole, { status: 200 });
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        return NextResponse.json(
            { error: 'Failed to update role', details: errorMessage },
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
        const existing = await getRoleById(id);
        if (!existing || (Array.isArray(existing) && existing.length === 0)) {
            return NextResponse.json(
                { error: 'Role not found' },
                { status: 404 }
            );
        }

        await deleteRole(id);
        return NextResponse.json({ message: 'Role deleted successfully' }, { status: 200 });
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        
        // Handle database constraint errors
        if (errorMessage.includes('foreign key') || errorMessage.includes('violates foreign key')) {
            return NextResponse.json(
                { error: 'Cannot delete: role is referenced by employees', details: errorMessage },
                { status: 409 }
            );
        }

        return NextResponse.json(
            { error: 'Failed to delete role', details: errorMessage },
            { status: 500 }
        );
    }
}

