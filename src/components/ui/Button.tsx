"use client";

import { forwardRef } from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 dark:focus:ring-offset-background disabled:opacity-50 disabled:pointer-events-none",
          {
            "bg-accent text-white hover:opacity-90": variant === "primary",
            "bg-card border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800":
              variant === "secondary",
            "hover:bg-gray-100 dark:hover:bg-gray-800": variant === "ghost",
            "bg-red-500 text-white hover:bg-red-600": variant === "danger",
          },
          {
            "px-3 py-1.5 text-sm": size === "sm",
            "px-4 py-2 text-base": size === "md",
            "px-6 py-3 text-lg": size === "lg",
          },
          className
        )}
        {...props}
      />
    );
  }
);

Button.displayName = "Button";

export { Button };
