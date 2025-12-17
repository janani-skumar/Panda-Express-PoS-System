import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
    function proxy(req) {
        const token = req.nextauth.token;
        const path = req.nextUrl.pathname;

        // If trying to access manager route without being authenticated
        if (path.startsWith("/employee/manager") && !token) {
            const loginUrl = new URL("/login", req.url);
            loginUrl.searchParams.set("callbackUrl", path);
            return NextResponse.redirect(loginUrl);
        }

        // If trying to access kitchen route without being authenticated
        if (path.startsWith("/employee/kitchen") && !token) {
            const loginUrl = new URL("/login", req.url);
            loginUrl.searchParams.set("callbackUrl", path);
            return NextResponse.redirect(loginUrl);
        }

        // If trying to access cashier route without being authenticated
        if (path.startsWith("/employee/cashier") && !token) {
            const loginUrl = new URL("/login", req.url);
            loginUrl.searchParams.set("callbackUrl", path);
            return NextResponse.redirect(loginUrl);
        }

        return NextResponse.next();
    },
    {
        callbacks: {
            authorized: ({ token, req }) => {
                const path = req.nextUrl.pathname;

                // Allow access to login page without authentication
                if (path === "/login") {
                    return true;
                }

                // For protected routes, require authentication
                if (path.startsWith("/employee/")) {
                    return !!token;
                }

                // Allow all other routes
                return true;
            },
        },
    }
);

export const config = {
    matcher: [
        "/employee/manager/:path*",
        "/employee/kitchen/:path*",
        "/employee/cashier/:path*",
    ],
};

