import { useAccessibility } from "@/app/providers/accessibility-provider";

export function useAccessibilityStyles() {
  const { textSize, isBold } = useAccessibility();

  const getTextSizeClass = (): string => {
    switch (textSize) {
      case "small":
        return "text-sm";
      case "medium":
        return "text-base";
      case "large":
        return "text-lg";
      case "extra-large":
        return "text-xl";
      default:
        return "text-base";
    }
  };

  const getBoldClass = (): string => {
    return isBold ? "font-bold" : "";
  };

  const getTextClasses = (): string => {
    const sizeClass = getTextSizeClass();
    const boldClass = getBoldClass();
    return `${sizeClass} ${boldClass}`.trim();
  };

  return {
    textSizeClass: getTextSizeClass(),
    boldClass: getBoldClass(),
    textClasses: getTextClasses(),
    textSize,
    isBold,
  };
}

