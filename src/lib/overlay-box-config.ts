import type React from 'react'
import {
  AlertTriangle,
  Info,
  Table,
  StickyNote,
  Shield,
  Zap,
  Bell,
  type LucideIcon,
} from 'lucide-react'

// ─── Types ───────────────────────────────────────────────────────────────────

export type BoxColor = 'green' | 'cyan' | 'magenta' | 'orange' | 'red' | 'gray'
export type BoxIcon = 'none' | 'warning' | 'info' | 'table' | 'note' | 'shield' | 'zap' | 'alert'
export type BoxFontSize = 'sm' | 'md' | 'lg' | 'xl'
export type BoxBackground = 'none' | 'tint' | 'dark' | 'solid' | 'glass'
export type BoxTextAlign = 'left' | 'center' | 'right'

export interface OverlayBoxConfig {
  color: BoxColor
  badge: string
  icon: BoxIcon
  accent: boolean
  text: string
  flicker: boolean
  flickerSpeed: number // seconds per cycle, 0.5–10
  fontSize: BoxFontSize
  badgeSize: BoxFontSize
  textAlign: BoxTextAlign
  background: BoxBackground
  bgOpacity: number // 0–100
}

export const DEFAULT_CONFIG: OverlayBoxConfig = {
  color: 'cyan',
  badge: 'TABLE',
  icon: 'none',
  accent: false,
  text: '',
  flicker: false,
  flickerSpeed: 4,
  fontSize: 'md',
  badgeSize: 'sm',
  textAlign: 'left',
  background: 'none',
  bgOpacity: 100,
}

export const TEXT_ALIGN_KEYS: BoxTextAlign[] = ['left', 'center', 'right']

// ─── Background Definitions ──────────────────────────────────────────────────

export interface BoxBackgroundDef {
  label: string
  description: string
}

export const BACKGROUND_OPTIONS: Record<BoxBackground, BoxBackgroundDef> = {
  none: { label: 'None', description: 'Fully transparent' },
  tint: { label: 'Tint', description: 'Subtle color fill ~5%' },
  dark: { label: 'Dark', description: 'Semi-transparent dark' },
  solid: { label: 'Solid', description: 'Opaque dark fill' },
  glass: { label: 'Glass', description: 'Dark + backdrop blur' },
}

export const BACKGROUND_KEYS: BoxBackground[] = ['none', 'tint', 'dark', 'solid', 'glass']

/**
 * Returns inline CSS properties for the given background mode + color.
 * `opacity` is 0–100 and scales the background's alpha channel.
 */
export function getBackgroundStyle(
  bg: BoxBackground,
  colorKey: BoxColor,
  opacity: number,
): React.CSSProperties {
  if (bg === 'none') return {}

  const a = Math.max(0, Math.min(100, opacity)) / 100
  const c = BOX_COLORS[colorKey]

  switch (bg) {
    case 'tint': {
      // Parse the base rgba and rescale its alpha by `a`
      const baseAlpha = 0.06 * a
      const rgb = hexToRgb(c.hex)
      return { backgroundColor: `rgba(${rgb}, ${baseAlpha})` }
    }
    case 'dark':
      return { backgroundColor: `rgba(26, 26, 26, ${0.5 * a})` }
    case 'solid':
      return { backgroundColor: `rgba(10, 10, 10, ${a})` }
    case 'glass':
      return {
        backgroundColor: `rgba(3, 3, 3, ${0.9 * a})`,
        backdropFilter: 'blur(4px)',
        WebkitBackdropFilter: 'blur(4px)',
      }
  }
}

/** Convert hex like "#00FF41" to "0, 255, 65" */
function hexToRgb(hex: string): string {
  const h = hex.replace('#', '')
  const r = parseInt(h.substring(0, 2), 16)
  const g = parseInt(h.substring(2, 4), 16)
  const b = parseInt(h.substring(4, 6), 16)
  return `${r}, ${g}, ${b}`
}

