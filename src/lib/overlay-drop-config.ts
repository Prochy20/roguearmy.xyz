// ─── Types ───────────────────────────────────────────────────────────────────

export type DropSize = 'sm' | 'md' | 'lg'
export type Rarity = 'common' | 'rare' | 'epic' | 'legendary' | 'gearset' | 'exotic'
export type Franchise = 'division2' | 'generic'

export interface OverlayDropConfig {
  channel: string
  command: string
  cooldown: number       // Global cooldown 0-30s
  userCooldown: number   // Per-user cooldown 0-60s
  modOnly: boolean
  showUsernames: boolean
  dropSpeed: number      // Fall duration 1-5s
  beamDuration: number   // Beam visibility 1-8s
  particleCount: number  // Burst particles 5-30
  maxActiveDrops: number // Concurrent limit 1-20
  dropSize: DropSize
  textSize: DropSize     // Rarity label + username text size
  franchise: Franchise   // 'division2' = real item names, 'generic' = rarity labels only
}

export const DEFAULT_CONFIG: OverlayDropConfig = {
  channel: '',
  command: '!drop',
  cooldown: 2,
  userCooldown: 5,
  modOnly: false,
  showUsernames: true,
  dropSpeed: 2,
  beamDuration: 3,
  particleCount: 15,
  maxActiveDrops: 8,
  dropSize: 'md',
  textSize: 'md',
  franchise: 'division2',
}

// ─── Rarity System ──────────────────────────────────────────────────────────

// ─── Generic rarity colors & labels ─────────────────────────────────────────

const GENERIC_COLORS: Record<Rarity, string> = {
  common: '#4ADE80',
  rare: '#60A5FA',
  epic: '#C084FC',
  legendary: '#F59E0B',
  gearset: '#2DD4BF',
  exotic: '#22D3EE',
}

const GENERIC_LABELS: Record<Rarity, string> = {
  common: 'COMMON',
  rare: 'RARE',
  epic: 'EPIC',
  legendary: 'LEGENDARY',
  gearset: 'GEAR SET',
  exotic: 'EXOTIC',
}

// ─── Division 2 rarity colors & labels ──────────────────────────────────────

const DIV2_COLORS: Record<Rarity, string> = {
  common: '#4ADE80',     // Standard — green
  rare: '#60A5FA',       // Specialized — blue
  epic: '#C084FC',       // Superior — purple
  legendary: '#F97316',  // High-End — orange
  gearset: '#2DD4BF',   // Gear Set — teal
  exotic: '#EF4444',     // Exotic — red/orange
}

const DIV2_LABELS: Record<Rarity, string> = {
  common: 'STANDARD',
  rare: 'SPECIALIZED',
  epic: 'SUPERIOR',
  legendary: 'HIGH-END',
  gearset: 'GEAR SET',
  exotic: 'EXOTIC',
}

// ─── Franchise-aware accessors ──────────────────────────────────────────────

export function getRarityColors(franchise: Franchise): Record<Rarity, string> {
  return franchise === 'division2' ? DIV2_COLORS : GENERIC_COLORS
}

export function getRarityLabels(franchise: Franchise): Record<Rarity, string> {
  return franchise === 'division2' ? DIV2_LABELS : GENERIC_LABELS
}

/** Backwards-compat default exports (generic) */
export const RARITY_COLORS = GENERIC_COLORS
export const RARITY_LABELS = GENERIC_LABELS

/** Weighted odds: common 45, rare 25, epic 14, legendary 8, gearset 6, exotic 2 */
export const RARITY_WEIGHTS: { rarity: Rarity; weight: number }[] = [
  { rarity: 'common', weight: 45 },
  { rarity: 'rare', weight: 25 },
  { rarity: 'epic', weight: 14 },
  { rarity: 'legendary', weight: 8 },
  { rarity: 'gearset', weight: 6 },
  { rarity: 'exotic', weight: 2 },
]

const TOTAL_WEIGHT = RARITY_WEIGHTS.reduce((sum, r) => sum + r.weight, 0)

export function rollRarity(): Rarity {
  let roll = Math.random() * TOTAL_WEIGHT
  for (const { rarity, weight } of RARITY_WEIGHTS) {
    roll -= weight
    if (roll <= 0) return rarity
  }
  return 'common'
}

// ─── Drop Size Map ──────────────────────────────────────────────────────────

