import { NextRequest, NextResponse } from "next/server";
import { createEmployee, getEmployees } from "@/app/services/employeesService";
import { Employee } from "@/lib/types";

export async function GET() {
    try {
        const employees = await getEmployees();
        return NextResponse.json(employees, { status: 200 });
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        return NextResponse.json(
            { error: 'Failed to fetch employees', details: errorMessage },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        let body: Employee;
        try {
            body = await request.json();
        } catch (parseError) {
            return NextResponse.json(
                { error: 'Invalid JSON in request body' },
                { status: 400 }
            );
        }
        const employee = await createEmployee(body);
        return NextResponse.json(employee, { status: 201 });
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        return NextResponse.json(
            { error: 'Failed to create employee', details: errorMessage },
            { status: 500 }
        );
    }
}