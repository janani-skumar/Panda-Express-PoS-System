import type React from "react";
import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";
import { Toaster } from "sonner";
import ClientProviders from "./client-providers";
import { Metadata } from "next";

const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"], variable: "--font-geist-mono" });

export const metadata: Metadata = {
  title: "Panda Express PoS System",
  description: "Point of Sale System for Panda Express",
  generator: "v0.app",
  icons: {
    icon: "/Panda Express/round_logo.png",
    shortcut: "/Panda Express/round_logo.png",
    apple: "/Panda Express/round_logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com"/>
        <link rel="preconnect" href="https://fonts.gstatic.com" />
        <link href="https://fonts.googleapis.com/css2?family=Kedebideri:wght@400;500;600;700;800;900&display=swap" rel="stylesheet"></link>
      </head>
      <body
        className={`kedebideri-regular antialiased`}
      >
        {/* All global client-side providers (Auth, theme, etc.) */}
        <ClientProviders>
            {children}
        </ClientProviders>
        <Toaster position="top-center" richColors/>
        
        {/* Vercel Analytics */}
        <Analytics />
      </body>
    </html>
  );
}
