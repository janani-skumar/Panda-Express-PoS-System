"use client";

import Link from "next/link";
import Image from "next/image";
import {
    Book,
    Code,
    FileText,
    Home,
    ExternalLink,
    ChevronRight,
} from "lucide-react";

export default function DocsPage() {
    const documentationSections = [
        {
            title: "User Manual",
            description:
                "Step-by-step guides with screenshots for using the POS system",
            icon: Book,
            href: "/docs/manual/index.html",
            items: [
                "Customer Ordering Guide",
                "Cashier Operations",
                "Kitchen Display System",
                "Manager Dashboard",
            ],
            color: "from-red-500 to-red-700",
        },
        {
            title: "API Documentation",
            description:
                "Technical documentation for developers and system integrators",
            icon: Code,
            href: "/docs/api/index.html",
            items: [
                "REST API Endpoints",
                "Service Layer Functions",
                "Database Schema",
                "Type Definitions",
            ],
            color: "from-amber-500 to-amber-600",
        },
    ];

    const quickLinks = [
        {
            title: "Getting Started",
            href: "/docs/manual/index.html#/cover",
            icon: FileText,
        },
        { title: "API Reference", href: "/docs/api/modules.html", icon: Code },
        { title: "Back to App", href: "/", icon: Home },
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
            {/* Header */}
            <header className="bg-gradient-to-r from-red-600 to-red-700 shadow-xl">
                <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
                    <div className="flex items-center gap-4">
                        <Image
                            src="/Panda Express/round_logo.png"
                            alt="Panda Express Logo"
                            width={60}
                            height={60}
                            className="rounded-full shadow-lg"
                        />
                        <div>
                            <h1 className="text-3xl font-bold text-white tracking-tight">
                                Documentation
                            </h1>
                            <p className="text-red-100 text-sm mt-1">
                                Panda Express Point of Sale System
                            </p>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
                {/* Hero Section */}
                <div className="text-center mb-16">
                    <h2 className="text-4xl font-bold text-white mb-4">
                        Welcome to the Documentation
                    </h2>
                    <p className="text-xl text-slate-300 max-w-3xl mx-auto">
                        Everything you need to know about using and integrating
                        with the Panda Express POS system.
                    </p>
                </div>

                {/* Quick Links */}
                <div className="flex flex-wrap justify-center gap-4 mb-16">
                    {quickLinks.map((link) => (
                        <Link
                            key={link.title}
                            href={link.href}
                            className="flex items-center gap-2 px-6 py-3 bg-slate-700/50 hover:bg-slate-600/50 text-slate-200 rounded-full transition-all duration-200 border border-slate-600 hover:border-amber-500 hover:text-amber-400"
                        >
                            <link.icon className="w-4 h-4" />
                            {link.title}
                        </Link>
                    ))}
                </div>

                {/* Documentation Cards */}
                <div className="grid md:grid-cols-2 gap-8 mb-16">
                    {documentationSections.map((section) => (
                        <Link
                            key={section.title}
                            href={section.href}
                            className="group relative overflow-hidden rounded-2xl bg-slate-800/50 border border-slate-700 hover:border-amber-500/50 transition-all duration-300 hover:shadow-2xl hover:shadow-amber-500/10"
                        >
                            {/* Gradient overlay */}
                            <div
                                className={`absolute inset-0 bg-gradient-to-br ${section.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}
                            />

                            <div className="relative p-8">
                                {/* Icon */}
                                <div
                                    className={`w-14 h-14 rounded-xl bg-gradient-to-br ${section.color} flex items-center justify-center mb-6 shadow-lg`}
                                >
                                    <section.icon className="w-7 h-7 text-white" />
                                </div>

                                {/* Title & Description */}
                                <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-amber-400 transition-colors">
                                    {section.title}
                                </h3>
                                <p className="text-slate-400 mb-6">
                                    {section.description}
                                </p>

                                {/* Items */}
                                <ul className="space-y-2 mb-6">
                                    {section.items.map((item) => (
                                        <li
                                            key={item}
                                            className="flex items-center gap-2 text-slate-300"
                                        >
                                            <ChevronRight className="w-4 h-4 text-amber-500" />
                                            {item}
                                        </li>
                                    ))}
                                </ul>

                                {/* CTA */}
                                <div className="flex items-center gap-2 text-amber-500 font-semibold group-hover:text-amber-400">
                                    View Documentation
                                    <ExternalLink className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>

                {/* Additional Info */}
                <div className="bg-slate-800/30 rounded-2xl border border-slate-700 p-8">
                    <h3 className="text-xl font-bold text-white mb-4">
                        About This Documentation
                    </h3>
                    <div className="grid md:grid-cols-2 gap-6 text-slate-300">
                        <div>
                            <h4 className="font-semibold text-amber-500 mb-2">
                                User Manual
                            </h4>
                            <p className="text-sm">
                                The user manual is generated using{" "}
                                <span className="text-amber-400">
                                    auto-docs
                                </span>{" "}
                                with screenshots captured from the live
                                application. It provides visual guides for all
                                user roles including customers, cashiers,
                                kitchen staff, and managers.
                            </p>
                        </div>
                        <div>
                            <h4 className="font-semibold text-amber-500 mb-2">
                                API Documentation
                            </h4>
                            <p className="text-sm">
                                The API documentation is generated using{" "}
                                <span className="text-amber-400">TypeDoc</span>{" "}
                                from JSDoc comments in the source code. It
                                covers all API endpoints, service functions,
                                database schemas, and TypeScript type
                                definitions.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Generating Docs Info */}
                <div className="mt-8 p-6 bg-slate-800/30 rounded-xl border border-slate-700">
                    <h4 className="text-lg font-semibold text-white mb-3">
                        Regenerating Documentation
                    </h4>
                    <p className="text-slate-400 text-sm mb-4">
                        To regenerate the documentation after code changes, run
                        the following commands:
                    </p>
                    <div className="bg-slate-900 rounded-lg p-4 font-mono text-sm">
                        <p className="text-green-400">
                            # Generate API documentation only
                        </p>
                        <p className="text-slate-300 mb-2">npm run docs:api</p>
                        <p className="text-green-400">
                            # Generate user manual (requires running app)
                        </p>
                        <p className="text-slate-300 mb-2">
                            npm run docs:manual
                        </p>
                        <p className="text-green-400">
                            # Generate all documentation
                        </p>
                        <p className="text-slate-300">npm run docs:build</p>
                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer className="bg-slate-900 border-t border-slate-800 mt-16">
                <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                        <div className="flex items-center gap-3">
                            <Image
                                src="/Panda Express/round_logo.png"
                                alt="Panda Express"
                                width={32}
                                height={32}
                                className="rounded-full"
                            />
                            <span className="text-slate-400 text-sm">
                                Panda Express PoS System Documentation
                            </span>
                        </div>
                        <div className="text-slate-500 text-sm">
                            CSCE 331 - Team 41
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}
