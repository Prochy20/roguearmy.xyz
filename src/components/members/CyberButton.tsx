'use client'

import Link from 'next/link'
import { cn } from '@/lib/utils'
import { forwardRef } from 'react'

type ButtonColor = 'green' | 'cyan' | 'magenta' | 'gray'

const colorStyles: Record<ButtonColor, {
  border: string
  borderHover: string
  accent: string
  accentHover: string
  scanLine: string
  textHover: string
}> = {
  green: {
    border: 'border-rga-green/10',
    borderHover: 'group-hover:border-rga-green/25',
    accent: 'bg-rga-green/40',
    accentHover: 'group-hover:bg-rga-green/70',
    scanLine: 'via-rga-green/30',
    textHover: 'hover:text-rga-green',
  },
  cyan: {
    border: 'border-rga-cyan/10',
    borderHover: 'group-hover:border-rga-cyan/25',
    accent: 'bg-rga-cyan/40',
    accentHover: 'group-hover:bg-rga-cyan/70',
    scanLine: 'via-rga-cyan/30',
    textHover: 'hover:text-rga-cyan',
  },
  magenta: {
    border: 'border-rga-magenta/10',
    borderHover: 'group-hover:border-rga-magenta/25',
    accent: 'bg-rga-magenta/40',
    accentHover: 'group-hover:bg-rga-magenta/70',
    scanLine: 'via-rga-magenta/30',
    textHover: 'hover:text-rga-magenta',
  },
  gray: {
    border: 'border-rga-gray/10',
    borderHover: 'group-hover:border-rga-gray/25',
    accent: 'bg-rga-gray/30',
    accentHover: 'group-hover:bg-rga-gray/50',
    scanLine: 'via-rga-gray/20',
    textHover: 'hover:text-rga-gray',
  },
}

interface CyberButtonBaseProps {
  children: React.ReactNode
  className?: string
  /** Icon to show before text */
  iconLeft?: React.ReactNode
  /** Icon to show after text */
  iconRight?: React.ReactNode
  /** Color theme */
  color?: ButtonColor
}

interface CyberButtonAsLink extends CyberButtonBaseProps {
  href: string
  onClick?: never
}

interface CyberButtonAsButton extends CyberButtonBaseProps {
  href?: never
  onClick: () => void
}

type CyberButtonProps = CyberButtonAsLink | CyberButtonAsButton

/**
 * Cyberpunk-styled button/link for member area
 * Subtle corner accents with scan line effect on hover
 */
export const CyberButton = forwardRef<
  HTMLAnchorElement | HTMLButtonElement,
  CyberButtonProps
>(function CyberButton(
  { children, className, iconLeft, iconRight, color = 'green', ...props },
  ref
) {
  const styles = colorStyles[color]

  const content = (
    <>
      {/* Subtle border */}
      <span
        className={cn(
          'absolute inset-0 border transition-colors duration-300',
          styles.border,
          styles.borderHover
        )}
      />

      {/* Corner accents - top left */}
      <span
        className={cn(
          'absolute top-0 left-0 w-3 h-px group-hover:w-4 transition-all duration-300',
          styles.accent,
          styles.accentHover
        )}
      />
      <span
        className={cn(
          'absolute top-0 left-0 w-px h-3 group-hover:h-4 transition-all duration-300',
          styles.accent,
          styles.accentHover
        )}
      />

      {/* Corner accents - bottom right */}
      <span
        className={cn(
          'absolute bottom-0 right-0 w-3 h-px group-hover:w-4 transition-all duration-300',
          styles.accent,
          styles.accentHover
        )}
      />
      <span
        className={cn(
          'absolute bottom-0 right-0 w-px h-3 group-hover:h-4 transition-all duration-300',
          styles.accent,
          styles.accentHover
        )}
      />

      {/* Scan line on hover */}
      <span className="absolute inset-x-0 top-0 h-full overflow-hidden opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
        <span
          className={cn(
            'absolute inset-x-0 h-px bg-linear-to-r from-transparent to-transparent animate-scan',
            styles.scanLine
          )}
        />
      </span>

      {/* Icon left */}
      {iconLeft && (
        <span className="transition-transform duration-300 group-hover:-translate-x-0.5">
          {iconLeft}
        </span>
      )}

      {/* Text */}
      <span className="text-sm font-medium tracking-wide">{children}</span>

      {/* Icon right */}
      {iconRight && (
        <span className="transition-transform duration-300 group-hover:translate-x-0.5">
          {iconRight}
        </span>
      )}
    </>
  )

  const baseClasses = cn(
    'group relative inline-flex items-center gap-2 px-4 py-2',
    'bg-void/70 backdrop-blur-md',
    'text-rga-gray/80 transition-all duration-300',
    styles.textHover,
    className
  )

  if ('href' in props && props.href) {
    return (
      <Link
        ref={ref as React.Ref<HTMLAnchorElement>}
        href={props.href}
        className={baseClasses}
      >
        {content}
      </Link>
    )
  }

  return (
    <button
      ref={ref as React.Ref<HTMLButtonElement>}
      onClick={(props as CyberButtonAsButton).onClick}
      className={baseClasses}
    >
      {content}
    </button>
  )
})