/** Orb diameter in px for each size tier */
export const DROP_SIZE_MAP: Record<DropSize, number> = {
  sm: 16,
  md: 24,
  lg: 36,
}

export const DROP_SIZE_KEYS: DropSize[] = ['sm', 'md', 'lg']

export const FRANCHISE_KEYS: Franchise[] = ['division2', 'generic']

export const FRANCHISE_LABELS: Record<Franchise, string> = {
  division2: 'Division 2',
  generic: 'Generic',
}

/** Text sizes in px for rarity label / username */
export const TEXT_SIZE_MAP: Record<DropSize, { label: number; username: number }> = {
  sm: { label: 10, username: 8 },
  md: { label: 14, username: 11 },
  lg: { label: 20, username: 14 },
}

// ─── Encode / Decode ─────────────────────────────────────────────────────────

export function encodeDropConfig(config: OverlayDropConfig): string {
  const json = JSON.stringify(config)
  // UTF-8-safe base64
  const bytes = new TextEncoder().encode(json)
  const b64 = btoa(String.fromCharCode(...bytes))
  return b64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

export function decodeDropConfig(encoded: string): OverlayDropConfig {
  try {
    let b64 = encoded.replace(/-/g, '+').replace(/_/g, '/')
    while (b64.length % 4) b64 += '='
    const binary = atob(b64)
    const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0))
    const json = new TextDecoder().decode(bytes)
    const parsed = JSON.parse(json)

    return {
      channel: typeof parsed.channel === 'string' ? parsed.channel : DEFAULT_CONFIG.channel,
      command: typeof parsed.command === 'string' ? parsed.command : DEFAULT_CONFIG.command,
      cooldown: isInRange(parsed.cooldown, 0, 30) ? parsed.cooldown : DEFAULT_CONFIG.cooldown,
      userCooldown: isInRange(parsed.userCooldown, 0, 60) ? parsed.userCooldown : DEFAULT_CONFIG.userCooldown,
      modOnly: typeof parsed.modOnly === 'boolean' ? parsed.modOnly : DEFAULT_CONFIG.modOnly,
      showUsernames: typeof parsed.showUsernames === 'boolean' ? parsed.showUsernames : DEFAULT_CONFIG.showUsernames,
      dropSpeed: isInRange(parsed.dropSpeed, 1, 5) ? parsed.dropSpeed : DEFAULT_CONFIG.dropSpeed,
      beamDuration: isInRange(parsed.beamDuration, 1, 8) ? parsed.beamDuration : DEFAULT_CONFIG.beamDuration,
      particleCount: isInRange(parsed.particleCount, 5, 30) ? parsed.particleCount : DEFAULT_CONFIG.particleCount,
      maxActiveDrops: isInRange(parsed.maxActiveDrops, 1, 20) ? parsed.maxActiveDrops : DEFAULT_CONFIG.maxActiveDrops,
      dropSize: isValidDropSize(parsed.dropSize) ? parsed.dropSize : DEFAULT_CONFIG.dropSize,
      textSize: isValidDropSize(parsed.textSize) ? parsed.textSize : DEFAULT_CONFIG.textSize,
      franchise: isValidFranchise(parsed.franchise) ? parsed.franchise : DEFAULT_CONFIG.franchise,
    }
  } catch {
    return { ...DEFAULT_CONFIG }
  }
}

export function extractDropConfigFromUrl(url: string): OverlayDropConfig {
  try {
    const u = new URL(url)
    const c = u.searchParams.get('c')
    if (!c) return { ...DEFAULT_CONFIG }
    return decodeDropConfig(c)
  } catch {
    return { ...DEFAULT_CONFIG }
  }
}

// ─── Validation Helpers ──────────────────────────────────────────────────────

function isInRange(v: unknown, min: number, max: number): v is number {
  return typeof v === 'number' && v >= min && v <= max
}

const VALID_DROP_SIZES: DropSize[] = ['sm', 'md', 'lg']

function isValidDropSize(v: unknown): v is DropSize {
  return typeof v === 'string' && VALID_DROP_SIZES.includes(v as DropSize)
}

const VALID_FRANCHISES: Franchise[] = ['division2', 'generic']

function isValidFranchise(v: unknown): v is Franchise {
  return typeof v === 'string' && VALID_FRANCHISES.includes(v as Franchise)
}
