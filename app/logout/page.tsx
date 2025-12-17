"use client";

import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { CartProvider, useCart } from "@/app/providers/cart-provider";
import Image from "next/image";
import { CheckCircle } from "lucide-react";

function LogoutContent() {
    const router = useRouter();
    const [loaded, setLoaded] = useState(false);
    const [showCheckmark, setShowCheckmark] = useState(false);
    const { clearCart } = useCart();

    useEffect(() => {
        // Clear cart only once on mount
        clearCart();
        // fade-in after component mounts
        const fadeTimer = setTimeout(() => setLoaded(true), 100);
        // Show checkmark after initial animation
        const checkmarkTimer = setTimeout(() => setShowCheckmark(true), 600);

        // redirect after 3.5 seconds
        const redirectTimer = setTimeout(() => {
            router.push("/");
        }, 3500);

        return () => {
            clearTimeout(fadeTimer);
            clearTimeout(checkmarkTimer);
            clearTimeout(redirectTimer);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // Only run once on mount

    return (
        <div className="flex h-screen w-full items-center justify-center bg-maroon-gradient overflow-hidden relative">
            {/* Decorative background elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-20 -left-20 w-96 h-96 rounded-full bg-white/5 blur-3xl" />
                <div className="absolute -bottom-32 -right-32 w-[500px] h-[500px] rounded-full bg-white/5 blur-3xl" />
                <div className="absolute top-1/4 right-1/4 w-64 h-64 rounded-full bg-white/3 blur-2xl" />
            </div>

            {/* Main content card */}
            <div
                className={`relative z-10 flex flex-col items-center gap-8 p-12 rounded-3xl 
                    bg-white/10 backdrop-blur-xl border border-white/20 
                    shadow-[0_8px_32px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.1)]
                    transform transition-all duration-1000 ease-out
                    ${
                        loaded
                            ? "opacity-100 scale-100 translate-y-0"
                            : "opacity-0 scale-90 translate-y-8"
                    }`}
            >
                {/* Logo and checkmark */}
                <div className="relative">
                    <div
                        className={`flex items-center justify-center w-28 h-28 rounded-full 
                            bg-white/15 backdrop-blur-sm border border-white/25
                            shadow-[0_4px_20px_rgba(0,0,0,0.2),inset_0_2px_0_rgba(255,255,255,0.1)]
                            transform transition-all duration-700 delay-200
                            ${
                                loaded
                                    ? "scale-100 rotate-0"
                                    : "scale-50 rotate-[-20deg]"
                            }`}
                    >
                        <Image
                            src="/Panda Express/round_logo.png"
                            alt="Panda Express Logo"
                            width={80}
                            height={80}
                            className="rounded-full"
                        />
                    </div>
                    {/* Success checkmark badge */}
                    <div
                        className={`absolute -bottom-1 -right-1 w-10 h-10 rounded-full 
                            bg-emerald-500 flex items-center justify-center
                            shadow-[0_2px_12px_rgba(16,185,129,0.5)]
                            transform transition-all duration-500
                            ${
                                showCheckmark
                                    ? "scale-100 opacity-100"
                                    : "scale-0 opacity-0"
                            }`}
                    >
                        <CheckCircle className="w-6 h-6 text-white" />
                    </div>
                </div>

                {/* Thank you message */}
                <div className="flex flex-col items-center gap-3 text-center">
                    <h1
                        className={`text-4xl md:text-5xl font-bold kedebideri-bold text-white
                            transform transition-all duration-700 delay-300
                            ${
                                loaded
                                    ? "opacity-100 translate-y-0"
                                    : "opacity-0 translate-y-4"
                            }`}
                    >
                        Thank you!
                    </h1>
                    <p
                        className={`text-lg md:text-xl text-white/80 font-medium
                            transform transition-all duration-700 delay-400
                            ${
                                loaded
                                    ? "opacity-100 translate-y-0"
                                    : "opacity-0 translate-y-4"
                            }`}
                    >
                        Your order has been placed successfully
                    </p>
                </div>

                {/* Animated takeout box */}
                <div
                    className={`text-6xl transform transition-all duration-700 delay-500
                        ${
                            loaded
                                ? "opacity-100 scale-100"
                                : "opacity-0 scale-50"
                        }`}
                >
                    <span className="inline-block animate-bounce">🥡</span>
                </div>

                {/* Redirect notice */}
                <p
                    className={`text-sm text-white/50 
                        transform transition-all duration-700 delay-700
                        ${loaded ? "opacity-100" : "opacity-0"}`}
                >
                    Redirecting you to the home page...
                </p>

                {/* Progress bar */}
                <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
                    <div
                        className={`h-full bg-white/60 rounded-full transition-all duration-3000 ease-linear
                            ${loaded ? "w-full" : "w-0"}`}
                    />
                </div>
            </div>
        </div>
    );
}

export default function LogoutPage() {
    return (
        <CartProvider>
            <LogoutContent />
        </CartProvider>
    );
}
