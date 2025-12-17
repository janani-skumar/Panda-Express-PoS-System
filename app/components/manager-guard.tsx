"use client";

import { useEffect, useState } from "react";
import { useSession, signIn } from "next-auth/react";
import { usePathname } from "next/navigation";
import { Button } from "@/app/components/ui/button";
import { Skeleton } from "@/app/components/ui/skeleton";

type ManagerGuardProps = {
    children: React.ReactNode;
};

const MANAGER_ROLE_ID = 1;
const ADMIN_ROLE_ID = 0;

export function ManagerGuard({ children }: ManagerGuardProps) {
    const { data: session, status } = useSession();
    const pathname = usePathname();
    const [callbackUrl, setCallbackUrl] = useState<string>("/");

    useEffect(() => {
        // Keep callback stable for login redirect
        if (pathname) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setCallbackUrl(pathname);
        }
    }, [pathname]);

    if (status === "loading") {
        return (
            <div className="min-h-screen flex items-center justify-center bg-neutral-50 p-10">
                <div className="space-y-4 text-center">
                    <Skeleton className="h-10 w-60 mx-auto" />
                    <Skeleton className="h-6 w-40 mx-auto" />
                </div>
            </div>
        );
    }

    if (!session) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-neutral-50 p-6">
                <div className="max-w-md w-full text-center space-y-4 p-6 border border-neutral-200 rounded-xl shadow-sm bg-white">
                    <h1 className="text-2xl font-semibold text-neutral-900">
                        Managers only
                    </h1>
                    <p className="text-neutral-600">
                        Please sign in as a manager to access this page.
                    </p>
                    <Button
                        className="w-full"
                        onClick={() =>
                            signIn(undefined, { callbackUrl: callbackUrl })
                        }
                    >
                        Go to login
                    </Button>
                </div>
            </div>
        );
    }

    if (
        session.user?.roleId !== MANAGER_ROLE_ID &&
        session.user?.roleId !== ADMIN_ROLE_ID
    ) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-neutral-50 p-6">
                <div className="max-w-md w-full text-center space-y-4 p-6 border border-neutral-200 rounded-xl shadow-sm bg-white">
                    <h1 className="text-2xl font-semibold text-neutral-900">
                        Access restricted
                    </h1>
                    <p className="text-neutral-600">
                        This page is restricted to managers. Please sign in with
                        a manager account.
                    </p>
                    <Button
                        variant="outline"
                        className="w-full"
                        onClick={() =>
                            signIn(undefined, { callbackUrl: callbackUrl })
                        }
                    >
                        Switch account
                    </Button>
                </div>
            </div>
        );
    }

    return <>{children}</>;
}

export default ManagerGuard;

type AuthGuardProps = {
    children: React.ReactNode;
};

/**
 * AuthGuard: requires any authenticated session, preserves callbackUrl.
 * Use when a page should be reachable by all roles but requires login.
 */
export function AuthGuard({ children }: AuthGuardProps) {
    const { data: session, status } = useSession();
    const pathname = usePathname();
    const [callbackUrl, setCallbackUrl] = useState<string>("/");

    useEffect(() => {
        if (pathname) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setCallbackUrl(pathname);
        }
    }, [pathname]);

    if (status === "loading") {
        return (
            <div className="min-h-screen flex items-center justify-center bg-neutral-50 p-10">
                <div className="space-y-4 text-center">
                    <Skeleton className="h-10 w-60 mx-auto" />
                    <Skeleton className="h-6 w-40 mx-auto" />
                </div>
            </div>
        );
    }

    if (!session) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-neutral-50 p-6">
                <div className="max-w-md w-full text-center space-y-4 p-6 border border-neutral-200 rounded-xl shadow-sm bg-white">
                    <h1 className="text-2xl font-semibold text-neutral-900">
                        Sign in required
                    </h1>
                    <p className="text-neutral-600">
                        Please sign in to continue.
                    </p>
                    <Button
                        className="w-full"
                        onClick={() =>
                            signIn(undefined, { callbackUrl: callbackUrl })
                        }
                    >
                        Go to login
                    </Button>
                </div>
            </div>
        );
    }

    return <>{children}</>;
}
