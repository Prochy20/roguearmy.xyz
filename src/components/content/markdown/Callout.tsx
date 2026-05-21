'use client'

import { type ReactNode } from 'react'
import {
  Info,
  AlertTriangle,
  Lightbulb,
  CheckCircle,
  AlertOctagon,
  StickyNote,
} from 'lucide-react'

type CalloutType = 'info' | 'warning' | 'tip' | 'success' | 'danger' | 'error' | 'note'

interface CalloutProps {
  type: CalloutType
  title?: string
  children: ReactNode
}

/**
 * Callout configuration for each type
 */
const CALLOUT_CONFIG: Record<
  CalloutType,
  {
    icon: typeof Info
    label: string
    borderColor: string
    bgColor: string
    iconColor: string
    labelColor: string
    bracketColor: string
  }
> = {
  info: {
    icon: Info,
    label: 'Info',
    borderColor: 'border-l-rga-cyan',
    bgColor: 'bg-rga-cyan/5',
    iconColor: 'text-rga-cyan',
    labelColor: 'text-rga-cyan/50',
    bracketColor: 'text-rga-cyan/40',
  },
  warning: {
    icon: AlertTriangle,
    label: 'Warning',
    borderColor: 'border-l-amber-500',
    bgColor: 'bg-amber-500/5',
    iconColor: 'text-amber-500',
    labelColor: 'text-amber-500/50',
    bracketColor: 'text-amber-500/40',
  },
  tip: {
    icon: Lightbulb,
    label: 'Tip',
    borderColor: 'border-l-rga-green',
    bgColor: 'bg-rga-green/5',
    iconColor: 'text-rga-green',
    labelColor: 'text-rga-green/50',
    bracketColor: 'text-rga-green/40',
  },
  success: {
    icon: CheckCircle,
    label: 'Success',
    borderColor: 'border-l-rga-green',
    bgColor: 'bg-rga-green/5',
    iconColor: 'text-rga-green',
    labelColor: 'text-rga-green/50',
    bracketColor: 'text-rga-green/40',
  },
  danger: {
    icon: AlertOctagon,
    label: 'Danger',
    borderColor: 'border-l-rga-magenta',
    bgColor: 'bg-rga-magenta/5',
    iconColor: 'text-rga-magenta',
    labelColor: 'text-rga-magenta/50',
    bracketColor: 'text-rga-magenta/40',
  },
  error: {
    icon: AlertOctagon,
    label: 'Error',
    borderColor: 'border-l-rga-magenta',
    bgColor: 'bg-rga-magenta/5',
    iconColor: 'text-rga-magenta',
    labelColor: 'text-rga-magenta/50',
    bracketColor: 'text-rga-magenta/40',
  },
  note: {
    icon: StickyNote,
    label: 'Note',
    borderColor: 'border-l-rga-gray',
    bgColor: 'bg-rga-gray/5',
    iconColor: 'text-rga-gray',
    labelColor: 'text-rga-gray/50',
    bracketColor: 'text-rga-gray/40',
  },
}

/**
 * Corner bracket decoration component
 */
function Corner({
  position,
  colorClass,
}: {
  position: 'tl' | 'tr' | 'bl' | 'br'
  colorClass: string
}) {
  const rotations = {
    tl: '',
    tr: 'rotate-90',
    bl: '-rotate-90',
    br: 'rotate-180',
  }
  const positions = {
    tl: 'top-0 left-0',
    tr: 'top-0 right-0',
    bl: 'bottom-0 left-0',
    br: 'bottom-0 right-0',
  }

  return (
    <div className={`absolute ${positions[position]} ${rotations[position]}`}>
      <svg
        width="12"
        height="12"
        viewBox="0 0 12 12"
        fill="none"
        className={colorClass}
      >
        <path d="M0 12V0H12" stroke="currentColor" strokeWidth="1.5" fill="none" />
      </svg>
    </div>
  )
}

/**
 * Styled callout/admonition component with cyberpunk theme.
 *
 * Features:
 * - Corner bracket decorations
 * - Centered uppercase label with icon
 * - Left border accent
 * - Semi-transparent background
 */
export function Callout({ type, title, children }: CalloutProps) {
  const config = CALLOUT_CONFIG[type] || CALLOUT_CONFIG.note
  const Icon = config.icon
  const displayLabel = title || config.label

  return (
    <aside
      className={`
        relative my-8 py-6 px-5 border-l-4
        ${config.borderColor}
        ${config.bgColor}
      `}
    >
      {/* Corner brackets */}
      <Corner position="tl" colorClass={config.bracketColor} />
      <Corner position="tr" colorClass={config.bracketColor} />
      <Corner position="bl" colorClass={config.bracketColor} />
      <Corner position="br" colorClass={config.bracketColor} />

      {/* Label with icon */}
      <div className="absolute -top-2 left-1/2 -translate-x-1/2 px-2 bg-bg-primary flex items-center gap-1.5">
        <Icon className={`w-3 h-3 ${config.iconColor}`} />
        <span
          className={`text-[9px] font-mono uppercase tracking-[0.15em] ${config.labelColor}`}
        >
          {displayLabel}
        </span>
      </div>

      {/* Content */}
      <div className="callout-content [&>p:last-child]:mb-0">{children}</div>
    </aside>
  )
}
