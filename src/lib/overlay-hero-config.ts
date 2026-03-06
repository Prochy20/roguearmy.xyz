// ─── Types ───────────────────────────────────────────────────────────────────

export type HeroTextColor = 'white' | 'green' | 'cyan' | 'magenta'
export type HeroTextAnchor = 'left' | 'center' | 'right'
export type HeroBgKey = 'none' | 'Bg_01' | 'Bg_02' | 'Bg_03' | 'Bg_04' | 'Bg_05'

export interface HeroTextLayer {
  id: string
  content: string
  x: number // 0–100 percent
  y: number // 0–100 percent
  size: number // px, 16–300
  color: HeroTextColor
  anchor: HeroTextAnchor // horizontal alignment origin
  flicker: boolean
  flickerMin: number // seconds between glitches (min)
  flickerMax: number // seconds between glitches (max)
  flickerIntensity: number // 1–10
}

export interface HeroLogoLayer {
  enabled: boolean
  x: number // 0–100 percent
  y: number // 0–100 percent
  size: number // percent of container width, 2–60
  flicker: boolean
  flickerMin: number
  flickerMax: number
  flickerIntensity: number
}

export type HeroParagraphAlign = 'left' | 'center' | 'right'

export interface HeroParagraphLayer {
  id: string
  content: string // multiline
  x: number // 0–100 percent
  y: number // 0–100 percent
  size: number // px, 12–72
  color: HeroTextColor
  align: HeroParagraphAlign
  maxWidth: number // 10–100 percent of container
}

export interface HeroOverlayConfig {
  bg: HeroBgKey
  bgTransparent: boolean // true = transparent base, false = solid black
  bgOpacity: number // 0–100, image opacity (lower = darker tint)
  texts: HeroTextLayer[]
  paragraphs: HeroParagraphLayer[]
  logo: HeroLogoLayer
}

// ─── Constants ───────────────────────────────────────────────────────────────

export const BG_KEYS: HeroBgKey[] = ['none', 'Bg_01', 'Bg_02', 'Bg_03', 'Bg_04', 'Bg_05']

export const TEXT_COLOR_MAP: Record<HeroTextColor, { hex: string; glow: string }> = {
  white: { hex: '#FFFFFF', glow: 'rgba(255, 255, 255, 0.3)' },
  green: { hex: '#00FF41', glow: 'rgba(0, 255, 65, 0.5)' },
  cyan: { hex: '#00FFFF', glow: 'rgba(0, 255, 255, 0.5)' },
  magenta: { hex: '#FF00FF', glow: 'rgba(255, 0, 255, 0.5)' },
}

export const TEXT_COLOR_KEYS: HeroTextColor[] = ['white', 'green', 'cyan', 'magenta']
export const TEXT_ANCHOR_KEYS: HeroTextAnchor[] = ['left', 'center', 'right']
export const PARAGRAPH_ALIGN_KEYS: HeroParagraphAlign[] = ['left', 'center', 'right']

/** CSS transform for each anchor mode (vertical always centered) */
export const ANCHOR_TRANSFORM: Record<HeroTextAnchor, string> = {
  left: 'translate(0, -50%)',
  center: 'translate(-50%, -50%)',
  right: 'translate(-100%, -50%)',
}

// ─── Defaults ────────────────────────────────────────────────────────────────

let layerCounter = 0

export function createTextLayer(partial?: Partial<HeroTextLayer>): HeroTextLayer {
  return {
    id: `t${Date.now()}_${layerCounter++}`,
    content: 'ROGUE ARMY',
    x: 50,
    y: 50,
    size: 80,
    color: 'white',
    anchor: 'center',
    flicker: false,
    flickerMin: 4,
    flickerMax: 10,
    flickerIntensity: 7,
    ...partial,
  }
}

export function createParagraphLayer(partial?: Partial<HeroParagraphLayer>): HeroParagraphLayer {
  return {
    id: `p${Date.now()}_${layerCounter++}`,
    content: 'Paragraph text here',
    x: 50,
    y: 70,
    size: 24,
    color: 'white',
    align: 'left',
    maxWidth: 50,
    ...partial,
  }
}

export const DEFAULT_CONFIG: HeroOverlayConfig = {
  bg: 'Bg_01',
  bgTransparent: false,
  bgOpacity: 50,
  texts: [
    createTextLayer({ content: 'ROGUE ARMY', x: 50, y: 50, size: 80, color: 'green', anchor: 'center', flicker: true }),
    createTextLayer({ content: 'We are the', x: 50, y: 41, size: 40, color: 'white', anchor: 'center', flicker: true }),
  ],
  paragraphs: [
    createParagraphLayer({ content: 'www.roguearmy.xyz', x: 50, y: 55, size: 24, color: 'cyan', align: 'center', maxWidth: 50 }),
  ],
  logo: {
    enabled: true,
    x: 50,
    y: 27,
    size: 15,
    flicker: true,
    flickerMin: 4,
    flickerMax: 10,
    flickerIntensity: 7,
  },
}

// ─── Encode / Decode ─────────────────────────────────────────────────────────

