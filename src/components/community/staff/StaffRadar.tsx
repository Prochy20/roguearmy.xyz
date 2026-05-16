import { cn } from '@/lib/utils'

interface StaffRadarProps {
  blipCount?: number
  className?: string
}

const SWEEP_PERIOD_S = 11

const BLIP_SLOTS = [
  { angle: 38, radius: 64 },
  { angle: 158, radius: 78 },
  { angle: 248, radius: 52 },
  { angle: 322, radius: 70 },
  { angle: 95, radius: 40 },
  { angle: 205, radius: 86 },
] as const

export function StaffRadar({ blipCount = 4, className }: StaffRadarProps) {
  const count = Math.min(Math.max(blipCount, 0), BLIP_SLOTS.length)
  const blips = BLIP_SLOTS.slice(0, count).map((b) => ({
    x: +(Math.cos((b.angle * Math.PI) / 180) * b.radius).toFixed(2),
    y: +(Math.sin((b.angle * Math.PI) / 180) * b.radius).toFixed(2),
    // Sweep starts at 3 o'clock (angle 0) and rotates clockwise over SWEEP_PERIOD_S.
    // The sweep crosses this blip's angle at t = (angle / 360) * period.
    delay: +((b.angle / 360) * SWEEP_PERIOD_S).toFixed(2),
  }))

  return (
    <div
      aria-hidden
      className={cn(
        'pointer-events-none relative hidden aspect-square w-[440px] opacity-40 lg:block xl:w-[560px] 2xl:w-[680px]',
        className,
      )}
    >
      <div className="absolute inset-[4.5%] overflow-hidden rounded-full">
        <div className="rga-radar-sweep absolute inset-0">
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

        {blips.map((b, i) => (
          <g key={i}>
            <circle
              cx={b.x}
              cy={b.y}
              r="4"
              fill="rgba(0,255,65,0.22)"
              className="rga-radar-blip-halo"
              style={{ animationDelay: `${b.delay}s` }}
            />
            <circle
              cx={b.x}
              cy={b.y}
              r="1.6"
              fill="rgba(0,255,65,0.85)"
              className="rga-radar-blip-dot"
              style={{ animationDelay: `${b.delay}s` }}
            />
          </g>
        ))}

        <circle r="1.2" fill="rgba(0,255,255,0.5)" />
      </svg>
    </div>
  )
}
