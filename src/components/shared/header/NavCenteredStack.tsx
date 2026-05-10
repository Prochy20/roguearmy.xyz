'use client'

import Link from 'next/link'
import { cn } from '@/lib/utils'
import { NAV, type NavItem, type NavSubLink } from './nav-data'

interface NavCenteredStackProps {
  onNavigate: () => void
}

export function NavCenteredStack({ onNavigate }: NavCenteredStackProps) {
  return (
    <div className="flex flex-col items-center px-8 md:px-20 pt-12 pb-6">
      <ul className="flex flex-col items-center" style={{ gap: 6 }}>
        {NAV.map((item, i) => (
          <NavRow key={item.label} item={item} index={i} onNavigate={onNavigate} />
        ))}
      </ul>
    </div>
  )
}

interface NavRowProps {
  item: NavItem
  index: number
  onNavigate: () => void
}

function NavRow({ item, index, onNavigate }: NavRowProps) {
  const indexLabel = `${String(index + 1).padStart(2, '0')}/`
  const blurb = item.available ? item.blurb : `${item.blurb} · [soon]`

  return (
    <li
      className="rga-nav-row group flex flex-col items-center"
      style={{
        animation: 'rga-nav-row-in 320ms cubic-bezier(.2,.8,.2,1) both',
        animationDelay: `${120 + index * 60}ms`,
      }}
    >
      <div className="flex items-baseline" style={{ gap: 20 }}>
        <span
          className="font-mono uppercase text-rga-green/45"
          style={{ fontSize: 11, letterSpacing: '0.15em' }}
        >
          {indexLabel}
        </span>

        <RowLabel item={item} onNavigate={onNavigate} />

        <span
          className="
            hidden sm:inline font-mono uppercase
            text-white/30 group-hover:text-rga-cyan/80 group-focus-within:text-rga-cyan/80
            transition-colors duration-200
          "
          style={{ fontSize: 11, letterSpacing: '0.18em' }}
        >
          {blurb}
        </span>
      </div>

      <SubLinkRow sub={item.sub} onNavigate={onNavigate} />
    </li>
  )
}

interface RowLabelProps {
  item: NavItem
  onNavigate: () => void
}

function RowLabel({ item, onNavigate }: RowLabelProps) {
  const labelClass = cn(
    'rga-nav-label font-display leading-none uppercase transition-colors duration-200',
    item.available
      ? 'text-[#e8efe2]/85 group-hover:text-rga-green group-focus-within:text-rga-green'
      : 'text-rga-gray/60 cursor-not-allowed',
  )
  const labelStyle = {
    fontSize: 'clamp(40px, 7.2vw, 64px)',
    letterSpacing: '0.04em',
  } as const

  if (!item.available) {
    return (
      <span
        aria-disabled="true"
        title="Coming soon"
        className={labelClass}
        style={labelStyle}
      >
        {item.label}
      </span>
    )
  }

  return (
    <Link
      href={item.href}
      onClick={onNavigate}
      className={labelClass}
      style={labelStyle}
    >
      {item.label}
    </Link>
  )
}

interface SubLinkRowProps {
  sub: readonly NavSubLink[]
  onNavigate: () => void
}

function SubLinkRow({ sub, onNavigate }: SubLinkRowProps) {
  return (
    <ul
      className="
        rga-nav-sublinks
        flex flex-wrap items-center justify-center
        max-h-0 opacity-0
        group-hover:max-h-20 group-hover:opacity-100
        group-focus-within:max-h-20 group-focus-within:opacity-100
        transition-all duration-300 ease-out
        overflow-hidden
        mt-[6px] pl-[50px]
      "
      style={{ gap: 18 }}
    >
      {sub.map((s) =>
        s.available ? (
          <li key={s.label}>
            <Link
              href={s.href}
              onClick={onNavigate}
              className="
                font-mono uppercase text-white/55 hover:text-white
                transition-colors duration-150
                border-b border-white/15 pb-[2px]
              "
              style={{ fontSize: 11, letterSpacing: '0.15em' }}
            >
              {s.label}
            </Link>
          </li>
        ) : (
          <li key={s.label}>
            <span
              aria-disabled="true"
              className="
                font-mono uppercase text-white/30 cursor-not-allowed
                border-b border-white/10 pb-[2px]
              "
              style={{ fontSize: 11, letterSpacing: '0.15em' }}
            >
              {s.label} <span className="text-white/30">[soon]</span>
            </span>
          </li>
        ),
      )}
    </ul>
  )
}
