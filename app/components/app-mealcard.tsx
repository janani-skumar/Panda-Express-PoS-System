import Image from "next/image";
import {
    Item,
    ItemContent,
    ItemHeader,
    ItemTitle,
} from "@/app/components/ui/item";
import { useAccessibilityStyles } from "@/hooks/use-accessibility-styles";
import { cn } from "@/lib/utils";

const MealCard = (props: {
    name: string;
    image?: string | null;
    key?: number;
    className?: string;
    variant?: "default" | "selected" | "compact";
    premium?: boolean;
    seasonal?: boolean;
}) => {
    const { textClasses } = useAccessibilityStyles();
    const variant = props.variant || "default";
    const isPremium = Boolean(props.premium);
    const isSeasonal = Boolean(props.seasonal);
    const CARD_HEIGHT = 72;

    // Render Christmas-themed card for seasonal items
    if (isSeasonal) {
        return (
            <Item
                key={props.name}
                variant="outline"
                className={cn(
                    "group relative overflow-hidden rounded-xl border-2 border-red-700 p-0 transition-all duration-300",
                    "shadow-lg hover:shadow-2xl hover:scale-[1.03]",
                    textClasses,
                    props.className
                )}
            >

                {/* Side badges container */}
                {(isPremium || isSeasonal) && (
                    <div 
                        style={{ bottom: `${CARD_HEIGHT + 5}px` }}
                        className="absolute right-0 z-10 flex flex-col gap-1 justify-end"
                    >
                        {isSeasonal && (
                            <SideBadge text="🎄" fullText="Seasonal" color="bg-green-600" />
                        )}
                        {isPremium && (
                            <SideBadge text="P" fullText="Premium" color="bg-amber-500" />
                        )}
                    </div>
                )}

                {/* Image container */}
                <ItemHeader className="relative p-0">
                    {props.image ? (
                        <div className="relative aspect-square w-full p-3 bg-white/95">
                            <Image
                                src={props.image}
                                alt="A delicious meal"
                                fill
                                sizes="(max-width: 768px) 50vw, 200px"
                                className="object-contain p-2 transition-transform duration-500 group-hover:scale-105 z-1"
                            />
                        </div>
                    ) : (
                        <div className="aspect-square w-full bg-gradient-to-br from-white/90 to-red-50/50 flex justify-center items-center">
                            <div className="flex flex-col items-center gap-2 text-red-700/60 group-hover:text-red-700 transition-colors duration-300">
                                <div className="size-12 rounded-full bg-red-100/50 flex items-center justify-center group-hover:bg-red-200/70 transition-colors duration-300 border-2 border-red-300/40">
                                    <span className="font-bold text-3xl">+</span>
                                </div>
                                <span className="text-xs font-medium">Select</span>
                            </div>
                        </div>
                    )}
                </ItemHeader>

                {/* Christmas-themed footer */}
                <ItemContent
                    style={{ minHeight: `${CARD_HEIGHT}px` }}
                    className={cn(
                        "relative text-white flex items-center justify-center p-3",
                        "bg-gradient-to-r from-red-800 via-green-800 to-yellow-800",
                        "overflow-hidden"
                    )}
                >                    
                    <ItemTitle
                        className={cn(
                            "relative z-10 text-sm font-bold text-center leading-tight",
                            "drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]",
                            "text-white",
                            textClasses
                        )}
                    >
                        {props.name}
                    </ItemTitle>
                </ItemContent>
            </Item>
        );
    }

    // Default card styling for non-seasonal items
    const defaultCardStyles = [
        "bg-linear-to-br from-tamu-maroon/90 to-tamu-maroon-dark/95",
        "before:border-white/20",
        "hover:from-tamu-maroon hover:to-tamu-maroon-dark",
        "after:bg-linear-to-t after:from-white/0 after:to-white/10",
    ];

    return (
        <Item
            key={props.name}
            variant="outline"
            className={cn(
                "group relative overflow-hidden rounded-xl border-0 p-0 transition-all duration-300",
                "backdrop-blur-sm shadow-lg",
                // Hover effects
                "hover:shadow-2xl hover:scale-[1.03]",
                // Glass border effect
                "before:absolute before:inset-0 before:rounded-xl before:border before:pointer-events-none",
                // Subtle inner glow on hover
                "after:absolute after:inset-0 after:rounded-xl after:opacity-0 after:transition-opacity after:duration-300 after:pointer-events-none",
                "hover:after:opacity-100",
                defaultCardStyles,
                textClasses,
                props.className
            )}
        >
            {/* Side badges container - positioned on right side, expand left into card */}
            {isPremium && (
                <div 
                    style={{ bottom: `${CARD_HEIGHT + 5}px` }}
                    className="absolute right-0 z-20 flex flex-col gap-1 justify-end"
                >
                    <SideBadge text="P" fullText="Premium" color="bg-amber-500" />
                </div>
            )}

            {/* Image container with overlay */}
            <ItemHeader className="relative p-0 bg-white overflow-hidden">
                {props.image ? (
                    <div className="relative aspect-square w-full p-3 bg-white">
                        <Image
                            src={props.image}
                            alt="A delicious meal"
                            fill
                            sizes="(max-width: 768px) 50vw, 200px"
                            className="object-contain p-2 transition-transform duration-500 group-hover:scale-105"
                        />
                    </div>
                ) : (
                    <div className="aspect-square w-full bg-linear-to-br from-white/90 to-white/70 flex justify-center items-center">
                        <div className="flex flex-col items-center gap-2 text-tamu-maroon/60 group-hover:text-tamu-maroon transition-colors duration-300">
                            <div className="size-12 rounded-full bg-tamu-maroon/10 flex items-center justify-center group-hover:bg-tamu-maroon/20 transition-colors duration-300">
                                <span className="font-bold text-3xl">+</span>
                            </div>
                            <span className="text-xs font-medium">Select</span>
                        </div>
                    </div>
                )}
            </ItemHeader>

            {/* Content footer with maroon gradient background */}
            <ItemContent
                style={{ minHeight: `${CARD_HEIGHT}px` }}
                className={cn(
                    "relative text-white flex items-center justify-center p-3",
                    "bg-maroon-gradient overflow-hidden rounded-b-xl"
                )}
            >
                <ItemTitle
                    className={cn(
                        "relative z-10 text-sm font-semibold text-center leading-tight",
                        "drop-shadow-[0_1px_2px_rgba(0,0,0,0.3)]",
                        textClasses
                    )}
                >
                    {props.name}
                </ItemTitle>
            </ItemContent>
        </Item>
    );
};

// Side badge component that expands on hover (expands left into the card)
function SideBadge({
    text,
    fullText,
    color
  }: {
    text: string;
    fullText: string;
    color: string;
  }) {
    return (
      <div className="group/badge flex items-center justify-end">
        {/* Text content */}
        <div
          className={cn(
            "flex items-center gap-1 px-2 py-1 rounded-l-md shadow-lg",
            color,
            "text-white text-xs font-extrabold",
            "transition-all duration-300 ease-out",
            "w-6 group-hover/badge:w-20",
            "overflow-hidden"
          )}
        >
          <span className="text-sm shrink-0 group-hover/badge:hidden">{text}</span>
          <span className="whitespace-nowrap opacity-0 group-hover/badge:opacity-100 transition-opacity duration-300">
            {fullText}
          </span>
        </div>
      </div>
    );
  }

export default MealCard;
