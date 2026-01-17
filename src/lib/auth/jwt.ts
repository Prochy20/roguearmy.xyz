import { SignJWT, jwtVerify } from 'jose'
import type { MemberSession } from './types'

const JWT_SECRET = new TextEncoder().encode(process.env.PAYLOAD_SECRET || 'fallback-secret')
const JWT_EXPIRATION = '7d'

export async function signMemberToken(payload: Omit<MemberSession, 'exp'>): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(JWT_EXPIRATION)
    .sign(JWT_SECRET)
}

export async function verifyMemberToken(token: string): Promise<MemberSession | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET)
    return payload as unknown as MemberSession
  } catch {
    return null
  }
}
