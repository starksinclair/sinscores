"use client";

import { forwardRef } from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "accent" | "success" | "warning" | "live";
}

const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant = "default", ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={cn(
          "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
          {
            "bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200":
              variant === "default",
            "bg-accent/20 text-accent": variant === "accent",
            "bg-green-500/20 text-green-600 dark:text-green-400": variant === "success",
            "bg-amber-500/20 text-amber-600 dark:text-amber-400": variant === "warning",
            "bg-red-500/20 text-red-500 animate-pulse": variant === "live",
          },
          className
        )}
        {...props}
      />
    );
  }
);

Badge.displayName = "Badge";

export { Badge };
