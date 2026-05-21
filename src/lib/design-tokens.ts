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