// ─── Color Map ───────────────────────────────────────────────────────────────

export interface BoxColorDef {
  hex: string
  glow: string
  bg: string
}

export const BOX_COLORS: Record<BoxColor, BoxColorDef> = {
  green: {
    hex: '#00FF41',
    glow: 'rgba(0, 255, 65, 0.5)',
    bg: 'rgba(0, 255, 65, 0.06)',
  },
  cyan: {
    hex: '#00FFFF',
    glow: 'rgba(0, 255, 255, 0.5)',
    bg: 'rgba(0, 255, 255, 0.06)',
  },
  magenta: {
    hex: '#FF00FF',
    glow: 'rgba(255, 0, 255, 0.5)',
    bg: 'rgba(255, 0, 255, 0.06)',
  },
  orange: {
    hex: '#F97316',
    glow: 'rgba(249, 115, 22, 0.5)',
    bg: 'rgba(249, 115, 22, 0.06)',
  },
  red: {
    hex: '#EF4444',
    glow: 'rgba(239, 68, 68, 0.5)',
    bg: 'rgba(239, 68, 68, 0.06)',
  },
  gray: {
    hex: '#888888',
    glow: 'rgba(136, 136, 136, 0.3)',
    bg: 'rgba(136, 136, 136, 0.04)',
  },
}

// ─── Icon Map ────────────────────────────────────────────────────────────────

export const ICON_MAP: Record<Exclude<BoxIcon, 'none'>, LucideIcon> = {
  warning: AlertTriangle,
  info: Info,
  table: Table,
  note: StickyNote,
  shield: Shield,
  zap: Zap,
  alert: Bell,
}

export const ICON_KEYS: BoxIcon[] = ['none', 'warning', 'info', 'table', 'note', 'shield', 'zap', 'alert']

// ─── Font Size Map ───────────────────────────────────────────────────────────

export const FONT_SIZE_MAP: Record<BoxFontSize, string> = {
  sm: 'text-sm',
  md: 'text-base',
  lg: 'text-lg',
  xl: 'text-xl',
}

/** Badge font size in px + matching icon size */
export const BADGE_SIZE_MAP: Record<BoxFontSize, { fontSize: number; iconSize: number }> = {
  sm: { fontSize: 11, iconSize: 13 },
  md: { fontSize: 14, iconSize: 16 },
  lg: { fontSize: 18, iconSize: 20 },
  xl: { fontSize: 22, iconSize: 24 },
}

// ─── Flicker Keyframes ───────────────────────────────────────────────────────

/**
 * The original burst events as [absoluteSeconds, opacity] pairs.
 * The burst pattern always takes ~3.44s of real time.
 * flickerSpeed controls total cycle length — extra time is idle (opacity: 1).
 */
const FLICKER_EVENTS: [number, number][] = [
  [0, 1],
  [0.16, 0.9], [0.24, 1], [0.28, 0.4], [0.32, 1],
  [1.92, 1], [2.0, 0.7], [2.08, 1], [2.12, 0.3], [2.16, 1],
  [3.28, 1], [3.32, 0.5], [3.36, 1], [3.4, 0.6], [3.44, 1],
]

/** Generate @keyframes CSS where burst timing is fixed, idle gap scales with duration */
export function generateFlickerKeyframes(name: string, duration: number): string {
  const lines = FLICKER_EVENTS.map(([t, opacity]) => {
    const pct = Math.min((t / duration) * 100, 100).toFixed(2)
    return `${pct}% { opacity: ${opacity}; }`
  })
  lines.push('100% { opacity: 1; }')
  return `@keyframes ${name} { ${lines.join(' ')} }`
}

// ─── Encode / Decode ─────────────────────────────────────────────────────────

