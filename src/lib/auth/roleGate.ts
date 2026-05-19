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
 * Resolve a role gate for the current request.
 *
 * Reads the Settings global (request-scoped via React.cache) and intersects
 * the configured game-roles entry's Discord-role snapshot against the
 * member's raw `guildMember.roles` exposed by `getMemberAuth`. No Ashley
 * call — purely a Payload + cached auth read.
 */
export const checkRoleGate = cache(async (key: RoleGateKey): Promise<{ state: GateState }> => {
  const auth = await getMemberAuth()
  if (!auth.authenticated) return { state: 'anonymous' }

  const payload = await getPayload({ config })
  const settings = await payload.findGlobal({
    slug: 'settings',
    depth: 1,
  })

  const gateValue = settings.roleGates?.[key]
  // Unset OR not populated to an object (depth=1 should give us the GameRole doc).
  if (!gateValue || typeof gateValue !== 'object') return { state: 'unconfigured' }

  const allowedRoleIds = extractRoleSnapshotIds((gateValue as GameRole).roles)
  if (allowedRoleIds.length === 0) return { state: 'unconfigured' }

  const memberRoleIds = new Set(auth.discordRoleIds)
  const hasMatch = allowedRoleIds.some((id) => memberRoleIds.has(id))
  return { state: hasMatch ? 'allowed' : 'denied' }
})
