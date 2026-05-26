import { cn } from '@/lib/utils'

interface WashingtonMapProps {
  className?: string
}

const MAP = {
  centerLon: -77.0365,
  centerLat: 38.8893,
  zoom: 12.2,
  sizePx: 600,
} as const

const SCALE = 256 * Math.pow(2, MAP.zoom)

function lonToWorldPx(lon: number): number {
  return ((lon + 180) / 360) * SCALE
}

function latToWorldPx(lat: number): number {
  const rad = (lat * Math.PI) / 180
  return ((1 - Math.log(Math.tan(rad) + 1 / Math.cos(rad)) / Math.PI) / 2) * SCALE
}

const CENTER_WORLD = {
  x: lonToWorldPx(MAP.centerLon),
  y: latToWorldPx(MAP.centerLat),
}

function project(lon: number, lat: number): { x: number; y: number } {
  const px = lonToWorldPx(lon) - CENTER_WORLD.x + MAP.sizePx / 2
  const py = latToWorldPx(lat) - CENTER_WORLD.y + MAP.sizePx / 2
  const x = (px / MAP.sizePx) * 100
  const y = (py / MAP.sizePx) * 100
  return { x: +x.toFixed(2), y: +y.toFixed(2) }
}

// Precomputed positions for the schematic overlay layers (arcs + Mall
// axis). Recomputed automatically when MAP constants change.
const OVERLAY = {
  baseOfOps: project(-77.0365, 38.8977),
  lincoln: project(-77.0502, 38.8893),
  capitol: project(-77.0091, 38.8899),
} as const

function buildMapboxUrl(): string | null {
  const token = process.env.MAPBOX_TOKEN
  if (!token) return null
  // No `@2x` suffix: the map is heavily dimmed (opacity-50 + grayscale +
  // scanline dithering), so retina pixel-density is invisible — and the
  // 1x variant is ~4x lighter on bytes, meaningfully faster on first paint.
  return (
    `https://api.mapbox.com/styles/v1/mapbox/streets-v12/static/` +
    `${MAP.centerLon},${MAP.centerLat},${MAP.zoom},0/` +
    `${MAP.sizePx}x${MAP.sizePx}?access_token=${token}`
  )
}

type LabelPos = 'above' | 'below' | 'left' | 'right'

interface Landmark {
  lon: number
  lat: number
  label: string
  pos: LabelPos
}

// Label positions chosen so every card lands inside the visible half
// (container x≈0-50%). Anything pointing 'right' from an east-side pin
// would clip past the viewport edge — so eastern pins point 'left' or
// 'below', and only western pins (Pentagon, Roosevelt) point 'right'.
const LANDMARKS: ReadonlyArray<Landmark> = [
  // White House — Base of Operations (player safe house). Card sits
  // BELOW the pin so the dot itself anchors at the actual building
  // location and the label reads beneath it.
  { lon: -77.0365, lat: 38.8977, label: 'BASE OF OPS', pos: 'below' },
  // U.S. Capitol — Capitol Stronghold. Shortened to fit the layout;
  // gamers will recognize the location from the pin. Label points 'left'
  // because the pin sits at x≈48% — a 'right' or 'below'-centered card
  // would clip past the visible viewport edge at x=50%.
  { lon: -77.0091, lat: 38.8899, label: 'CAPITOL', pos: 'left' },
  // Capital One Arena — District Union Arena (early stronghold).
  { lon: -77.021, lat: 38.8985, label: 'DISTRICT UNION', pos: 'above' },
  // Lincoln Memorial — open-world POI. Flipped to 'left' so the card
  // doesn't collide with BASE OF OPS now sitting 'below' just NE.
  { lon: -77.0502, lat: 38.8893, label: 'LINCOLN', pos: 'left' },
  // Jefferson Memorial — Tidal Basin raid.
  { lon: -77.0365, lat: 38.8814, label: 'TIDAL BASIN', pos: 'left' },
  // Pentagon — DLC area. Westernmost pin in the lower band, so the
  // label points into the map (right) rather than off-canvas.
  { lon: -77.0563, lat: 38.8719, label: 'PENTAGON', pos: 'right' },
  // Roosevelt Island — Dark Zone. Westernmost pin; label points 'above'
  // so it sits in a different y-row than BASE OF OPS just east. (Either
  // 'left' or 'below' here causes the two cards to read as one continuous
  // strip with a pin punctuation in the middle.)
  { lon: -77.0625, lat: 38.897, label: 'ROOSEVELT', pos: 'above' },
  // The Wharf — open-world zone.
  { lon: -77.022, lat: 38.876, label: 'THE WHARF', pos: 'below' },
]

