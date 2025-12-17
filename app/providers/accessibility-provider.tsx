"use client"

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { usePathname } from "next/navigation";

export type TextSize = "small" | "medium" | "large" | "extra-large";

interface AccessibilityContextType {
  textSize: TextSize;
  isBold: boolean;
  setTextSize: (size: TextSize) => void;
  setIsBold: (bold: boolean) => void;
  resetToDefaults: () => void;
}

const AccessibilityContext = createContext<AccessibilityContextType | undefined>(undefined);

const DEFAULT_TEXT_SIZE: TextSize = "medium";
const DEFAULT_IS_BOLD = false;
const STORAGE_KEY = "accessibility_settings";

export function AccessibilityProvider({ children }: { children: ReactNode }) {
  const [textSize, setTextSize] = useState<TextSize>(DEFAULT_TEXT_SIZE);
  const [isBold, setIsBold] = useState<boolean>(DEFAULT_IS_BOLD);
  const [isInitialized, setIsInitialized] = useState(false);
  const pathname = usePathname();

  // Initialize: Load from localStorage on mount if not on /home
  useEffect(() => {
    if (pathname === "/home") {
      // On /home, use defaults and clear storage
      setTextSize(DEFAULT_TEXT_SIZE);
      setIsBold(DEFAULT_IS_BOLD);
      try {
        localStorage.removeItem(STORAGE_KEY);
      } catch (error) {
        console.error("Failed to clear accessibility settings:", error);
      }
    } else {
      // On other pages, try to load from localStorage
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          setTextSize(parsed.textSize || DEFAULT_TEXT_SIZE);
          setIsBold(parsed.isBold ?? DEFAULT_IS_BOLD);
        }
      } catch (error) {
        console.error("Failed to load accessibility settings:", error);
      }
    }
    setIsInitialized(true);
  }, []); // Only on mount

  // Handle pathname changes: reset on /home, load from storage when leaving /home
  useEffect(() => {
    if (!isInitialized) return;

    if (pathname === "/home") {
      // Reset to defaults when navigating to /home
      setTextSize(DEFAULT_TEXT_SIZE);
      setIsBold(DEFAULT_IS_BOLD);
      try {
        localStorage.removeItem(STORAGE_KEY);
      } catch (error) {
        console.error("Failed to clear accessibility settings:", error);
      }
    } else if (pathname.startsWith("/home/")) {
      // When navigating to /home/* pages, load from localStorage if available
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          setTextSize(parsed.textSize || DEFAULT_TEXT_SIZE);
          setIsBold(parsed.isBold ?? DEFAULT_IS_BOLD);
        }
      } catch (error) {
        console.error("Failed to load accessibility settings:", error);
      }
    }
  }, [pathname, isInitialized]);

  // Save settings to localStorage whenever they change (but not on /home)
  useEffect(() => {
    if (isInitialized && pathname !== "/home" && pathname.startsWith("/home")) {
      try {
        localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify({ textSize, isBold })
        );
      } catch (error) {
        console.error("Failed to save accessibility settings:", error);
      }
    }
  }, [textSize, isBold, isInitialized, pathname]);

  const resetToDefaults = useCallback(() => {
    setTextSize(DEFAULT_TEXT_SIZE);
    setIsBold(DEFAULT_IS_BOLD);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error("Failed to clear accessibility settings:", error);
    }
  }, []);

  return (
    <AccessibilityContext.Provider
      value={{
        textSize,
        isBold,
        setTextSize,
        setIsBold,
        resetToDefaults,
      }}
    >
      {children}
    </AccessibilityContext.Provider>
  );
}

export function useAccessibility() {
  const context = useContext(AccessibilityContext);
  if (context === undefined) {
    throw new Error("useAccessibility must be used within an AccessibilityProvider");
  }
  return context;
}

