"use client";

import React from "react";
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/app/components/ui/sheet";
import { ClientOnly } from "@/app/components/ui/client-only";
import { Button } from "@/app/components/ui/button";
import { Switch } from "@/app/components/ui/switch";
import { Label } from "@/app/components/ui/label";
import { Separator } from "@/app/components/ui/separator";
import { WeatherWidget } from "./app-weather-widget";
import {
    useAccessibility,
    TextSize,
} from "@/app/providers/accessibility-provider";
import { useAccessibilityStyles } from "@/hooks/use-accessibility-styles";
import { cn } from "@/lib/utils";
import {
    Type,
    Accessibility,
    Cloud,
    Thermometer,
    Wind,
    Droplets,
    Sun,
    CloudRain,
    Snowflake,
    CloudSun,
} from "lucide-react";

// Helper function to get weather theme based on conditions
function getWeatherTheme(temperature?: number, precipitation?: number) {
    const isRainy = precipitation && precipitation > 0.1;

    if (isRainy) {
        return {
            gradient: "from-slate-600 via-slate-700 to-slate-800",
            icon: CloudRain,
            iconColor: "text-blue-300",
            label: "Rainy",
            detailBg: "bg-slate-500/30",
            detailBorder: "border-slate-400/30",
        };
    }

    if (!temperature) {
        return {
            gradient: "from-sky-400 via-sky-500 to-sky-600",
            icon: Cloud,
            iconColor: "text-white",
            label: "Unknown",
            detailBg: "bg-sky-400/30",
            detailBorder: "border-sky-300/30",
        };
    }

    if (temperature > 85) {
        return {
            gradient: "from-orange-400 via-orange-500 to-red-500",
            icon: Sun,
            iconColor: "text-yellow-200",
            label: "Hot",
            detailBg: "bg-orange-400/30",
            detailBorder: "border-orange-300/30",
        };
    }

    if (temperature > 70) {
        return {
            gradient: "from-amber-400 via-yellow-400 to-orange-400",
            icon: Sun,
            iconColor: "text-yellow-100",
            label: "Warm",
            detailBg: "bg-amber-400/30",
            detailBorder: "border-amber-300/30",
        };
    }

    if (temperature > 50) {
        return {
            gradient: "from-sky-400 via-cyan-400 to-teal-400",
            icon: CloudSun,
            iconColor: "text-white",
            label: "Cool",
            detailBg: "bg-sky-400/30",
            detailBorder: "border-sky-300/30",
        };
    }

    return {
        gradient: "from-blue-500 via-indigo-500 to-purple-600",
        icon: Snowflake,
        iconColor: "text-blue-200",
        label: "Cold",
        detailBg: "bg-blue-400/30",
        detailBorder: "border-blue-300/30",
    };
}

interface AccessibilitySheetProps {
    temperature?: number;
    precipitation?: number;
    windSpeed?: number;
    windDirection?: number;
    trigger: React.ReactNode;
}

