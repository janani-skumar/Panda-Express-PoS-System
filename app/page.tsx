"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/app/components/ui/button";
import { ShoppingCart, LogIn } from "lucide-react";
import Image from "next/image";
import { ManagerGuard } from "@/app/components/manager-guard";

export default function Home() {
    const router = useRouter();

    return (
        <ManagerGuard>
            <div className="min-h-screen bg-gradient-to-br from-tamu-maroon via-tamu-maroon-dark to-neutral-900 relative overflow-hidden">
                {/* Animated background elements */}
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-20 left-20 w-64 h-64 bg-white rounded-full blur-3xl animate-pulse"></div>
                    <div className="absolute bottom-20 right-20 w-96 h-96 bg-white rounded-full blur-3xl animate-pulse delay-1000"></div>
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-white rounded-full blur-3xl animate-pulse delay-500"></div>
                </div>

                {/* Employee Login Button - Small, in corner */}
                {/* <div className="absolute top-6 right-6 z-100">
                <Button
                    onClick={() => router.push("/login")}
                    variant="outline"
                    size="sm"
                    className="bg-white/10 backdrop-blur-sm border-white/30 text-white hover:bg-white/20 hover:text-white transition-all"
                >
                    <LogIn className="h-4 w-4 mr-2" />
                    Employee Login
                </Button>
            </div> */}

                {/* Main Content */}
                <div
                    className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4"
                    onClick={() => router.push("/home/build")}
                >
                    {/* Logo and Brand */}
                    <div className="text-center mb-12 animate-fade-in">
                        <div className="inline-block mb-6">
                            <div className="h-32 w-32 rounded-full bg-white flex items-center justify-center shadow-2xl animate-bounce-slow overflow-hidden">
                                <Image
                                    src="/Panda Express/round_logo.png"
                                    alt="Panda Express Logo"
                                    width={128}
                                    height={128}
                                    className="object-cover"
                                />
                            </div>
                        </div>
                        <h1 className="text-7xl font-bold text-white mb-4 drop-shadow-lg">
                            Panda Express
                        </h1>
                        <p className="text-2xl text-white/90 font-light tracking-wide">
                            Fresh • Flavorful • Fast
                        </p>
                    </div>

                    {/* Start Order Button */}
                    <div className="mt-8 animate-fade-in-delay">
                        <Button
                            onClick={() => router.push("/home/build")}
                            size="lg"
                            className="bg-white text-tamu-maroon hover:bg-neutral-100 text-2xl font-bold py-8 px-16 rounded-2xl shadow-2xl hover:shadow-3xl transform hover:scale-105 transition-all duration-300 group"
                        >
                            <ShoppingCart className="h-8 w-8 mr-4 group-hover:animate-bounce" />
                            Touch to Start Your Order
                        </Button>
                    </div>

                    {/* Tagline */}
                    <div className="mt-12 text-center">
                        <p className="text-white/70 text-lg animate-pulse">
                            Tap anywhere to begin
                        </p>
                    </div>
                </div>

                {/* Footer */}
                <div className="absolute bottom-6 left-0 right-0 text-center">
                    <p className="text-white/50 text-sm">
                        Panda Express Point of Sale System
                    </p>
                </div>

                <style jsx>{`
                    @keyframes bounce-slow {
                        0%,
                        100% {
                            transform: translateY(0);
                        }
                        50% {
                            transform: translateY(-20px);
                        }
                    }
                    @keyframes fade-in {
                        from {
                            opacity: 0;
                            transform: translateY(20px);
                        }
                        to {
                            opacity: 1;
                            transform: translateY(0);
                        }
                    }
                    @keyframes fade-in-delay {
                        0% {
                            opacity: 0;
                            transform: translateY(20px);
                        }
                        50% {
                            opacity: 0;
                            transform: translateY(20px);
                        }
                        100% {
                            opacity: 1;
                            transform: translateY(0);
                        }
                    }
                    .animate-bounce-slow {
                        animation: bounce-slow 3s ease-in-out infinite;
                    }
                    .animate-fade-in {
                        animation: fade-in 1s ease-out forwards;
                    }
                    .animate-fade-in-delay {
                        animation: fade-in-delay 2s ease-out forwards;
                    }
                `}</style>
            </div>
        </ManagerGuard>
    );
}
