"use client";

import { forwardRef } from "react";
import { cn, getInitials } from "@/lib/utils";

export interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  src?: string | null;
  alt?: string;
  fallback?: string;
  size?: "sm" | "md" | "lg";
}

const Avatar = forwardRef<HTMLDivElement, AvatarProps>(
  ({ className, src, alt = "", fallback, size = "md", ...props }, ref) => {
    const initials = fallback ? getInitials(fallback) : (alt ? getInitials(alt) : "?");

    return (
      <div
        ref={ref}
        className={cn(
          "relative flex shrink-0 overflow-hidden rounded-full bg-gray-300 dark:bg-gray-700",
          {
            "h-8 w-8": size === "sm",
            "h-10 w-10": size === "md",
            "h-14 w-14": size === "lg",
          },
          className
        )}
        {...props}
      >
        {src ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={src}
            alt={alt}
            className="aspect-square h-full w-full object-cover"
          />
        ) : (
          <span className="flex h-full w-full items-center justify-center text-sm font-medium text-gray-600 dark:text-gray-300">
            {initials}
          </span>
        )}
      </div>
    );
  }
);

Avatar.displayName = "Avatar";

export { Avatar };
