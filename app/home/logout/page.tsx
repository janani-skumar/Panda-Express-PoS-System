"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { CheckCircle } from "lucide-react";
import { useCart } from "@/app/providers/cart-provider";

function LogoutPage() {
    const router = useRouter();
    const [loaded, setLoaded] = useState(false);
    const [showCheckmark, setShowCheckmark] = useState(false);
    const { clearCart } = useCart();

    useEffect(() => {
        // Clear cart on mount
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
        <div className="flex items-center justify-center min-h-[calc(100vh-72px)] bg-neutral-50 relative overflow-hidden">
            {/* Decorative background elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-20 -left-20 w-96 h-96 rounded-full bg-tamu-maroon/5 blur-3xl" />
                <div className="absolute -bottom-32 -right-32 w-[500px] h-[500px] rounded-full bg-tamu-maroon/5 blur-3xl" />
            </div>

            {/* Main content card */}
            <div
                className={`relative z-10 flex flex-col items-center gap-8 p-12 rounded-3xl 
                    bg-white border border-neutral-200/80
                    shadow-[0_8px_32px_rgba(0,0,0,0.08)]
                    transform transition-all duration-1000 ease-out
                    ${loaded ? "opacity-100 scale-100 translate-y-0" : "opacity-0 scale-90 translate-y-8"}`}
            >
                {/* Logo and checkmark */}
                <div className="relative">
                    <div
                        className={`flex items-center justify-center w-28 h-28 rounded-full 
                            bg-tamu-maroon/10 border border-tamu-maroon/20
                            shadow-[0_4px_20px_rgba(80,0,0,0.1)]
                            transform transition-all duration-700 delay-200
                            ${loaded ? "scale-100 rotate-0" : "scale-50 rotate-[-20deg]"}`}
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
                            ${showCheckmark ? "scale-100 opacity-100" : "scale-0 opacity-0"}`}
                    >
                        <CheckCircle className="w-6 h-6 text-white" />
                    </div>
                </div>

                {/* Thank you message */}
                <div className="flex flex-col items-center gap-3 text-center">
                    <h1
                        className={`text-4xl md:text-5xl font-bold kedebideri-bold text-tamu-maroon
                            transform transition-all duration-700 delay-300
                            ${loaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
                    >
                        Thank you!
                    </h1>
                    <p
                        className={`text-lg md:text-xl text-neutral-600 font-medium
                            transform transition-all duration-700 delay-400
                            ${loaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
                    >
                        Your order has been placed successfully
                    </p>
                </div>

                {/* Animated takeout box */}
                <div
                    className={`text-6xl transform transition-all duration-700 delay-500
                        ${loaded ? "opacity-100 scale-100" : "opacity-0 scale-50"}`}
                >
                    <span className="inline-block animate-bounce">🥡</span>
                </div>

                {/* Redirect notice */}
                <p
                    className={`text-sm text-neutral-400
                        transform transition-all duration-700 delay-700
                        ${loaded ? "opacity-100" : "opacity-0"}`}
                >
                    Redirecting you to the home page...
                </p>

                {/* Progress bar */}
                <div className="w-full h-1 bg-tamu-maroon/10 rounded-full overflow-hidden">
                    <div
                        className={`h-full bg-tamu-maroon rounded-full transition-all duration-3000 ease-linear
                            ${loaded ? "w-full" : "w-0"}`}
                    />
                </div>
            </div>
        </div>
    );
}

export default LogoutPage;
