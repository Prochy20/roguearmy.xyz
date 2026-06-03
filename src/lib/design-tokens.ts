/**
 * RGA brand design tokens — canonical source of truth.
 * Consumed by both /brand (Next.js route) and Storybook MDX docs.
 */

export interface ColorSwatch {
  name: string
  hex: string
  tailwind: string
  glow?: boolean
}

export const BRAND_COLORS: ColorSwatch[] = [
  { name: 'Green', hex: '#00FF41', tailwind: 'rga-green', glow: true },
  { name: 'Cyan', hex: '#00FFFF', tailwind: 'rga-cyan', glow: true },
  { name: 'Magenta', hex: '#FF00FF', tailwind: 'rga-magenta', glow: true },
]

/**
 * Extended raw palette — tokens beyond the historical green/cyan/magenta
 * trio. Power game brands (D2 orange), status messaging (warn yellow,
 * error rose), and staff role accents (dev chartreuse). Same hex may
 * back multiple Layer 2 aliases — see SEMANTIC_TOKENS below.
 */
export const EXTENDED_PALETTE: ColorSwatch[] = [
  { name: 'Orange', hex: '#FF8000', tailwind: 'rga-orange', glow: true },
  { name: 'Chartreuse', hex: '#CCFF00', tailwind: 'rga-chartreuse', glow: true },
  { name: 'Yellow', hex: '#FFE100', tailwind: 'rga-yellow', glow: true },
  { name: 'Rose', hex: '#FF0066', tailwind: 'rga-rose', glow: true },
]

export const BG_COLORS: ColorSwatch[] = [
  { name: 'Void', hex: '#030303', tailwind: 'void' },
  { name: 'Primary', hex: '#0A0A0A', tailwind: 'bg-primary' },
  { name: 'Elevated', hex: '#111111', tailwind: 'bg-elevated' },
  { name: 'Surface', hex: '#1A1A1A', tailwind: 'bg-surface' },
]

export const TEXT_COLORS: ColorSwatch[] = [
  { name: 'Primary', hex: '#FFFFFF', tailwind: 'text-primary' },
  { name: 'Secondary', hex: '#888888', tailwind: 'text-secondary' },
  { name: 'Muted', hex: '#555555', tailwind: 'text-muted' },
]

export const GLOW_COLORS: ColorSwatch[] = [
  { name: 'Glow Green', hex: 'rgba(0,255,65,0.5)', tailwind: 'glow-green' },
  { name: 'Glow Cyan', hex: 'rgba(0,255,255,0.5)', tailwind: 'glow-cyan' },
  { name: 'Glow Magenta', hex: 'rgba(255,0,255,0.5)', tailwind: 'glow-magenta' },
  { name: 'Glow Orange', hex: 'rgba(255,128,0,0.5)', tailwind: 'glow-orange' },
  { name: 'Glow Yellow', hex: 'rgba(255,225,0,0.5)', tailwind: 'glow-yellow' },
  { name: 'Glow Rose', hex: 'rgba(255,0,102,0.5)', tailwind: 'glow-rose' },
  { name: 'Glow Chartreuse', hex: 'rgba(204,255,0,0.5)', tailwind: 'glow-chartreuse' },
]

/**
 * Layer 2 semantic aliases. Components should prefer these over raw rga-*
 * tokens whenever a semantic name exists — `text-status-warn` mluví za
 * sebe, `text-rga-yellow` ne. Same hex may back multiple aliases
 * intentionally (e.g. role-mod and game-d2 both resolve to orange) because
 * the surfaces don't coexist on a single screen.
 */
export interface SemanticAlias {
  alias: string
  layer1: string
  hex: string
  purpose: string
}

