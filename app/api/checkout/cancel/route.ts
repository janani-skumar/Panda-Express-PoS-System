import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    // Get base URL for redirect - use same logic as checkout/create
    // Priority: NEXTAUTH_URL > request origin > fallback
    let baseUrl = process.env.NEXTAUTH_URL;
    
    // If NEXTAUTH_URL is not set, use the request origin
    if (!baseUrl) {
        const origin = request.headers.get('origin') || request.nextUrl.origin;
        baseUrl = origin;
    }
    
    // Ensure we have a valid URL
    if (!baseUrl) {
        baseUrl = 'https://project-3-team-41-zbyt.onrender.com/'; // Fallback to production URL
    }
    
    // Ensure the URL doesn't have a trailing slash
    baseUrl = baseUrl.replace(/\/$/, '');
    
    // Redirect back to home page, cart remains intact
    return NextResponse.redirect(new URL('/home/build', baseUrl));
}