export function encodeHeroConfig(config: HeroOverlayConfig): string {
  const json = JSON.stringify(config)
  const b64 = btoa(json)
  return b64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

export function decodeHeroConfig(encoded: string): HeroOverlayConfig {
  try {
    let b64 = encoded.replace(/-/g, '+').replace(/_/g, '/')
    while (b64.length % 4) b64 += '='
    const json = atob(b64)
    const parsed = JSON.parse(json)

    return {
      bg: isValidBg(parsed.bg) ? parsed.bg : DEFAULT_CONFIG.bg,
      bgTransparent: typeof parsed.bgTransparent === 'boolean' ? parsed.bgTransparent : false,
      bgOpacity: clamp(parsed.bgOpacity, 0, 100, 100),
      texts: Array.isArray(parsed.texts)
        ? parsed.texts.map(validateTextLayer).filter(Boolean) as HeroTextLayer[]
        : [...DEFAULT_CONFIG.texts],
      paragraphs: Array.isArray(parsed.paragraphs)
        ? parsed.paragraphs.map(validateParagraphLayer).filter(Boolean) as HeroParagraphLayer[]
        : [],
      logo: validateLogoLayer(parsed.logo) ?? { ...DEFAULT_CONFIG.logo },
    }
  } catch {
    return structuredClone(DEFAULT_CONFIG)
  }
}

export function extractHeroConfigFromUrl(url: string): HeroOverlayConfig {
  try {
    const u = new URL(url)
    const c = u.searchParams.get('c')
    if (!c) return structuredClone(DEFAULT_CONFIG)
    return decodeHeroConfig(c)
  } catch {
    return structuredClone(DEFAULT_CONFIG)
  }
}

// ─── Validation ──────────────────────────────────────────────────────────────

const VALID_BGS: HeroBgKey[] = ['none', 'Bg_01', 'Bg_02', 'Bg_03', 'Bg_04', 'Bg_05']
const VALID_COLORS: HeroTextColor[] = ['white', 'green', 'cyan', 'magenta']
const VALID_ANCHORS: HeroTextAnchor[] = ['left', 'center', 'right']

function isValidBg(v: unknown): v is HeroBgKey {
  return typeof v === 'string' && VALID_BGS.includes(v as HeroBgKey)
}

function clamp(v: unknown, min: number, max: number, fallback: number): number {
  if (typeof v !== 'number' || !isFinite(v)) return fallback
  return Math.max(min, Math.min(max, v))
}

function validateTextLayer(v: unknown): HeroTextLayer | null {
  if (!v || typeof v !== 'object') return null
  const t = v as Record<string, unknown>
  return {
    id: typeof t.id === 'string' ? t.id : `t${Date.now()}_${layerCounter++}`,
    content: typeof t.content === 'string' ? t.content : 'TEXT',
    x: clamp(t.x, 0, 100, 50),
    y: clamp(t.y, 0, 100, 50),
    size: clamp(t.size, 16, 300, 80),
    color: typeof t.color === 'string' && VALID_COLORS.includes(t.color as HeroTextColor)
      ? (t.color as HeroTextColor)
      : 'white',
    anchor: typeof t.anchor === 'string' && VALID_ANCHORS.includes(t.anchor as HeroTextAnchor)
      ? (t.anchor as HeroTextAnchor)
      : 'center',
    flicker: typeof t.flicker === 'boolean' ? t.flicker : false,
    flickerMin: clamp(t.flickerMin, 1, 30, 4),
    flickerMax: clamp(t.flickerMax, 1, 30, 10),
    flickerIntensity: clamp(t.flickerIntensity, 1, 10, 7),
  }
}

const VALID_ALIGNS: HeroParagraphAlign[] = ['left', 'center', 'right']

function validateParagraphLayer(v: unknown): HeroParagraphLayer | null {
  if (!v || typeof v !== 'object') return null
  const p = v as Record<string, unknown>
  return {
    id: typeof p.id === 'string' ? p.id : `p${Date.now()}_${layerCounter++}`,
    content: typeof p.content === 'string' ? p.content : 'Text',
    x: clamp(p.x, 0, 100, 50),
    y: clamp(p.y, 0, 100, 50),
    size: clamp(p.size, 12, 72, 24),
    color: typeof p.color === 'string' && VALID_COLORS.includes(p.color as HeroTextColor)
      ? (p.color as HeroTextColor)
      : 'white',
    align: typeof p.align === 'string' && VALID_ALIGNS.includes(p.align as HeroParagraphAlign)
      ? (p.align as HeroParagraphAlign)
      : 'left',
    maxWidth: clamp(p.maxWidth, 10, 100, 50),
  }
}

function validateLogoLayer(v: unknown): HeroLogoLayer | null {
  if (!v || typeof v !== 'object') return null
  const l = v as Record<string, unknown>
  return {
    enabled: typeof l.enabled === 'boolean' ? l.enabled : false,
    x: clamp(l.x, 0, 100, 50),
    y: clamp(l.y, 0, 100, 50),
    size: clamp(l.size, 2, 60, 15),
    flicker: typeof l.flicker === 'boolean' ? l.flicker : false,
    flickerMin: clamp(l.flickerMin, 1, 30, 4),
    flickerMax: clamp(l.flickerMax, 1, 30, 10),
    flickerIntensity: clamp(l.flickerIntensity, 1, 10, 7),
  }
}