export function WashingtonMap({ className }: WashingtonMapProps) {
  const mapboxUrl = buildMapboxUrl()
  return (
    <div
      aria-hidden
      className={cn(
        'pointer-events-none relative hidden aspect-square w-[600px] opacity-95 lg:block xl:w-[760px] 2xl:w-[920px]',
        className,
      )}
    >
      {/* Monochrome base. `streets-v12` inverted + grayscaled gives stark
          white-on-black with dense street typography. The `saturate(0)`
          belt-and-suspenders with `grayscale(1)` to kill any color
          contamination from streets-v12's more saturated palette.
          `opacity-50` dims the streets layer only — the SVG overlay is a
          sibling, so the orange pin/label chrome stays at full strength. */}
      <div
        className="absolute inset-0 bg-cover bg-center opacity-50"
        style={{
          backgroundImage: mapboxUrl ? `url('${mapboxUrl}')` : undefined,
          filter: 'invert(1) grayscale(1) saturate(0) contrast(1.1) brightness(0.88)',
        }}
      />

      {/* Edge fade + scanlines collapsed into a single div with two
          background layers. First listed = top of the layer stack
          (radial fade), second = below it (scanlines). Saves one
          compositing layer vs. two stacked divs. */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: [
            'radial-gradient(ellipse 50% 50% at 50% 50%, ' +
              'transparent 0%, transparent 18%, ' +
              'rgba(0,0,0,0.04) 32%, rgba(0,0,0,0.13) 44%, ' +
              'rgba(0,0,0,0.28) 56%, rgba(0,0,0,0.48) 68%, ' +
              'rgba(0,0,0,0.68) 78%, rgba(0,0,0,0.85) 88%, ' +
              'rgba(0,0,0,0.95) 95%, #000 100%)',
            'repeating-linear-gradient(0deg, ' +
              'transparent 0px, transparent 2px, ' +
              'rgba(0,0,0,0.32) 2px, rgba(0,0,0,0.32) 3px)',
          ].join(', '),
        }}
      />

      {/* SVG overlay — schematic layers (range arcs + Mall axis) under
          the pin set, so pins read on top. */}
      <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full">
        {/* Operational range arcs from Base of Operations. Three
            concentric dashed circles centered on the White House,
            fading outward to imply "signal strength" diminishing with
            distance. Anchors BoO as the visual gravity center. */}
        <g fill="none" strokeWidth="0.08" strokeDasharray="0.6 0.5">
          <circle
            cx={OVERLAY.baseOfOps.x}
            cy={OVERLAY.baseOfOps.y}
            r="6"
            stroke="rgba(255,140,30,0.22)"
          />
          <circle
            cx={OVERLAY.baseOfOps.x}
            cy={OVERLAY.baseOfOps.y}
            r="12"
            stroke="rgba(255,140,30,0.14)"
          />
          <circle
            cx={OVERLAY.baseOfOps.x}
            cy={OVERLAY.baseOfOps.y}
            r="19"
            stroke="rgba(255,140,30,0.08)"
          />
        </g>

        {/* National Mall axis — dashed hairline tracing the Mall's
            east-west spine from Lincoln to the Capitol. DC's single
            most recognizable feature, made legible at a glance. */}
        <line
          x1={OVERLAY.lincoln.x}
          y1={OVERLAY.lincoln.y}
          x2={OVERLAY.capitol.x}
          y2={OVERLAY.capitol.y}
          stroke="rgba(255,150,40,0.24)"
          strokeWidth="0.2"
          strokeDasharray="0.5 0.7"
          strokeLinecap="round"
        />

        {LANDMARKS.map((lm) => {
          const { x, y } = project(lm.lon, lm.lat)
          return <Pin key={lm.label} x={x} y={y} label={lm.label} pos={lm.pos} />
        })}
      </svg>
    </div>
  )
}

