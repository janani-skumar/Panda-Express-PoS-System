import { NextRequest, NextResponse } from "next/server";
import { verifyLoginPassword } from "@/app/services/authService";

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { password } = body;

        if (!password) {
            return NextResponse.json({ error: "Missing password" }, { status: 400 });
        }

        const user = await verifyLoginPassword(password);

        if (!user) {
            return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
        }

        return NextResponse.json(user, { status: 200 });
    } catch (error) {
        console.error("Login route error:", error);
        return NextResponse.json({ error: "Failed to verify login" }, { status: 500 });
    }
}
