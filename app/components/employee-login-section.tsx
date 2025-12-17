"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession, signIn } from "next-auth/react";
import { Button } from "@/app/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { UserCircle, Lock } from "lucide-react";
import { signIn as googleSignIn } from "next-auth/react";

export default function EmployeeLoginSection() {
    const [pin, setPin] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const { data: session, status } = useSession();
    const router = useRouter();

    // Auto redirect if logged in
    useEffect(() => {
        if (session) {
            router.push("/employee/kitchen");
        }
    }, [session, router]);

    const handlePinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value.replace(/\D/g, "");
        if (value.length <= 6) setPin(value);
    };

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        if (pin.length < 4) return;

        setIsLoading(true);
        setError("");

        const res = await signIn("credentials", {
            password: pin,
            redirect: false,
        });

        if (res?.error) {
            setError("Invalid login PIN");
        }

        setIsLoading(false);
    };

    if (session) {
        return (
            <Card className="border-2 border-green-200 shadow-lg bg-green-50">
                <CardHeader className="text-center space-y-3">
                    <CardTitle className="text-2xl font-bold text-green-900">
                        Welcome, {session.user?.name || "Employee"}!
                    </CardTitle>
                    <CardDescription className="text-green-700">
                        Redirecting to home...
                    </CardDescription>
                </CardHeader>
                <CardContent className="flex justify-center">
                    <Link href="/employee/kitchen">
                        <Button className="bg-neutral-900 hover:bg-neutral-800 text-white px-6 py-3 rounded-lg">
                            Go Now
                        </Button>
                    </Link>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="border-2 border-neutral-200 shadow-lg">
            <CardHeader className="space-y-4 pb-8">
                <div className="flex items-center justify-center">
                    <div className="rounded-full bg-neutral-900/10 p-6">
                        <UserCircle className="h-16 w-16 text-neutral-900" />
                    </div>
                </div>
                <div className="text-center">
                    <CardTitle className="text-3xl font-bold text-neutral-900">
                        Employee Login
                    </CardTitle>
                    <CardDescription className="mt-2 text-base text-neutral-600">
                        Enter your PIN to access the system
                    </CardDescription>
                </div>
            </CardHeader>

            <CardContent>
                <form onSubmit={handleLogin} className="space-y-6">
                    <div className="space-y-2">
                        <Label htmlFor="pin" className="text-base font-semibold text-neutral-900">
                            PIN Number
                        </Label>

                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-400" />
                            <Input
                                id="pin"
                                type="password"
                                value={pin}
                                onChange={handlePinChange}
                                placeholder="Enter your PIN"
                                className="pl-10 text-center text-2xl tracking-widest font-mono h-14 rounded-xl"
                                maxLength={6}
                            />
                        </div>
                    </div>
                    <div className="space-y-4 mb-6">
                        <Button
                            onClick={() => googleSignIn("google", { callbackUrl: "/employee/kitchen" })}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl"
                        >
                            Sign in with Google
                        </Button>
                    </div>

                    {/* Keypad */}
                    <div className="grid grid-cols-3 gap-3">
                        {[1,2,3,4,5,6,7,8,9].map((num) => (
                            <Button
                                key={num}
                                type="button"
                                variant="outline"
                                onClick={() => setPin((p) => (p.length < 6 ? p + num : p))}
                                className="h-16 text-2xl font-semibold"
                            >
                                {num}
                            </Button>
                        ))}

                        <Button type="button" variant="outline" onClick={() => setPin("")}>
                            Clear
                        </Button>

                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setPin((p) => (p.length < 6 ? p + "0" : p))}
                        >
                            0
                        </Button>

                        <Button
                            type="submit"
                            disabled={isLoading || pin.length < 4}
                            className="h-16 text-lg bg-neutral-900 text-white rounded-xl"
                        >
                            {isLoading ? "..." : "Login"}
                        </Button>
                    </div>

                    {error && <p className="text-red-600 text-center">{error}</p>}
                </form>
            </CardContent>
        </Card>
    );
}
