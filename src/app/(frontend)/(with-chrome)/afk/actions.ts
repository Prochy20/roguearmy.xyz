'use server'

import { revalidatePath } from 'next/cache'
import { getMemberAuth } from '@/lib/auth/session.server'
import {
  safeAshleyCall,
  safeAshleyVoidCall,
  type AshleyResult,
} from '@/lib/api/server'
import type { components } from '@/lib/api/schema'

type AfkRecord = components['schemas']['AfkRecordResponseDto']
type AfkHistoryPage = components['schemas']['AfkHistoryResponseDto']

const REASON_MAX_LENGTH = 80
const HISTORY_PAGE_SIZE = 20

// Mutations bust both pages — /me's identity pill reactively reflects AFK
// state, and /afk's own panels need to re-render after toggle.
function revalidateAfkSurfaces() {
  revalidatePath('/me')
  revalidatePath('/afk')
}

// Server actions are callable from any authenticated client surface — gate
// at the Payload layer instead of trusting Ashley to reject. Same shape as
// fetchAshleyUser's missing-token return so consumers can pattern-match
// uniformly.
async function requireMember(): Promise<
  { ok: true } | { ok: false; error: { code: 'unauthenticated' } }
> {
  const auth = await getMemberAuth()
  if (!auth.authenticated || !auth.member) {
    return { ok: false, error: { code: 'unauthenticated' } }
  }
  return { ok: true }
}

export async function setAfk(
  formData: FormData,
): Promise<AshleyResult<AfkRecord>> {
  const gate = await requireMember()
  if (!gate.ok) return gate

  const raw = formData.get('reason')
  const reason =
    typeof raw === 'string' ? raw.trim().slice(0, REASON_MAX_LENGTH) : ''
  const body = reason.length > 0 ? { reason } : {}

  const result = await safeAshleyCall<AfkRecord>((c) =>
    c.POST('/api/afk/me', { body }),
  )

  if (result.ok) revalidateAfkSurfaces()
  return result
}

export async function clearAfk(): Promise<AshleyResult<null>> {
  const gate = await requireMember()
  if (!gate.ok) return gate

  const result = await safeAshleyVoidCall((c) => c.DELETE('/api/afk/me'))
  if (result.ok) revalidateAfkSurfaces()
  return result
}

export async function loadMoreHistory(
  offset: number,
): Promise<AshleyResult<AfkHistoryPage>> {
  const gate = await requireMember()
  if (!gate.ok) return gate

  if (!Number.isInteger(offset) || offset < 0) {
    return { ok: false, error: { code: 'invalid' } }
  }
  return safeAshleyCall<AfkHistoryPage>((c) =>
    c.GET('/api/afk/me/history', {
      params: { query: { limit: HISTORY_PAGE_SIZE, offset } },
    }),
  )
}