export function AccessibilitySheet({
    temperature,
    precipitation,
    windSpeed,
    windDirection,
    trigger,
}: AccessibilitySheetProps) {
    const { textSize, isBold, setTextSize, setIsBold } = useAccessibility();
    const { textClasses } = useAccessibilityStyles();

    const textSizeOptions: {
        value: TextSize;
        label: string;
        description: string;
    }[] = [
        { value: "small", label: "Small", description: "Compact text" },
        { value: "medium", label: "Medium", description: "Default size" },
        { value: "large", label: "Large", description: "Easier to read" },
        {
            value: "extra-large",
            label: "Extra Large",
            description: "Maximum readability",
        },
    ];

    return (
        <ClientOnly fallback={trigger}>
            <Sheet>
                <SheetTrigger asChild>{trigger}</SheetTrigger>
                <SheetContent
                side="right"
                className="bg-maroon-gradient text-white w-full sm:max-w-md overflow-y-auto border-l border-white/10 p-0"
            >
                <div className="h-full flex flex-col">
                    {/* Header with glass effect */}
                    <SheetHeader className="p-6 border-b border-white/10 bg-white/5 backdrop-blur-sm">
                        <div className="flex items-center gap-4">
                            <div className="size-12 rounded-xl bg-white/15 backdrop-blur-sm flex items-center justify-center shadow-lg border border-white/20">
                                <Accessibility className="size-6 text-white" />
                            </div>
                            <div>
                                <SheetTitle
                                    className={cn(
                                        "text-xl font-bold text-white text-left",
                                        textClasses
                                    )}
                                >
                                    Accessibility
                                </SheetTitle>
                                <SheetDescription
                                    className={cn(
                                        "text-white/70 text-sm text-left",
                                        textClasses
                                    )}
                                >
                                    Customize your experience
                                </SheetDescription>
                            </div>
                        </div>
                    </SheetHeader>

                    {/* Content */}
                    <div className="flex-1 overflow-y-auto p-6 space-y-6">
                        {/* Text Preferences Card */}
                        <div className="rounded-xl bg-white/10 backdrop-blur-sm border border-white/15 overflow-hidden">
                            <div className="p-4 border-b border-white/10 flex items-center gap-3">
                                <div className="size-8 rounded-lg bg-white/15 flex items-center justify-center">
                                    <Type className="size-4 text-white" />
                                </div>
                                <h3
                                    className={cn(
                                        "font-semibold text-white",
                                        textClasses
                                    )}
                                >
                                    Text Preferences
                                </h3>
                            </div>

                            <div className="p-4 space-y-4">
                                {/* Text Size Selector */}
                                <div className="space-y-3">
                                    <Label
                                        className={cn(
                                            "text-sm font-medium text-white/80",
                                            textClasses
                                        )}
                                    >
                                        Font Size
                                    </Label>
                                    <div className="grid grid-cols-2 gap-2">
                                        {textSizeOptions.map((option) => (
                                            <button
                                                key={option.value}
                                                onClick={() =>
                                                    setTextSize(option.value)
                                                }
                                                className={cn(
                                                    "p-3 rounded-xl text-left transition-all duration-200 border",
                                                    textSize === option.value
                                                        ? "bg-white text-tamu-maroon border-white shadow-lg"
                                                        : "bg-white/5 text-white border-white/15 hover:bg-white/15 hover:border-white/25"
                                                )}
                                            >
                                                <span
                                                    className={cn(
                                                        "font-semibold block",
                                                        textClasses
                                                    )}
                                                >
                                                    {option.label}
                                                </span>
                                                <span
                                                    className={cn(
                                                        "text-xs",
                                                        textSize ===
                                                            option.value
                                                            ? "text-tamu-maroon/70"
                                                            : "text-white/60",
                                                        textClasses
                                                    )}
                                                >
                                                    {option.description}
                                                </span>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <Separator className="bg-white/10" />

                                {/* Bold Text Toggle */}
                                <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10">
                                    <div className="space-y-0.5">
                                        <Label
                                            htmlFor="bold-toggle"
                                            className={cn(
                                                "text-sm font-medium text-white cursor-pointer",
                                                textClasses
                                            )}
                                        >
                                            Bold Text
                                        </Label>
                                        <p
                                            className={cn(
                                                "text-xs text-white/60",
                                                textClasses
                                            )}
                                        >
                                            Make all text appear bolder
                                        </p>
                                    </div>
                                    <Switch
                                        id="bold-toggle"
                                        checked={isBold}
                                        onCheckedChange={setIsBold}
                                        className="data-[state=checked]:bg-white data-[state=checked]:text-tamu-maroon"
                                    />
                                </div>
                            </div>
                        </div>
                        {/* Preview Card */}
                        <div className="rounded-xl bg-white/10 backdrop-blur-sm border border-white/15 overflow-hidden">
                            <div className="p-4 border-b border-white/10">
                                <h3
                                    className={cn(
                                        "font-semibold text-white",
                                        textClasses
                                    )}
                                >
                                    Text Preview
                                </h3>
                            </div>
                            <div className="p-4">
                                <p
                                    className={cn(
                                        "text-white/90 leading-relaxed",
                                        textClasses
                                    )}
                                >
                                    This is how your text will appear throughout
                                    the application. Adjust the settings above
                                    to find what works best for you.
                                </p>
                            </div>
                        </div>

                        {/* Weather Card - Dynamic Theme */}
                        {(() => {
                            const theme = getWeatherTheme(
                                temperature,
                                precipitation
                            );
                            const WeatherIcon = theme.icon;
                            return (
                                <div
                                    className={cn(
                                        "rounded-xl overflow-hidden shadow-lg",
                                        `bg-gradient-to-br ${theme.gradient}`
                                    )}
                                >
                                    {/* Header */}
                                    <div className="p-4 border-b border-white/20 flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="size-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                                                <WeatherIcon
                                                    className={cn(
                                                        "size-5",
                                                        theme.iconColor
                                                    )}
                                                />
                                            </div>
                                            <div>
                                                <h3
                                                    className={cn(
                                                        "font-semibold text-white",
                                                        textClasses
                                                    )}
                                                >
                                                    Current Weather
                                                </h3>
                                                <p
                                                    className={cn(
                                                        "text-xs text-white/70",
                                                        textClasses
                                                    )}
                                                >
                                                    College Station, TX
                                                </p>
                                            </div>
                                        </div>
                                        <div
                                            className={cn(
                                                "px-3 py-1 rounded-full text-xs font-medium bg-white/20 text-white",
                                                textClasses
                                            )}
                                        >
                                            {theme.label}
                                        </div>
                                    </div>

                                    {/* Main Temperature Display */}
                                    <div className="p-6">
                                        <div className="flex items-center justify-center mb-6">
                                            <div className="text-center">
                                                <div className="flex items-center justify-center gap-1 mb-2">
                                                    <WeatherIcon
                                                        className={cn(
                                                            "size-12",
                                                            theme.iconColor
                                                        )}
                                                    />
                                                </div>
                                                <div className="flex items-baseline justify-center gap-1">
                                                    <span className="text-6xl font-bold text-white drop-shadow-lg">
                                                        {temperature?.toFixed(
                                                            0
                                                        ) ?? "--"}
                                                    </span>
                                                    <span className="text-3xl text-white/80">
                                                        °F
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Weather Details Grid */}
                                        <div className="grid grid-cols-3 gap-3">
                                            <div
                                                className={cn(
                                                    "p-3 rounded-xl text-center backdrop-blur-sm",
                                                    theme.detailBg,
                                                    `border ${theme.detailBorder}`
                                                )}
                                            >
                                                <Thermometer className="size-5 text-white/80 mx-auto mb-1" />
                                                <p
                                                    className={cn(
                                                        "text-xs text-white/70 mb-0.5",
                                                        textClasses
                                                    )}
                                                >
                                                    Feels Like
                                                </p>
                                                <p
                                                    className={cn(
                                                        "font-semibold text-white",
                                                        textClasses
                                                    )}
                                                >
                                                    {temperature?.toFixed(0) ??
                                                        "--"}
                                                    °
                                                </p>
                                            </div>
                                            <div
                                                className={cn(
                                                    "p-3 rounded-xl text-center backdrop-blur-sm",
                                                    theme.detailBg,
                                                    `border ${theme.detailBorder}`
                                                )}
                                            >
                                                <Droplets className="size-5 text-white/80 mx-auto mb-1" />
                                                <p
                                                    className={cn(
                                                        "text-xs text-white/70 mb-0.5",
                                                        textClasses
                                                    )}
                                                >
                                                    Rain
                                                </p>
                                                <p
                                                    className={cn(
                                                        "font-semibold text-white",
                                                        textClasses
                                                    )}
                                                >
                                                    {precipitation?.toFixed(
                                                        2
                                                    ) ?? "--"}
                                                    &quot;
                                                </p>
                                            </div>
                                            <div
                                                className={cn(
                                                    "p-3 rounded-xl text-center backdrop-blur-sm",
                                                    theme.detailBg,
                                                    `border ${theme.detailBorder}`
                                                )}
                                            >
                                                <Wind className="size-5 text-white/80 mx-auto mb-1" />
                                                <p
                                                    className={cn(
                                                        "text-xs text-white/70 mb-0.5",
                                                        textClasses
                                                    )}
                                                >
                                                    Wind
                                                </p>
                                                <p
                                                    className={cn(
                                                        "font-semibold text-white",
                                                        textClasses
                                                    )}
                                                >
                                                    {windSpeed?.toFixed(0) ??
                                                        "--"}{" "}
                                                    mph
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })()}
                    </div>
                </div>
                </SheetContent>
            </Sheet>
        </ClientOnly>
    );
}
