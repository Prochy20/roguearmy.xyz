import { SignJWT, jwtVerify } from 'jose'
import type { MemberSession } from './types'
import type { PrimaryBadge } from './badges'

const JWT_EXPIRATION = '7d'

// Resolved lazily so missing config doesn't crash module-load on cold
// imports (e.g. payload importmap generation). Throws on first use if
// PAYLOAD_SECRET is unset — the previous fallback to a literal string
// would have let an env misconfig in prod sign forgeable sessions.
let cachedSecret: Uint8Array | null = null
function getSecret(): Uint8Array {
  if (cachedSecret) return cachedSecret
  const raw = process.env.PAYLOAD_SECRET
  if (!raw) throw new Error('PAYLOAD_SECRET must be set to sign/verify member sessions')
  cachedSecret = new TextEncoder().encode(raw)
  return cachedSecret
}

export async function signMemberToken(payload: Omit<MemberSession, 'exp'>): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(JWT_EXPIRATION)
    .sign(getSecret())
}

const VALID_BADGES: readonly PrimaryBadge[] = ['DEVELOPER', 'STAFF', 'BOOSTER', 'MEMBER']

export async function verifyMemberToken(token: string): Promise<MemberSession | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret())
    const raw = payload as Record<string, unknown>
    // Reject malformed payloads up-front. memberId is the load-bearing field;
    // an empty value would propagate into payload.findByID('') downstream.
    if (typeof raw.memberId !== 'string' || raw.memberId.length === 0) return null
    // Backfill defaults for JWTs issued before badge fields were added so the
    // chrome doesn't crash on legacy sessions. Real values arrive on next login.
    const primaryBadge: PrimaryBadge =
      typeof raw.primaryBadge === 'string' && (VALID_BADGES as readonly string[]).includes(raw.primaryBadge)
        ? (raw.primaryBadge as PrimaryBadge)
        : 'MEMBER'
    return {
      memberId: raw.memberId,
      discordId: String(raw.discordId ?? ''),
      username: String(raw.username ?? ''),
      globalName: (raw.globalName as string | null | undefined) ?? null,
      avatar: (raw.avatar as string | null | undefined) ?? null,
      primaryBadge,
      isBooster: raw.isBooster === true,
      exp: typeof raw.exp === 'number' ? raw.exp : 0,
    }
  } catch {
    return null
  }
}
