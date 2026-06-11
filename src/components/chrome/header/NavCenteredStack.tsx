'use client'

import { useEffect, useState } from 'react'
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

  // Below `sm` the sub-links are always visible (no hover gate), so they should
  // decode on open; at/above `sm` they decode on hover. Defaults to desktop so
  // SSR/first paint is deterministic and nothing decodes behind the hover gate.
  const [isDesktop, setIsDesktop] = useState(true)
  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return
    const mq = window.matchMedia('(min-width: 640px)')
    const update = () => setIsDesktop(mq.matches)
    update()
    mq.addEventListener('change', update)
    return () => mq.removeEventListener('change', update)
  }, [])

  return (
    <div className="flex flex-col items-center px-8 md:px-20 pt-12 pb-6">
      <ul className="flex flex-col items-center" style={{ gap: 6 }}>
        {items.map((item, i) => (
          <NavRow key={item.label} item={item} index={i} onNavigate={onNavigate} isDesktop={isDesktop} />
        ))}
      </ul>
    </div>
  )
}

interface NavRowProps {
  item: NavItem
  index: number
  onNavigate: () => void
  isDesktop: boolean
}

function NavRow({ item, index, onNavigate, isDesktop }: NavRowProps) {
  const indexLabel = `${String(index + 1).padStart(2, '0')}/`
  const blurb = item.available ? item.blurb : `${item.blurb} · [soon]`

  // The sub-links sit behind a hover/focus gate on desktop and are always shown
  // on mobile. Decode only while they're actually visible — this both avoids
  // running timers for hidden rows and replays the scramble each time the row is
  // re-engaged (the effect keys off `active`, so no remount, so clicks/focus stay
  // intact). `isDesktop` defaults true so nothing decodes until hover on desktop.
  const [hovered, setHovered] = useState(false)
  const [focused, setFocused] = useState(false)
  const active = hovered || focused || !isDesktop

  return (
    <li
      className="rga-nav-row group flex flex-col items-center"
      style={{
        animation: 'rga-nav-row-in 320ms cubic-bezier(.2,.8,.2,1) both',
        animationDelay: `${120 + index * 60}ms`,
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocus={() => setFocused(true)}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setFocused(false)
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

      <SubLinkRow sub={item.sub} onNavigate={onNavigate} active={active} />
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

const DECODE_GLYPHS = '!<>-_\\/[]{}—=+*^?#'

/**
 * Reveals `text` left-to-right: unrevealed glyphs cycle through random terminal
 * characters until the reveal cursor reaches them; spaces are never scrambled.
 * Runs only while `active` (the row is visible) and replays whenever `active`
 * flips back on — without remounting, so links stay clickable/focusable. Honours
 * prefers-reduced-motion by showing the final text immediately. The visible text
 * is decorative; callers expose the real label via aria for a stable name.
 */
function useDecode(text: string, { delayMs = 0, active }: { delayMs?: number; active: boolean }): string {
  const placeholder = text.replace(/[^ ]/g, ' ')
  const [out, setOut] = useState(placeholder)

  useEffect(() => {
    if (!active || typeof window === 'undefined') return

    const reduce =
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduce) {
      setOut(text)
      return
    }

    setOut(placeholder)
    let intervalId: ReturnType<typeof setInterval> | null = null

    const timeoutId = setTimeout(() => {
      let frame = 0
      intervalId = setInterval(() => {
        frame++
        const reveal = Math.ceil(frame / 2)

        if (reveal >= text.length) {
          setOut(text)
          if (intervalId) clearInterval(intervalId)
          intervalId = null
          return
        }

        let s = text.slice(0, reveal)
        for (let i = reveal; i < text.length; i++) {
          s +=
            text[i] === ' ' ? ' ' : DECODE_GLYPHS[Math.floor(Math.random() * DECODE_GLYPHS.length)]
        }
        setOut(s)
      }, 22)
    }, delayMs)

    return () => {
      clearTimeout(timeoutId)
      if (intervalId) clearInterval(intervalId)
    }
  }, [text, delayMs, active, placeholder])

  return out
}

interface DecodeLinkProps {
  href: string
  label: string
  delayMs: number
  active: boolean
  onClick: (e: React.MouseEvent<HTMLAnchorElement>, href: string) => void
}

function DecodeLink({ href, label, delayMs, active, onClick }: DecodeLinkProps) {
  const target = label.toUpperCase()
  const decoded = useDecode(target, { delayMs, active })

  return (
    <li>
      <Link
        href={href}
        onClick={(e) => onClick(e, href)}
        aria-label={target}
        className="
          group/link inline-flex items-center gap-[9px]
          px-[14px] py-[10px]
          font-mono text-[13px] font-medium tracking-[0.18em] uppercase
          text-rga-cyan/90 no-underline
          transition-all duration-[120ms] ease-in-out
          hover:bg-rga-cyan hover:text-void hover:shadow-[0_0_22px_rgba(0,255,255,0.35)]
        "
      >
        <span aria-hidden className="text-rga-green/85 group-hover/link:text-void transition-colors duration-120">
          &gt;
        </span>
        <span aria-hidden>{decoded}</span>
      </Link>
    </li>
  )
}

interface SubLinkRowProps {
  sub: readonly NavSubLink[]
  onNavigate: () => void
  active: boolean
}

function SubLinkRow({ sub, onNavigate, active }: SubLinkRowProps) {
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
          pt-[18px] pb-[14px] sm:pl-[50px]
          transition-transform duration-[420ms] ease-[cubic-bezier(0.2,0.8,0.2,1)]
          sm:-translate-y-1 sm:group-hover:translate-y-0 sm:group-focus-within:translate-y-0
        "
        style={{ gap: 4 }}
      >
        {sub.map((s, i) =>
          s.available ? (
            <DecodeLink
              key={s.label}
              href={s.href}
              label={s.label}
              delayMs={i * 110}
              active={active}
              onClick={handleClick}
            />
          ) : (
            <li key={s.label}>
              <span
                aria-disabled="true"
                className="
                  inline-flex items-center gap-[9px]
                  px-[14px] py-[10px]
                  font-mono text-[13px] tracking-[0.18em] uppercase
                  text-white/30 cursor-not-allowed
                "
              >
                <span className="text-rga-green/40">&gt;</span>
                <span>{s.label.toUpperCase()} [soon]</span>
              </span>
            </li>
          ),
        )}
        {/* Blinking cursor — desktop only; on mobile the stacked column has no inline row end */}
        <li aria-hidden="true" className="hidden self-center sm:block">
          <span
            className="font-mono text-[13px] text-rga-green animate-blink"
            style={{ animationDuration: '1.06s' }}
          >
            ▌
          </span>
        </li>
      </ul>
    </div>
  )
}