export function encodeBoxConfig(config: OverlayBoxConfig): string {
  const json = JSON.stringify(config)
  const b64 = btoa(json)
  return b64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

export function decodeBoxConfig(encoded: string): OverlayBoxConfig {
  try {
    let b64 = encoded.replace(/-/g, '+').replace(/_/g, '/')
    // Re-add padding
    while (b64.length % 4) b64 += '='
    const json = atob(b64)
    const parsed = JSON.parse(json)

    // Validate and merge with defaults
    return {
      color: isValidColor(parsed.color) ? parsed.color : DEFAULT_CONFIG.color,
      badge: typeof parsed.badge === 'string' ? parsed.badge : DEFAULT_CONFIG.badge,
      icon: isValidIcon(parsed.icon) ? parsed.icon : DEFAULT_CONFIG.icon,
      accent: typeof parsed.accent === 'boolean' ? parsed.accent : DEFAULT_CONFIG.accent,
      text: typeof parsed.text === 'string' ? parsed.text : DEFAULT_CONFIG.text,
      flicker: typeof parsed.flicker === 'boolean' ? parsed.flicker : DEFAULT_CONFIG.flicker,
      flickerSpeed: isValidFlickerSpeed(parsed.flickerSpeed) ? parsed.flickerSpeed : DEFAULT_CONFIG.flickerSpeed,
      fontSize: isValidFontSize(parsed.fontSize) ? parsed.fontSize : DEFAULT_CONFIG.fontSize,
      badgeSize: isValidFontSize(parsed.badgeSize) ? parsed.badgeSize : DEFAULT_CONFIG.badgeSize,
      textAlign: isValidTextAlign(parsed.textAlign) ? parsed.textAlign : DEFAULT_CONFIG.textAlign,
      background: isValidBackground(parsed.background) ? parsed.background : DEFAULT_CONFIG.background,
      bgOpacity: isValidOpacity(parsed.bgOpacity) ? parsed.bgOpacity : DEFAULT_CONFIG.bgOpacity,
    }
  } catch {
    return { ...DEFAULT_CONFIG }
  }
}

export function extractConfigFromUrl(url: string): OverlayBoxConfig {
  try {
    const u = new URL(url)
    const c = u.searchParams.get('c')
    if (!c) return { ...DEFAULT_CONFIG }
    return decodeBoxConfig(c)
  } catch {
    return { ...DEFAULT_CONFIG }
  }
}

// ─── Validation Helpers ──────────────────────────────────────────────────────

const VALID_COLORS: BoxColor[] = ['green', 'cyan', 'magenta', 'orange', 'red', 'gray']
const VALID_ICONS: BoxIcon[] = ['none', 'warning', 'info', 'table', 'note', 'shield', 'zap', 'alert']
const VALID_FONT_SIZES: BoxFontSize[] = ['sm', 'md', 'lg', 'xl']
const VALID_BACKGROUNDS: BoxBackground[] = ['none', 'tint', 'dark', 'solid', 'glass']
const VALID_TEXT_ALIGNS: BoxTextAlign[] = ['left', 'center', 'right']

function isValidColor(v: unknown): v is BoxColor {
  return typeof v === 'string' && VALID_COLORS.includes(v as BoxColor)
}

function isValidIcon(v: unknown): v is BoxIcon {
  return typeof v === 'string' && VALID_ICONS.includes(v as BoxIcon)
}

function isValidFontSize(v: unknown): v is BoxFontSize {
  return typeof v === 'string' && VALID_FONT_SIZES.includes(v as BoxFontSize)
}

function isValidBackground(v: unknown): v is BoxBackground {
  return typeof v === 'string' && VALID_BACKGROUNDS.includes(v as BoxBackground)
}

function isValidTextAlign(v: unknown): v is BoxTextAlign {
  return typeof v === 'string' && VALID_TEXT_ALIGNS.includes(v as BoxTextAlign)
}

function isValidOpacity(v: unknown): v is number {
  return typeof v === 'number' && v >= 0 && v <= 100
}

function isValidFlickerSpeed(v: unknown): v is number {
  return typeof v === 'number' && v >= 4 && v <= 30
}
