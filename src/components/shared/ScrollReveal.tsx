"use client"

import { motion, type Variants } from "motion/react"
import { cn } from "@/lib/utils"

interface ScrollRevealProps {
  children: React.ReactNode
  className?: string
  direction?: "up" | "down" | "left" | "right" | "none"
  delay?: number
  duration?: number
  once?: boolean
  amount?: number | "some" | "all"
}

const directionVariants: Record<string, Variants> = {
  up: {
    hidden: { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0 },
  },
  down: {
    hidden: { opacity: 0, y: -40 },
    visible: { opacity: 1, y: 0 },
  },
  left: {
    hidden: { opacity: 0, x: 40 },
    visible: { opacity: 1, x: 0 },
  },
  right: {
    hidden: { opacity: 0, x: -40 },
    visible: { opacity: 1, x: 0 },
  },
  none: {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
  },
}

/**
 * Scroll-triggered reveal animation wrapper.
 * Uses Motion's whileInView for performant scroll-based animations.
 */
export function ScrollReveal({
  children,
  className,
  direction = "up",
  delay = 0,
  duration = 0.6,
  once = true,
  amount = 0.3,
}: ScrollRevealProps) {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once, amount, margin: "-50px" }}
      variants={directionVariants[direction]}
      transition={{
        duration,
        delay,
        ease: [0.25, 0.46, 0.45, 0.94], // Smooth easeOutQuad
      }}
      className={cn(className)}
    >
      {children}
    </motion.div>
  )
}

/**
 * Container for staggered children animations.
 */
export function ScrollRevealContainer({
  children,
  className,
  staggerDelay = 0.1,
  once = true,
}: {
  children: React.ReactNode
  className?: string
  staggerDelay?: number
  once?: boolean
}) {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once, margin: "-50px" }}
      variants={{
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: {
            staggerChildren: staggerDelay,
          },
        },
      }}
      className={cn(className)}
    >
      {children}
    </motion.div>
  )
}

/**
 * Child item for use inside ScrollRevealContainer.
 */
export function ScrollRevealItem({
  children,
  className,
  direction = "up",
}: {
  children: React.ReactNode
  className?: string
  direction?: "up" | "down" | "left" | "right" | "none"
}) {
  return (
    <motion.div
      variants={directionVariants[direction]}
      transition={{
        duration: 0.5,
        ease: [0.25, 0.46, 0.45, 0.94],
      }}
      className={cn(className)}
    >
      {children}
    </motion.div>
  )
}
