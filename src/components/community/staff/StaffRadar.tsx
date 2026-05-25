'use client'

import { useEffect, useRef, useState } from 'react'
import { cn } from '@/lib/utils'

interface RadarContact {
  name: string
  /** "r,g,b" — slotted into `rgba(...,a)` for the dot, halo, and label fills. */
  color: string
}

interface StaffRadarProps {
  blipCount?: number
  contacts?: RadarContact[]
  className?: string
}

const SWEEP_PERIOD_S = 11
const BLIP_LIFETIME_S = 3.2
const DEFAULT_COLOR = '0,255,65'

interface Blip {
  id: number
  x: number
  y: number
  delay: number
  name: string
  color: string
}

export function StaffRadar({ blipCount = 4, contacts, className }: StaffRadarProps) {
  const [blips, setBlips] = useState<Blip[]>([])
  const sweepStartRef = useRef(0)
  const nextIdRef = useRef(0)
  const blipCountRef = useRef(blipCount)
  const contactsRef = useRef<RadarContact[]>(contacts ?? [])

  useEffect(() => {
    blipCountRef.current = blipCount
  }, [blipCount])

  useEffect(() => {
    contactsRef.current = contacts ?? []
  }, [contacts])

  useEffect(() => {
    sweepStartRef.current = performance.now()
    let alive = true
    let scheduleTimer: ReturnType<typeof setTimeout> | undefined

    const spawnBlip = () => {
      if (!alive) return

      const angle = Math.random() * 360
      const radius = 22 + Math.random() * 68

      const elapsed = (performance.now() - sweepStartRef.current) / 1000
      const sweepAngle = ((elapsed / SWEEP_PERIOD_S) * 360) % 360
      const angleToGo = (angle - sweepAngle + 360) % 360
      const delay = (angleToGo / 360) * SWEEP_PERIOD_S

      const id = nextIdRef.current++
      const rad = (angle * Math.PI) / 180
      const x = +(Math.cos(rad) * radius).toFixed(2)
      const y = +(Math.sin(rad) * radius).toFixed(2)

      const pool = contactsRef.current
      const contact =
        pool.length > 0 ? pool[Math.floor(Math.random() * pool.length)]! : null
      const name = contact ? contact.name.toUpperCase().slice(0, 14) : ''
      const color = contact ? contact.color : DEFAULT_COLOR

      setBlips((prev) => [...prev, { id, x, y, delay, name, color }])

      setTimeout(() => {
        if (!alive) return
        setBlips((prev) => prev.filter((b) => b.id !== id))
      }, (delay + BLIP_LIFETIME_S + 0.2) * 1000)
    }

    const scheduleNext = () => {
      const base = (SWEEP_PERIOD_S * 1000) / Math.max(blipCountRef.current, 1)
      const interval = base * (0.35 + Math.random() * 1.3)
      scheduleTimer = setTimeout(() => {
        spawnBlip()
        scheduleNext()
      }, interval)
    }

    spawnBlip()
    spawnBlip()
    scheduleNext()

    return () => {
      alive = false
      if (scheduleTimer) clearTimeout(scheduleTimer)
    }
  }, [])

  return (
    <div
      aria-hidden
      className={cn(
        'pointer-events-none relative hidden aspect-square w-[440px] opacity-40 lg:block xl:w-[560px] 2xl:w-[680px]',
        className,
      )}
    >
      <div className="absolute inset-[4.5%] overflow-hidden rounded-full">
        <div className="rga-scanner-sweep absolute inset-0">
          <div
            className="absolute inset-0"
            style={{
              background:
                'conic-gradient(from 30deg, transparent 0deg, rgba(0,255,255,0.14) 60deg, transparent 60.5deg)',
            }}
          />
          <div
            className="absolute top-1/2 left-1/2 h-px w-1/2 -translate-y-1/2"
            style={{
              background:
                'linear-gradient(to right, rgba(0,255,255,0.06), rgba(0,255,255,0.40))',
            }}
          />
        </div>
      </div>

      <svg viewBox="-110 -110 220 220" className="absolute inset-0 h-full w-full">
        <defs>
          <radialGradient id="rga-radar-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="rgba(0,255,255,0.05)" />
            <stop offset="100%" stopColor="rgba(0,255,255,0)" />
          </radialGradient>
        </defs>

        <circle r="100" fill="url(#rga-radar-glow)" />

        <circle r="100" fill="none" stroke="rgba(0,255,255,0.10)" strokeWidth="0.4" />
        <circle r="66" fill="none" stroke="rgba(0,255,255,0.07)" strokeWidth="0.3" />
        <circle r="33" fill="none" stroke="rgba(0,255,255,0.07)" strokeWidth="0.3" />

        <line x1="-100" y1="0" x2="100" y2="0" stroke="rgba(0,255,255,0.05)" strokeWidth="0.3" />
        <line x1="0" y1="-100" x2="0" y2="100" stroke="rgba(0,255,255,0.05)" strokeWidth="0.3" />

        {blips.map((b) => {
          const labelOnLeft = b.x > 0
          return (
            <g key={b.id}>
              <circle
                cx={b.x}
                cy={b.y}
                r="4"
                fill={`rgba(${b.color},0.22)`}
                className="rga-radar-blip-halo"
                style={{ animationDelay: `${b.delay}s` }}
              />
              <circle
                cx={b.x}
                cy={b.y}
                r="1.6"
                fill={`rgba(${b.color},0.9)`}
                className="rga-radar-blip-dot"
                style={{ animationDelay: `${b.delay}s` }}
              />
              {b.name && (
                <text
                  x={labelOnLeft ? b.x - 4 : b.x + 4}
                  y={b.y}
                  dominantBaseline="middle"
                  textAnchor={labelOnLeft ? 'end' : 'start'}
                  fontSize="5"
                  fontFamily="ui-monospace, SFMono-Regular, Menlo, monospace"
                  letterSpacing="0.3"
                  fill={`rgba(${b.color},0.95)`}
                  className="rga-radar-blip-dot"
                  style={{ animationDelay: `${b.delay}s` }}
                >
                  {b.name}
                </text>
              )}
            </g>
          )
        })}

        <circle r="1.2" fill="rgba(0,255,255,0.5)" />
      </svg>
    </div>
  )
}
