'use client'

import { useEffect, useState } from 'react'

interface GlitchNameProps {
  name: string
  className?: string
  /** Average ms between glitch events. Default 10000 (~10s). */
  intervalMs?: number
  /** ms each glitch sustains before reverting. Default 120. */
  durationMs?: number
}

const GLYPH_BANK = '▓▒░█▌▐│┃╿┊◢◤◣◥'

function corrupt(name: string): string {
  if (name.length === 0) return name
  const idx = Math.floor(Math.random() * name.length)
  const glyph = GLYPH_BANK[Math.floor(Math.random() * GLYPH_BANK.length)]
  return name.slice(0, idx) + glyph + name.slice(idx + 1)
}

export function GlitchName({
  name,
  className,
  intervalMs = 10000,
  durationMs = 120,
}: GlitchNameProps) {
  const [display, setDisplay] = useState(name)
  const [glitching, setGlitching] = useState(false)

  useEffect(() => {
    setDisplay(name)
    let revertTimer: ReturnType<typeof setTimeout> | null = null
    const cycle = () => {
      const jitter = intervalMs * (0.6 + Math.random() * 0.8)
      const id = setTimeout(() => {
        setDisplay(corrupt(name))
        setGlitching(true)
        revertTimer = setTimeout(() => {
          setDisplay(name)
          setGlitching(false)
          cycle()
        }, durationMs)
      }, jitter)
      return id
    }
    const t = cycle()
    return () => {
      clearTimeout(t)
      if (revertTimer) clearTimeout(revertTimer)
    }
  }, [name, intervalMs, durationMs])

  return (
    <span
      className={className}
      style={
        glitching
          ? { textShadow: '-2px 0 #00FFFF, 2px 0 #FF00FF' }
          : undefined
      }
    >
      {display}
    </span>
  )
}
