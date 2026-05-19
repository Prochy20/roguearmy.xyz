import 'server-only'

import { cache } from 'react'
import { getPayload } from 'payload'
import config from '@payload-config'
import { getMemberAuth } from './session.server'
import type { GameRole } from '@/payload-types'
import type { GateState, RoleGateKey } from './roleGate.types'

export type { GateState, RoleGateKey } from './roleGate.types'

interface RoleSnapshotEntry {
  id: string
  name?: string
  color?: string | null
}

function extractRoleSnapshotIds(value: GameRole['roles']): string[] {
  if (!Array.isArray(value)) return []
  const out: string[] = []
  for (const entry of value) {
    if (!entry || typeof entry !== 'object') continue
    const id = (entry as RoleSnapshotEntry).id
    if (typeof id === 'string' && id.length > 0) out.push(id)
  }
  return out
}

/**
 * Per-key resolver: which global + nested path holds the gate role. Extend
 * this map when a new game-tool global lands (e.g. `destiny2Role`).
 */
const GATE_SOURCES: Record<RoleGateKey, { slug: 'division2'; read: (g: unknown) => unknown }> = {
  division2Role: {
    slug: 'division2',
    read: (g) => (g as { gate?: { role?: unknown } } | null | undefined)?.gate?.role,
  },
}

/**
 * Resolve a role gate for the current request.
 *
 * Reads the relevant game-tool global (request-scoped via React.cache) and
 * intersects its configured game-roles entry's Discord-role snapshot against
 * the member's raw `guildMember.roles` exposed by `getMemberAuth`. No Ashley
 * call — purely a Payload + cached auth read.
 */
export const checkRoleGate = cache(async (key: RoleGateKey): Promise<{ state: GateState }> => {
  const auth = await getMemberAuth()
  if (!auth.authenticated) return { state: 'anonymous' }

  const source = GATE_SOURCES[key]
  const payload = await getPayload({ config })
  const global = await payload.findGlobal({ slug: source.slug, depth: 1 })

  const gateValue = source.read(global)
  // Unset OR not populated to an object (depth=1 should give us the GameRole doc).
  if (!gateValue || typeof gateValue !== 'object') return { state: 'unconfigured' }

  const allowedRoleIds = extractRoleSnapshotIds((gateValue as GameRole).roles)
  if (allowedRoleIds.length === 0) return { state: 'unconfigured' }

  const memberRoleIds = new Set(auth.discordRoleIds)
  const hasMatch = allowedRoleIds.some((id) => memberRoleIds.has(id))
  return { state: hasMatch ? 'allowed' : 'denied' }
})