export const SEMANTIC_TOKENS: SemanticAlias[] = [
  {
    alias: 'brand',
    layer1: 'rga-green',
    hex: '#00FF41',
    purpose: 'RGA identity — logo, primary CTAs, selection, scrollbar.',
  },
  {
    alias: 'status-ok',
    layer1: 'rga-green',
    hex: '#00FF41',
    purpose: 'Active OK status. Pairs with status-info as the muted default.',
  },
  {
    alias: 'status-warn',
    layer1: 'rga-yellow',
    hex: '#FFE100',
    purpose: 'Soft attention — STALE data, MEMBERS-ONLY gates, hazard warnings.',
  },
  {
    alias: 'status-error',
    layer1: 'rga-rose',
    hex: '#FF0066',
    purpose: 'Hard failure — LOCKED, OFFLINE, broken data.',
  },
  {
    alias: 'status-info',
    layer1: '(muted gray)',
    hex: 'oklch(0.65 0 0)',
    purpose: 'Default pill state — TODAY, VIEWING, LIVE, PUBLIC. Muted, no pulse.',
  },
  {
    alias: 'game-d2',
    layer1: 'rga-orange',
    hex: '#FF8000',
    purpose: 'Division 2 body content brand — page titles, mission rows, intel feeds.',
  },
  {
    alias: 'role-dev',
    layer1: 'rga-chartreuse',
    hex: '#CCFF00',
    purpose: 'Staff Developer role accent on /community/staff cards. Only use here.',
  },
  {
    alias: 'role-mod',
    layer1: 'rga-orange',
    hex: '#FF8000',
    purpose: 'Staff Moderator role accent. Same hex as game-d2 (different surfaces).',
  },
  {
    alias: 'role-admin',
    layer1: 'rga-rose',
    hex: '#FF0066',
    purpose: 'Staff Admin role accent. Same hex as status-error (different surfaces).',
  },
]

/**
 * Status pill modes used in chrome (StatRibbon). Renders one of three modes:
 * `info` (muted, static dot — the default when nothing's wrong), `warn`
 * (yellow + pulse — attention but data exists), `error` (rose + pulse —
 * something broken). Magenta is no longer used for failure — it's
 * reserved for decorative chromatic effects.
 */
export interface StatusPillMode {
  mode: 'info' | 'warn' | 'error'
  example: string
  textClass: string
  dotClass: string
  description: string
}

export const STATUS_PILL_MODES: StatusPillMode[] = [
  {
    mode: 'info',
    example: 'VIEWING',
    textClass: 'text-text-secondary',
    dotClass: 'bg-text-secondary',
    description:
      'Default state. Anything routine — TODAY, VIEWING, LIVE, ONLINE, PUBLIC, RECRUITING. No pulse, muted gray.',
  },
  {
    mode: 'warn',
    example: 'STALE',
    textClass: 'text-rga-yellow',
    dotClass: 'bg-rga-yellow shadow-[0_0_8px_#FFE100] animate-pulse',
    description:
      'Soft attention. Data exists but you should know — STALE, MEMBERS-ONLY, freshness lag. Yellow pulse.',
  },
  {
    mode: 'error',
    example: 'LOCKED',
    textClass: 'text-status-error',
    dotClass: 'bg-status-error shadow-[0_0_8px_#FF0066] animate-pulse',
    description:
      'Hard failure. Content gone or unreachable — LOCKED, OFFLINE, ERROR. Rose pulse.',
  },
]

export interface TypeSpec {
  label: string
  classes: string
  sample: string
}

export const TYPE_SCALE: TypeSpec[] = [
  { label: 'H1', classes: 'font-display text-5xl md:text-6xl uppercase', sample: 'ROGUE ARMY' },
  { label: 'H2', classes: 'font-display text-3xl md:text-4xl uppercase', sample: 'SECTION TITLE' },
  { label: 'H3', classes: 'font-display text-xl md:text-2xl uppercase', sample: 'SUB HEADING' },
  {
    label: 'Body',
    classes: 'font-body text-base',
    sample:
      'The quick brown fox jumps over the lazy dog. Rogue Army is a gaming community with cyberpunk aesthetics.',
  },
  {
    label: 'Small',
    classes: 'font-body text-sm text-text-secondary',
    sample: 'Secondary text for supporting information and metadata.',
  },
  { label: 'Mono', classes: 'font-mono text-sm', sample: '> system.init() // terminal output' },
]

export interface GradientSpec {
  name: string
  classes: string
  description: string
}

