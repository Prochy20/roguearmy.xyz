'use client'

import { useCallback, useEffect, useRef } from 'react'

interface GlitchOnChangeProps {
  /** Fires a one-shot glitch sequence each time this value changes. The
   *  initial mount is skipped so a fresh page load doesn't glitch. */
  triggerKey: string
  children: React.ReactNode
}

/** Random horizontal slice offsets for the displacement effect. */
function generateSlices(count: number, power: number): number[] {
  return Array.from({ length: count }, () => (Math.random() - 0.5) * power)
}

/**
 * Multi-phase screen-tearing transition for arbitrary content. Same
 * vocabulary as the manifesto rules-version toggle: the children render
 * normally on the main layer, with hidden duplicates standing by as cyan +
 * magenta RGB-split copies and five horizontal slice copies. When
 * `triggerKey` changes, a 350ms phase machine flips the overlays on with
 * timed displacement / clip-path / opacity values, then snaps everything
 * back to idle.
 *
 * Effects are driven via refs (no React re-renders during the animation),
 * so the wrapped tree can contain arbitrary server-component children
 * including images.
 */
export function GlitchOnChange({ triggerKey, children }: GlitchOnChangeProps) {
  const scanlineRef = useRef<HTMLDivElement>(null)
  const flickerRef = useRef<HTMLDivElement>(null)
  const cyanRef = useRef<HTMLDivElement>(null)
  const magentaRef = useRef<HTMLDivElement>(null)
  const sliceRefs = useRef<(HTMLDivElement | null)[]>([])
  const noiseRef = useRef<HTMLDivElement>(null)
  const mainRef = useRef<HTMLDivElement>(null)
  const firstRenderRef = useRef(true)

  const applyPhase = useCallback(
    (phase: number, slices: number[], rgbOffset: number, flickerOpacity: number) => {
      const show = phase > 0
      const showRgb = phase > 0 && phase < 4
      const rgbOpacity = phase === 2 ? 0.7 : phase === 1 ? 0.5 : 0.3

      if (scanlineRef.current) {
        scanlineRef.current.style.display = show ? '' : 'none'
      }

      if (flickerRef.current) {
        flickerRef.current.style.display = flickerOpacity > 0 ? '' : 'none'
        flickerRef.current.style.opacity = String(flickerOpacity)
      }

      if (cyanRef.current) {
        cyanRef.current.style.display = showRgb ? '' : 'none'
        if (showRgb) {
          cyanRef.current.style.transform = `translateX(${-rgbOffset}px)`
          cyanRef.current.style.opacity = String(rgbOpacity)
          cyanRef.current.style.clipPath = `polygon(
            0% ${20 + (slices[0] ?? 0)}%,
            100% ${20 + (slices[0] ?? 0)}%,
            100% ${60 + (slices[2] ?? 0)}%,
            0% ${60 + (slices[2] ?? 0)}%
          )`
        }
      }

      if (magentaRef.current) {
        magentaRef.current.style.display = showRgb ? '' : 'none'
        if (showRgb) {
          magentaRef.current.style.transform = `translateX(${rgbOffset}px)`
          magentaRef.current.style.opacity = String(rgbOpacity)
          magentaRef.current.style.clipPath = `polygon(
            0% ${40 + (slices[1] ?? 0)}%,
            100% ${40 + (slices[1] ?? 0)}%,
            100% ${80 + (slices[3] ?? 0)}%,
            0% ${80 + (slices[3] ?? 0)}%
          )`
        }
      }

      sliceRefs.current.forEach((el, i) => {
        if (!el) return
        const offset = slices[i] ?? 0
        const visible = show && Math.abs(offset) > 2
        el.style.display = visible ? '' : 'none'
        if (visible) {
          el.style.transform = `translateX(${offset * (i % 2 === 0 ? 1 : -1)}px)`
          el.style.filter = Math.abs(offset) > 8 ? 'brightness(1.2)' : 'none'
        }
      })

      if (noiseRef.current) {
        noiseRef.current.style.display = showRgb ? '' : 'none'
      }

      if (mainRef.current) {
        if (show) {
          mainRef.current.style.transform = `translateX(${(slices[2] ?? 0) * 0.3}px) skewX(${
            phase === 2 ? 0.3 : phase === 1 ? 0.15 : 0
          }deg)`
          mainRef.current.style.textShadow = showRgb
            ? `${rgbOffset}px 0 #00ffff, ${-rgbOffset}px 0 #ff00ff`
            : 'none'
        } else {
          mainRef.current.style.transform = ''
          mainRef.current.style.textShadow = ''
        }
      }
    },
    [],
  )

  const runGlitch = useCallback(() => {
    // Phase 1: Initial spike (0-60ms)
    applyPhase(1, generateSlices(5, 20), 6, 0.08)
    // Phase 2: Intense (60-150ms)
    setTimeout(() => applyPhase(2, generateSlices(5, 30), 10, 0.15), 60)
    // Phase 3: Decay (150-250ms)
    setTimeout(() => applyPhase(3, generateSlices(5, 12), 4, 0.04), 150)
    // Phase 4: Aftershock (250-350ms)
    setTimeout(() => applyPhase(4, generateSlices(5, 5), 1, 0), 250)
    // End — back to idle
    setTimeout(() => applyPhase(0, [0, 0, 0, 0, 0], 0, 0), 350)
  }, [applyPhase])

  useEffect(() => {
    if (firstRenderRef.current) {
      firstRenderRef.current = false
      return
    }
    runGlitch()
  }, [triggerKey, runGlitch])

  return (
    <div className="relative overflow-hidden">
      <div
        ref={scanlineRef}
        className="absolute inset-0 pointer-events-none z-50"
        style={{
          display: 'none',
          background: `repeating-linear-gradient(
            0deg,
            transparent,
            transparent 2px,
            rgba(0,0,0,0.15) 2px,
            rgba(0,0,0,0.15) 4px
          )`,
          animation: 'goc-scanlines 0.1s linear infinite',
        }}
      />

      <div
        ref={flickerRef}
        className="absolute inset-0 bg-white mix-blend-overlay pointer-events-none z-40"
        style={{ display: 'none', opacity: 0 }}
      />

      {/* Overlay duplicates of `children` for RGB split + slice displacement */}
      <div aria-hidden="true">
        <div
          ref={cyanRef}
          className="absolute inset-0 pointer-events-none z-30"
          style={{ display: 'none', color: '#00ffff', mixBlendMode: 'screen' }}
        >
          {children}
        </div>

        <div
          ref={magentaRef}
          className="absolute inset-0 pointer-events-none z-30"
          style={{ display: 'none', color: '#ff00ff', mixBlendMode: 'screen' }}
        >
          {children}
        </div>

        {Array.from({ length: 5 }, (_, i) => (
          <div
            key={`goc-slice-${i}`}
            ref={(el) => {
              sliceRefs.current[i] = el
            }}
            className="absolute inset-0 pointer-events-none z-20"
            style={{
              display: 'none',
              clipPath: `polygon(
                0% ${i * 20}%,
                100% ${i * 20}%,
                100% ${(i + 1) * 20}%,
                0% ${(i + 1) * 20}%
              )`,
              opacity: 0.9,
            }}
          >
            {children}
          </div>
        ))}
      </div>

      <div
        ref={noiseRef}
        className="absolute inset-0 pointer-events-none z-30 mix-blend-overlay opacity-30"
        style={{
          display: 'none',
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          animation: 'goc-noise 0.1s steps(2) infinite',
        }}
      />

      <div ref={mainRef} className="relative z-10">
        {children}
      </div>

      <style jsx>{`
        @keyframes goc-scanlines {
          0% {
            background-position: 0 0;
          }
          100% {
            background-position: 0 4px;
          }
        }
        @keyframes goc-noise {
          0%,
          100% {
            transform: translate(0, 0);
          }
          10% {
            transform: translate(-5%, -5%);
          }
          20% {
            transform: translate(5%, 5%);
          }
          30% {
            transform: translate(-5%, 5%);
          }
          40% {
            transform: translate(5%, -5%);
          }
          50% {
            transform: translate(-5%, 0);
          }
          60% {
            transform: translate(5%, 0);
          }
          70% {
            transform: translate(0, 5%);
          }
          80% {
            transform: translate(0, -5%);
          }
          90% {
            transform: translate(5%, 5%);
          }
        }
      `}</style>
    </div>
  )
}
