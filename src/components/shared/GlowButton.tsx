"use client"

import { forwardRef } from "react"
import { Button, type ButtonProps } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface GlowButtonProps extends ButtonProps {
  glowColor?: "green" | "cyan" | "magenta"
  pulse?: boolean
}

/**
 * CTA Button with neon glow effect.
 * Extends shadcn Button with glowing box-shadow and optional pulse animation.
 */
export const GlowButton = forwardRef<HTMLButtonElement, GlowButtonProps>(
  ({ className, glowColor = "green", pulse = true, children, ...props }, ref) => {
    const glowClasses = {
      green: "shadow-[0_0_20px_rgba(0,255,65,0.5),0_0_40px_rgba(0,255,65,0.3)] hover:shadow-[0_0_30px_rgba(0,255,65,0.7),0_0_60px_rgba(0,255,65,0.5)]",
      cyan: "shadow-[0_0_20px_rgba(0,255,255,0.5),0_0_40px_rgba(0,255,255,0.3)] hover:shadow-[0_0_30px_rgba(0,255,255,0.7),0_0_60px_rgba(0,255,255,0.5)]",
      magenta: "shadow-[0_0_20px_rgba(255,0,255,0.5),0_0_40px_rgba(255,0,255,0.3)] hover:shadow-[0_0_30px_rgba(255,0,255,0.7),0_0_60px_rgba(255,0,255,0.5)]",
    }

    const bgClasses = {
      green: "bg-rga-green text-void hover:bg-rga-green/90",
      cyan: "bg-rga-cyan text-void hover:bg-rga-cyan/90",
      magenta: "bg-rga-magenta text-void hover:bg-rga-magenta/90",
    }

    return (
      <Button
        ref={ref}
        className={cn(
          "relative font-bold uppercase tracking-wider transition-all duration-300",
          bgClasses[glowColor],
          glowClasses[glowColor],
          pulse && "animate-glow-pulse",
          className
        )}
        {...props}
      >
        {children}
      </Button>
    )
  }
)

GlowButton.displayName = "GlowButton"
