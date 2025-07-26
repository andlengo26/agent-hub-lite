/**
 * Enhanced Avatar component following KB design system
 * Provides consistent avatar styling with size variants
 */

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Avatar as AvatarPrimitive, AvatarFallback, AvatarImage } from "./avatar";
import { cn } from "@/lib/utils";

const avatarVariants = cva(
  "relative flex shrink-0 overflow-hidden rounded-full",
  {
    variants: {
      size: {
        sm: "h-8 w-8",
        md: "h-10 w-10", 
        lg: "h-12 w-12",
      },
    },
    defaultVariants: {
      size: "md",
    },
  }
);

export interface AvatarProps
  extends React.ComponentPropsWithoutRef<typeof AvatarPrimitive>,
    VariantProps<typeof avatarVariants> {
  src?: string;
  alt: string;
  fallback?: string;
}

export function Avatar({ 
  src, 
  alt, 
  fallback,
  size,
  className,
  ...props 
}: AvatarProps) {
  // Generate fallback initials from alt text
  const generateFallback = () => {
    if (fallback) return fallback;
    
    return alt
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <AvatarPrimitive 
      className={cn(avatarVariants({ size }), className)} 
      {...props}
    >
      <AvatarImage src={src} alt={alt} />
      <AvatarFallback className="bg-primary text-primary-foreground font-medium">
        {generateFallback()}
      </AvatarFallback>
    </AvatarPrimitive>
  );
}