/**
 * A landmark pin — outlined ring + filled core + a tactical card label.
 *
 * Anatomy:
 *   - Inner core dot + outer hairline ring (single accent: rga-mod orange)
 *   - Short leader line from the ring edge outward toward the label
 *   - Dark backdrop card sized via mono char-width approximation
 *   - Hairline orange under-rule on the card (the only chrome)
 *   - Label text on top — no heavy halo; card handles legibility
 *
 * Mono-width math: monospace chars are ~0.6em wide. We approximate the
 * label box from `label.length` so the card sits accurately around the
 * text without needing a layout pass.
 */
function Pin({ x, y, label, pos }: { x: number; y: number; label: string; pos: LabelPos }) {
  const fontSize = 1.4
  const letterSpacing = 0.22
  // Width per glyph in mono = baseGlyph + letterSpacing.
  const glyphW = fontSize * 0.6 + letterSpacing
  const padX = 0.6
  const padY = 0.35
  const cardW = label.length * glyphW + padX * 2 - letterSpacing
  const cardH = fontSize + padY * 2

  // Geometry of pin + leader. Sized small for ambient feel — the map is
  // decorative background, not a labeled tactical display.
  const ringR = 0.5
  const leaderLen = 1.3
  const dir =
    pos === 'right'
      ? { dx: 1, dy: 0 }
      : pos === 'left'
        ? { dx: -1, dy: 0 }
        : pos === 'above'
          ? { dx: 0, dy: -1 }
          : { dx: 0, dy: 1 }

  // Leader: from just outside the ring to just before the card.
  const leaderStart = {
    x: x + dir.dx * (ringR + 0.15),
    y: y + dir.dy * (ringR + 0.15),
  }
  const leaderEnd = {
    x: x + dir.dx * (ringR + leaderLen),
    y: y + dir.dy * (ringR + leaderLen),
  }

  // Card position. For horizontal labels the card sits flush with the
  // leader end; for vertical it centers on the leader's x.
  const cardX =
    dir.dx > 0 ? leaderEnd.x : dir.dx < 0 ? leaderEnd.x - cardW : leaderEnd.x - cardW / 2
  const cardY =
    dir.dy > 0 ? leaderEnd.y : dir.dy < 0 ? leaderEnd.y - cardH : leaderEnd.y - cardH / 2

  // Text sits in the card with its baseline centered. textAnchor='start'
  // keeps letter-spacing stable across labels (no end-of-run drift).
  const textX = cardX + padX
  const textY = cardY + cardH / 2

  return (
    <g>
      {/* Leader line — barely-there hairline. Just enough to tie the
          card to the pin without competing with the rest of the hero. */}
      <line
        x1={leaderStart.x}
        y1={leaderStart.y}
        x2={leaderEnd.x}
        y2={leaderEnd.y}
        stroke="rgba(255,140,30,0.3)"
        strokeWidth="0.08"
        strokeLinecap="round"
      />

      {/* Pin dot — thin ring + small dim core. No glow, no halo. */}
      <circle
        cx={x}
        cy={y}
        r={ringR}
        fill="none"
        stroke="rgba(255,140,30,0.45)"
        strokeWidth="0.1"
      />
      <circle cx={x} cy={y} r={0.22} fill="rgba(255,160,50,0.7)" />

      {/* Card backdrop — solid-ish dark plate. Punches a quiet hole in
          the busy street substrate so the label reads at a glance. */}
      <rect x={cardX} y={cardY} width={cardW} height={cardH} fill="rgba(0,0,0,0.88)" />

      {/* Label text — warm amber, slightly brighter now that the
          backdrop gives it real contrast to land on. */}
      <text
        x={textX}
        y={textY}
        dominantBaseline="middle"
        textAnchor="start"
        fontSize={fontSize}
        fontFamily="ui-monospace, SFMono-Regular, Menlo, monospace"
        letterSpacing={letterSpacing}
        fontWeight="400"
        fill="rgba(255,180,90,0.85)"
      >
        {label}
      </text>
    </g>
  )
}
