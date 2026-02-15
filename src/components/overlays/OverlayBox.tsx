'use client'

import {
  BADGE_SIZE_MAP,
  BOX_COLORS,
  FONT_SIZE_MAP,
  ICON_MAP,
  generateFlickerKeyframes,
  getBackgroundStyle,
  type OverlayBoxConfig,
} from '@/lib/overlay-box-config'
import { cn } from '@/lib/utils'

const CORNER_SIZE = 20
const BORDER_WIDTH = 1
const ACCENT_WIDTH = 4

export function OverlayBox({
  color,
  badge,
  icon,
  accent,
  text,
  flicker,
  flickerSpeed,
  fontSize,
  badgeSize,
  textAlign,
  background,
  bgOpacity,
}: OverlayBoxConfig) {
  const c = BOX_COLORS[color]
  const IconComponent = icon !== 'none' ? ICON_MAP[icon] : null
  const bs = BADGE_SIZE_MAP[badgeSize]
  const bgStyle = getBackgroundStyle(background, color, bgOpacity)
  const flickerName = 'overlay-box-flicker'
  const flickerCss = flicker ? generateFlickerKeyframes(flickerName, flickerSpeed) : ''

  return (
    <>
      {flickerCss && <style>{flickerCss}</style>}
      <div
        className="fixed inset-0"
        style={{
          padding: 24,
          ...(flicker ? { animation: `${flickerName} ${flickerSpeed}s ease-in-out infinite` } : {}),
        }}
      >
      <div className="relative w-full h-full" style={bgStyle}>
        {/* ── Top Edge: [line] [badge] [line] ── */}
        <div className="absolute top-0 left-0 right-0 flex items-center" style={{ height: BORDER_WIDTH }}>
          <div className="flex-1" style={{ height: BORDER_WIDTH, backgroundColor: c.hex }} />
          {badge && (
            <>
              <div
                className="font-mono uppercase tracking-widest flex items-center gap-1.5 shrink-0"
                style={{
                  color: c.hex,
                  fontSize: bs.fontSize,
                  fontWeight: 700,
                  padding: '0 10px',
                  lineHeight: 1,
                  marginTop: -1,
                  textShadow: `0 0 8px ${c.glow}`,
                }}
              >
                {IconComponent && <IconComponent size={bs.iconSize} />}
                {badge}
              </div>
              <div className="flex-1" style={{ height: BORDER_WIDTH, backgroundColor: c.hex }} />
            </>
          )}
        </div>

        {/* ── Bottom Border ── */}
        <div
          className="absolute bottom-0 left-0 right-0"
          style={{ height: BORDER_WIDTH, backgroundColor: c.hex }}
        />

        {/* ── Left Border ── */}
        <div
          className="absolute top-0 bottom-0 left-0"
          style={{ width: BORDER_WIDTH, backgroundColor: c.hex }}
        />

        {/* ── Right Border ── */}
        <div
          className="absolute top-0 bottom-0 right-0"
          style={{ width: BORDER_WIDTH, backgroundColor: c.hex }}
        />

        {/* ── Corner Brackets ── */}
        <Corner position="tl" hex={c.hex} glow={c.glow} />
        <Corner position="tr" hex={c.hex} glow={c.glow} />
        <Corner position="bl" hex={c.hex} glow={c.glow} />
        <Corner position="br" hex={c.hex} glow={c.glow} />

        {/* ── Left Accent Bar ── */}
        {accent && (
          <div
            className="absolute top-0 bottom-0"
            style={{
              left: BORDER_WIDTH,
              width: ACCENT_WIDTH,
              backgroundColor: c.hex,
              boxShadow: `0 0 8px ${c.glow}, 0 0 16px ${c.glow}`,
            }}
          />
        )}

        {/* ── Content Text ── */}
        {text && (
          <div
            className={cn('absolute font-mono whitespace-pre-wrap', FONT_SIZE_MAP[fontSize])}
            style={{
              top: 16,
              right: 16,
              bottom: 16,
              left: accent ? BORDER_WIDTH + ACCENT_WIDTH + 16 : 16,
              color: c.hex,
              textAlign,
              textShadow: `0 0 6px ${c.glow}`,
            }}
          >
            {text}
          </div>
        )}
      </div>
    </div>
    </>
  )
}

// ─── Corner Bracket Subcomponent ─────────────────────────────────────────────

function Corner({
  position,
  hex,
  glow,
}: {
  position: 'tl' | 'tr' | 'bl' | 'br'
  hex: string
  glow: string
}) {
  const isTop = position === 'tl' || position === 'tr'
  const isLeft = position === 'tl' || position === 'bl'

  const posStyle: React.CSSProperties = {
    position: 'absolute',
    ...(isTop ? { top: -1 } : { bottom: -1 }),
    ...(isLeft ? { left: -1 } : { right: -1 }),
    width: CORNER_SIZE,
    height: CORNER_SIZE,
    pointerEvents: 'none',
  }

  const glowShadow = `0 0 6px ${glow}`

  return (
    <div style={posStyle}>
      {/* Horizontal arm */}
      <div
        style={{
          position: 'absolute',
          ...(isTop ? { top: 0 } : { bottom: 0 }),
          ...(isLeft ? { left: 0 } : { right: 0 }),
          width: CORNER_SIZE,
          height: 2,
          backgroundColor: hex,
          boxShadow: glowShadow,
        }}
      />
      {/* Vertical arm */}
      <div
        style={{
          position: 'absolute',
          ...(isTop ? { top: 0 } : { bottom: 0 }),
          ...(isLeft ? { left: 0 } : { right: 0 }),
          width: 2,
          height: CORNER_SIZE,
          backgroundColor: hex,
          boxShadow: glowShadow,
        }}
      />
    </div>
  )
}
