import { SignJWT, jwtVerify } from 'jose'
import type { MemberSession } from './types'
import type { PrimaryBadge } from './badges'

const JWT_SECRET = new TextEncoder().encode(process.env.PAYLOAD_SECRET || 'fallback-secret')
const JWT_EXPIRATION = '7d'

export async function signMemberToken(payload: Omit<MemberSession, 'exp'>): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(JWT_EXPIRATION)
    .sign(JWT_SECRET)
}

const VALID_BADGES: readonly PrimaryBadge[] = ['DEVELOPER', 'STAFF', 'BOOSTER', 'MEMBER']

export async function verifyMemberToken(token: string): Promise<MemberSession | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET)
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
