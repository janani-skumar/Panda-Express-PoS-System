"use client";

import AdminTabsCard from "@/app/components/admin-tabs-card";
import Image from "next/image";
import Link from "next/link";
import { ManagerGuard } from "@/app/components/manager-guard";

export default function Page() {
    return (
        <ManagerGuard>
            <div className="min-h-screen flex flex-col bg-background">
                <header className="border-b border-border bg-card shadow-md sticky top-0 z-50">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-5">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg overflow-hidden">
                                    <Image
                                        src="/Panda Express/round_logo.png"
                                        alt="Panda Express Logo"
                                        width={40}
                                        height={40}
                                        className="object-cover"
                                    />
                                </div>
                                <div className="flex flex-col">
                                    <h1 className="text-2xl font-bold text-foreground tracking-tight">
                                        Manager Dashboard
                                    </h1>
                                    <p className="text-xs text-muted-foreground mt-0.5">
                                        Restaurant Operations
                                    </p>
                                </div>
                            </div>
                            <Link
                                href="/employee/kitchen"
                                className="text-sm text-muted-foreground hover:text-foreground transition-colors px-3 py-1.5 rounded-md hover:bg-muted/50"
                            >
                                Kitchen
                            </Link>
                        </div>
                    </div>
                </header>

                <main className="flex-1 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
                    <AdminTabsCard />
                </main>

                <footer className="border-t border-border bg-card mt-12">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                            <p className="text-sm text-muted-foreground">
                                © 2025 Panda Express. All rights reserved.
                            </p>
                            <p className="text-xs text-muted-foreground">
                                Management System v1.0
                            </p>
                        </div>
                    </div>
                </footer>
            </div>
        </ManagerGuard>
    );
}
