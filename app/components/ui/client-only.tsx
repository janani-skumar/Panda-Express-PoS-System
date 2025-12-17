"use client";

import { useState, useEffect, ReactNode } from "react";

interface ClientOnlyProps {
  children: ReactNode;
  fallback?: ReactNode;
}

/**
 * Wrapper component that only renders its children on the client side after hydration.
 * This prevents hydration mismatches with components that generate dynamic IDs
 * (like Radix UI's Sheet/Dialog aria-controls).
 */
export function ClientOnly({ children, fallback = null }: ClientOnlyProps) {
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  if (!hasMounted) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

