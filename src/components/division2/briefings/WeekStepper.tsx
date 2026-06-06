import Link from 'next/link'
import { ChevronLeft, ChevronRight } from 'lucide-react'

export interface WeekStepperState {
  current: { periodStart: string; periodEnd: string; label: string }
  prev: { periodStart: string; href: string; label: string } | null
  next: { periodStart: string; href: string; label: string } | null
}

interface WeekStepperProps {
  state: WeekStepperState
}

/**
 * Prev / current-label / next stepper for the briefings archive. Mirrors the
 * day-stepper used on `/division-2/escalation` so the navigation language is
 * consistent across Division 2 tools.
 */
export function WeekStepper({ state }: WeekStepperProps) {
  return (
    <div className="flex items-center gap-2 font-mono text-[10px] tracking-[0.25em] uppercase">
      <StepArrow direction="prev" target={state.prev} />
      <div className="flex min-w-[180px] flex-col items-center gap-0.5 px-2">
        <span className="text-rga-green">{state.current.label}</span>
      </div>
      <StepArrow direction="next" target={state.next} />
    </div>
  )
}

function StepArrow({
  direction,
  target,
}: {
  direction: 'prev' | 'next'
  target: { href: string; label: string } | null
}) {
  const Icon = direction === 'prev' ? ChevronLeft : ChevronRight
  const srLabel = direction === 'prev' ? 'Previous week' : 'Next week'

  if (!target) {
    return (
      <span
        aria-hidden
        className="inline-flex h-9 w-9 items-center justify-center border border-rga-green/10 bg-[rgba(0,0,0,0.4)] text-rga-green/30"
      >
        <Icon className="h-4 w-4" strokeWidth={1.5} />
      </span>
    )
  }

  return (
    <Link
      href={target.href}
      scroll={false}
      prefetch={false}
      aria-label={`${srLabel} · ${target.label}`}
      className="inline-flex h-9 w-9 items-center justify-center border border-rga-green/25 bg-[rgba(0,0,0,0.4)] text-rga-green transition-colors hover:border-rga-green/70 hover:bg-rga-green/10"
    >
      <Icon className="h-4 w-4" strokeWidth={1.5} />
    </Link>
  )
}
