"use client"

import { cn } from "@/lib/utils"

interface ChromaticTextProps {
  children: React.ReactNode
  className?: string
  as?: "h1" | "h2" | "h3" | "span" | "p" | "div"
  animated?: boolean
}

/**
 * Text with permanent RGB chromatic aberration effect.
 * Creates cyan and magenta shadows offset from the main text.
 */
export function ChromaticText({
  children,
  className,
  as: Component = "span",
  animated = false,
}: ChromaticTextProps) {
  return (
    <Component
      className={cn(
        "relative",
        animated ? "animate-rgb-shift" : "text-chromatic",
        className
      )}
    >
      {children}
    </Component>
  )
}
