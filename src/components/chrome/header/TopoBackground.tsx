interface TopoBackgroundProps {
  glow?: number
}

export function TopoBackground({ glow = 1 }: TopoBackgroundProps) {
  const radial = `rgba(0,255,65,${0.15 * glow + 0.06})`

  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 overflow-hidden"
      style={{
        background: `radial-gradient(ellipse 70% 50% at 80% 20%, ${radial} 0%, transparent 60%)`,
      }}
    >
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 1280 820"
        preserveAspectRatio="xMidYMid slice"
        className="absolute inset-0 opacity-[0.18]"
      >
        <defs>
          <pattern id="rga-nav-dots" width="40" height="40" patternUnits="userSpaceOnUse">
            <circle cx="1" cy="1" r="0.8" fill="rgba(255,255,255,0.4)" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#rga-nav-dots)" />
        {Array.from({ length: 8 }).map((_, i) => (
          <path
            key={i}
            d={`M ${-100 + i * 40} ${100 + i * 60} Q 320 ${20 + i * 70} 640 ${120 + i * 60} T 1380 ${80 + i * 70}`}
            fill="none"
            stroke="rgba(0,255,65,0.18)"
            strokeWidth="1"
          />
        ))}
      </svg>
    </div>
  )
}
