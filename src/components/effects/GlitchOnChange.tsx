'use client'

import { useEffect, useRef, useState } from 'react'
import { cn } from '@/lib/utils'

interface GlitchOnChangeProps {
  /** When this value changes, fire a one-shot glitch animation. */
  triggerKey: string
  /** Optional className applied to the wrapper. */
  className?: string
  children: React.ReactNode
}

/**
 * Wraps arbitrary content and fires a one-shot CSS glitch transition each
 * time `triggerKey` changes (the initial mount is skipped).
 *
 * Designed for App Router pagination: the React tree stays mounted across
 * navigations driven by `<Link scroll={false}>`, so a single `useEffect`
 * watching the new key is enough to drive the animation. Effects are pure
 * CSS (filter / transform / opacity on the wrapper plus two overlay layers),
 * so the wrapped tree can contain anything — images, server components,
 * nested CyberCorners — without needing to duplicate the DOM.
 *
 * Total duration ~550ms; long enough to register as a transition, short
 * enough that the user doesn't feel like the page is hanging.
 */
export function GlitchOnChange({ triggerKey, className, children }: GlitchOnChangeProps) {
  const firstRenderRef = useRef(true)
  const [active, setActive] = useState(false)

  useEffect(() => {
    if (firstRenderRef.current) {
      firstRenderRef.current = false
      return
    }
    setActive(true)
    const t = setTimeout(() => setActive(false), 550)
    return () => clearTimeout(t)
  }, [triggerKey])

  return (
    <div className={cn('relative', className)}>
      <div className={active ? 'goc-content goc-content-active' : 'goc-content'}>
        {children}
      </div>
      {active && (
        <>
          <div
            aria-hidden
            className="goc-flash pointer-events-none absolute inset-0 z-50"
          />
          <div
            aria-hidden
            className="goc-scanlines pointer-events-none absolute inset-0 z-40"
          />
          <div
            aria-hidden
            className="goc-noise pointer-events-none absolute inset-0 z-30 mix-blend-overlay"
          />
        </>
      )}
      <style jsx>{`
        .goc-content {
          will-change: filter, transform, opacity;
        }
        .goc-content-active {
          animation: goc-content 550ms steps(18) both;
        }
        .goc-flash {
          background: linear-gradient(
            180deg,
            rgba(255, 255, 255, 0.18) 0%,
            rgba(0, 255, 255, 0.1) 32%,
            rgba(255, 0, 255, 0.1) 68%,
            rgba(255, 255, 255, 0.14) 100%
          );
          mix-blend-mode: overlay;
          animation: goc-flash 380ms steps(8) both;
        }
        .goc-scanlines {
          background: repeating-linear-gradient(
            0deg,
            transparent,
            transparent 2px,
            rgba(0, 0, 0, 0.25) 2px,
            rgba(0, 0, 0, 0.25) 4px
          );
          animation: goc-scanlines 550ms steps(6) both;
        }
        .goc-noise {
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
          opacity: 0.3;
          animation: goc-noise 220ms steps(3) both;
        }

        @keyframes goc-content {
          0% {
            filter: none;
            transform: none;
            opacity: 1;
          }
          5% {
            filter: brightness(1.55) contrast(1.4) hue-rotate(-14deg);
            transform: translateX(-6px) skewX(-1.4deg);
            opacity: 0.82;
          }
          11% {
            filter: brightness(0.65) contrast(1.35) hue-rotate(22deg);
            transform: translateX(8px) skewX(0.9deg);
            opacity: 0.74;
          }
          18% {
            filter: brightness(1.25) contrast(1.18) hue-rotate(-8deg);
            transform: translateX(-4px) skewX(0.4deg);
            opacity: 0.9;
          }
          27% {
            filter: brightness(0.95) contrast(1.08);
            transform: translateX(3px) skewX(-0.2deg);
            opacity: 0.95;
          }
          42% {
            filter: brightness(1.08) contrast(1.04);
            transform: translateX(-2px);
            opacity: 0.97;
          }
          58% {
            filter: none;
            transform: translateX(1px);
            opacity: 0.99;
          }
          74% {
            filter: brightness(1.12);
            transform: translateX(-0.5px);
            opacity: 0.97;
          }
          88% {
            filter: none;
            transform: none;
            opacity: 1;
          }
          100% {
            filter: none;
            transform: none;
            opacity: 1;
          }
        }

        @keyframes goc-flash {
          0% {
            opacity: 0;
          }
          12% {
            opacity: 0.95;
          }
          24% {
            opacity: 0.35;
          }
          40% {
            opacity: 0.7;
          }
          60% {
            opacity: 0.18;
          }
          82% {
            opacity: 0.05;
          }
          100% {
            opacity: 0;
          }
        }

        @keyframes goc-scanlines {
          0% {
            opacity: 0;
            transform: translateY(0);
          }
          10% {
            opacity: 0.55;
            transform: translateY(0);
          }
          45% {
            opacity: 0.28;
            transform: translateY(3px);
          }
          78% {
            opacity: 0.12;
            transform: translateY(-2px);
          }
          100% {
            opacity: 0;
            transform: translateY(0);
          }
        }

        @keyframes goc-noise {
          0%,
          100% {
            opacity: 0;
            transform: translate(0, 0);
          }
          25% {
            opacity: 0.35;
            transform: translate(-3%, 2%);
          }
          50% {
            opacity: 0.5;
            transform: translate(3%, -2%);
          }
          75% {
            opacity: 0.25;
            transform: translate(-1%, 1%);
          }
        }
      `}</style>
    </div>
  )
}
