'use client'

import Link from 'next/link'
import { cn } from '@/lib/utils'
import { NAV, type NavItem, type NavSubLink } from './nav-data'
import type { RoleGateMap } from '@/lib/auth/roleGate.types'

interface NavCenteredStackProps {
  onNavigate: () => void
  isLoggedIn: boolean
  roleGates: RoleGateMap
}

/**
 * The DIVISION 2 nav row points at /division-2 by default, but anyone without
 * the D2 role would hit the gate (notFound for anon; ROLE_REQUIRED dossier
 * for signed-in-no-role). For those viewers we re-target the public clans
 * page so a click lands somewhere useful. D2-role members keep the gated
 * Command Console as their destination.
 */
function resolveDivision2Href(isLoggedIn: boolean, roleGates: RoleGateMap): string {
  if (!isLoggedIn) return '/division-2/clans'
  if (roleGates.division2Role === 'allowed') return '/division-2'
  return '/division-2/clans'
}

export function NavCenteredStack({ onNavigate, isLoggedIn, roleGates }: NavCenteredStackProps) {
  const items = NAV.filter((item) => {
    if (item.requiresAuth && !isLoggedIn) return false
    if (item.requiresRole && roleGates[item.requiresRole] !== 'allowed') return false
    return true
  }).map((item) => {
    // Hide sub-links flagged requiresAuth for anonymous visitors. Same
    // discipline as the top-level filter above — the sub-list is just data
    // and gets the same gate.
    const sub = item.sub.filter((s) => !(s.requiresAuth && !isLoggedIn))
    if (item.label === 'DIVISION 2') {
      return { ...item, href: resolveDivision2Href(isLoggedIn, roleGates), sub }
    }
    return { ...item, sub }
  })
  return (
    <div className="flex flex-col items-center px-8 md:px-20 pt-12 pb-6">
      <ul className="flex flex-col items-center" style={{ gap: 6 }}>
        {items.map((item, i) => (
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
            text-white/30 group-hover:text-rga-green/70 group-focus-within:text-rga-green/70
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
      : 'text-text-secondary/60 cursor-not-allowed',
  )
  const labelStyle = {
    fontSize: 'clamp(32px, 7.2vw, 64px)',
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
  if (sub.length === 0) return null

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    onNavigate()
    if (typeof window === 'undefined' || window.location.pathname !== '/') return

    if (href.startsWith('/#')) {
      e.preventDefault()
      const id = decodeURIComponent(href.slice(2))
      window.history.replaceState(null, '', href)
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      return
    }

    if (href === '/') {
      e.preventDefault()
      if (window.location.hash) window.history.replaceState(null, '', '/')
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  return (
    <div
      className="
        rga-nav-sublinks
        grid w-full
        grid-rows-[minmax(0,1fr)] opacity-100
        sm:grid-rows-[minmax(0,0fr)] sm:opacity-0
        sm:group-hover:grid-rows-[minmax(0,1fr)] sm:group-hover:opacity-100
        sm:group-focus-within:grid-rows-[minmax(0,1fr)] sm:group-focus-within:opacity-100
        transition-[grid-template-rows,opacity] duration-[420ms]
        ease-[cubic-bezier(0.2,0.8,0.2,1)]
      "
    >
    <ul
      className="
        flex flex-col items-center min-h-0 overflow-hidden
        sm:flex-row sm:flex-wrap sm:justify-center
        pt-[14px] pb-[16px] sm:pl-[50px]
        transition-transform duration-[420ms] ease-[cubic-bezier(0.2,0.8,0.2,1)]
        sm:-translate-y-1 sm:group-hover:translate-y-0 sm:group-focus-within:translate-y-0
      "
      style={{ gap: 18 }}
    >
      {sub.map((s) =>
        s.available ? (
          <li key={s.label}>
            <Link
              href={s.href}
              onClick={(e) => handleClick(e, s.href)}
              className="
                font-mono uppercase text-rga-cyan/85 hover:text-white
                transition-colors duration-150
                px-5 py-[10px]
              "
              style={{ fontSize: 12, letterSpacing: '0.18em' }}
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
                px-5 py-[10px]
              "
              style={{ fontSize: 12, letterSpacing: '0.18em' }}
            >
              {s.label} [soon]
            </span>
          </li>
        ),
      )}
    </ul>
    </div>
  )
}
