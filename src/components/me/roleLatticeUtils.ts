import type { DiscordRole } from '@/payload-types'

export type LatticeAccent = NonNullable<DiscordRole['accentOverride']>

export type LatticeCategory = 'primary' | 'tag' | 'integration'

export type ResolvedAccent =
  | { kind: 'token'; token: LatticeAccent }
  | { kind: 'hex'; hex: string }

export function getCategory(role: DiscordRole): LatticeCategory {
  if (role.managed) return 'integration'
  if (role.isPrimary) return 'primary'
  return 'tag'
}

export function resolveAccent(role: DiscordRole): ResolvedAccent {
  if (role.accentOverride) {
    return { kind: 'token', token: role.accentOverride }
  }
  if (role.color && isValidHex(role.color)) {
    return { kind: 'hex', hex: role.color }
  }
  return { kind: 'token', token: 'gray' }
}

function isValidHex(hex: string): boolean {
  if (hex === '#000000') return false // Discord's "no color" sentinel
  return /^#[0-9a-f]{6}$/i.test(hex)
}