export const GRADIENTS: GradientSpec[] = [
  {
    name: 'Brand Gradient',
    classes: 'bg-linear-to-r from-rga-green via-rga-cyan to-rga-magenta',
    description:
      'The full RGA spectrum. Use for primary CTAs, hero accents, and major brand moments. This is the most impactful gradient — use it sparingly to maintain its effect.',
  },
  {
    name: 'Green → Cyan',
    classes: 'bg-linear-to-r from-rga-green to-rga-cyan',
    description:
      'The primary accent pair. Use for secondary UI elements, progress bars, and data visualizations. Feels technical and clean.',
  },
  {
    name: 'Cyan → Magenta',
    classes: 'bg-linear-to-r from-rga-cyan to-rga-magenta',
    description:
      'The neon accent pair. Works well for hover states, notifications, and decorative lines. Has a more energetic, cyberpunk feel.',
  },
  {
    name: 'Green → Magenta',
    classes: 'bg-linear-to-r from-rga-green to-rga-magenta',
    description:
      'High contrast pair. Use for alerts, important badges, or when you need maximum visual tension. The complementary colors create strong energy.',
  },
]

export const RADIAL_HERO_BACKGROUND = `
  radial-gradient(ellipse 80% 50% at 50% 50%, rgba(0,255,65,0.15) 0%, transparent 50%),
  radial-gradient(ellipse 60% 40% at 80% 80%, rgba(0,255,255,0.10) 0%, transparent 40%),
  radial-gradient(ellipse 40% 30% at 20% 20%, rgba(255,0,255,0.08) 0%, transparent 40%),
  #030303
`

export interface FontSpec {
  family: string
  tailwindClass: string
  role: string
  weights: string
  downloadHref: string
  downloadLabel: string
  external?: boolean
}

export const FONTS: FontSpec[] = [
  {
    family: 'Hanson Bold',
    tailwindClass: 'font-display',
    role: 'Display — headings, hero text, brand moments. Always UPPERCASE.',
    weights: '700',
    downloadHref: '/fonts/Hanson-Bold.otf',
    downloadLabel: 'Download Hanson-Bold.otf',
  },
  {
    family: 'Outfit',
    tailwindClass: 'font-body',
    role: 'Body — paragraphs, descriptions, UI labels, navigation.',
    weights: '300, 400, 500, 600, 700',
    downloadHref: 'https://fonts.google.com/specimen/Outfit',
    downloadLabel: 'Get on Google Fonts',
    external: true,
  },
  {
    family: 'JetBrains Mono',
    tailwindClass: 'font-mono',
    role: 'Monospace — terminal output, code, tags, metadata, timestamps.',
    weights: '400, 500, 700',
    downloadHref: 'https://fonts.google.com/specimen/JetBrains+Mono',
    downloadLabel: 'Get on Google Fonts',
    external: true,
  },
]

export interface BackgroundImage {
  file: string
  name: string
}

export const BACKGROUND_IMAGES: BackgroundImage[] = [
  { file: 'Bg_01.jpg', name: 'Background 01' },
  { file: 'Bg_02.jpg', name: 'Background 02' },
  { file: 'Bg_03.jpg', name: 'Background 03' },
  { file: 'Bg_04.jpg', name: 'Background 04' },
  { file: 'Bg_05.jpg', name: 'Background 05' },
]

export interface BrandSection {
  num: string
  label: string
  desc: string
}

export const BRAND_SECTIONS: BrandSection[] = [
  { num: '01', label: 'Logo', desc: 'Usage rules, clear space, minimum sizes, do’s & don’ts' },
  { num: '02', label: 'Colors', desc: 'Brand palette, backgrounds, text hierarchy, glow values' },
  { num: '03', label: 'Typography', desc: 'Typefaces, weights, scale, downloadable font files' },
  { num: '04', label: 'Gradients & Backgrounds', desc: 'Linear & radial gradients, cinematic background images' },
  { num: '05', label: 'Effects', desc: 'Glows, glitch, chromatic aberration, noise — when & how' },
  { num: '06', label: 'Components', desc: 'Buttons, corners, tags — pre-built UI building blocks' },
]
