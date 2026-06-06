import { NextResponse } from 'next/server'
import { getMemberAuth } from '@/lib/auth/session.server'
import { checkRoleGate, type RoleGateKey } from '@/lib/auth/roleGate'
import type { RoleGateMap } from '@/lib/auth/roleGate.types'

// Keep in sync with the layout — same keys, same client expectations.
const NAV_ROLE_GATE_KEYS: RoleGateKey[] = ['division2Role']

const NO_STORE_HEADERS = { 'Cache-Control': 'private, no-store' }

export async function GET() {
  const auth = await getMemberAuth()

  if (!auth.authenticated || !auth.member) {
    return NextResponse.json(
      { authenticated: false, member: null, roleGates: {} },
      { headers: NO_STORE_HEADERS },
    )
  }

  const roleGates: RoleGateMap = {}
  const results = await Promise.all(
    NAV_ROLE_GATE_KEYS.map(async (key) => [key, await checkRoleGate(key)] as const),
  )
  for (const [key, gate] of results) roleGates[key] = gate.state

  return NextResponse.json(
    {
      authenticated: true,
      member: {
        id: auth.memberId,
        discordId: auth.member.discordId,
        username: auth.member.username,
        globalName: auth.member.globalName,
        avatar: auth.member.avatar,
        primaryBadge: auth.primaryBadge,
        isBooster: auth.isBooster,
      },
      roleGates,
    },
    { headers: NO_STORE_HEADERS },
  )
}
