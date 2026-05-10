import 'server-only'
import type { Client } from 'openapi-fetch'
import type { paths } from './schema'
import {
  getAshleyAccessCookie,
  getAshleyRefreshCookie,
  setAshleyTokens,
  clearAshleyCookies,
} from '@/lib/auth/cookies'
import { createAshleyUserClient, getAshleyServiceClient } from './client'

/**
 * Discriminated error categories returned by safeAshleyCall.
 *
 * Consumers (BFF routes / server actions) match on `code` to decide what to
 * render: a fail-state UI for `unavailable`, a re-login prompt for
 * `unauthenticated` / `unauthorized`, etc.
 */
export type AshleyErrorCode =
  | 'unauthenticated' // no Ashley session cookie present
  | 'unauthorized' // had cookies, refresh failed with 401 — cookies cleared
  | 'forbidden' // 403 from the call
  | 'not_found' // 404
  | 'invalid' // other 4xx (e.g., validation)
  | 'unavailable' // 5xx, network error, or refresh transient failure
  | 'unknown'

export interface AshleyError {
  code: AshleyErrorCode
  status?: number
  message?: string
}

export type AshleyResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: AshleyError }

type AshleyCallResponse<T> = {
  data?: T
  error?: unknown
  response?: Response
}

/**
 * Wrap one Ashley user-context call with cookie reading, reactive 401
 * refresh, and uniform error classification.
 *
 * Must be called from a route handler or server action — the refresh path
 * writes cookies, which is not allowed in server components.
 *
 * Usage:
 *   const result = await safeAshleyCall((ashley) =>
 *     ashley.GET('/api/community/stats'),
 *   )
 *   if (!result.ok) return Response.json({ error: result.error }, { status: 503 })
 *   return Response.json(result.data)
 */
export async function safeAshleyCall<T>(
  fn: (client: Client<paths>) => Promise<AshleyCallResponse<T>>,
): Promise<AshleyResult<T>> {
  const accessToken = await getAshleyAccessCookie()
  if (!accessToken) return { ok: false, error: { code: 'unauthenticated' } }

  let result = await invoke(fn, accessToken)
  if (result.ok) return { ok: true, data: result.value }

  // Reactive refresh: only on a real 401 from a non-auth endpoint.
  if (result.status === 401) {
    const refreshed = await tryRefreshAshleyTokens()
    if (refreshed === 'cleared') return { ok: false, error: { code: 'unauthorized' } }
    if (refreshed === 'transient') return { ok: false, error: { code: 'unavailable' } }

    result = await invoke(fn, refreshed)
    if (result.ok) return { ok: true, data: result.value }
  }

  return { ok: false, error: classifyAshleyError(result.status, result.body) }
}

/**
 * Server-component-safe Ashley call using the service-identity client
 * (X-API-Key only, no user context). Use this for endpoints that don't
 * require a logged-in user — community stats, role list, leveling
 * leaderboard, etc.
 *
 * Unlike safeAshleyCall, this does NOT read cookies or attempt token
 * refresh, so it's safe inside server components. The result shape
 * matches safeAshleyCall for uniform failure-UI pattern matching;
 * 'unauthenticated' and 'unauthorized' codes are never returned.
 */
export async function fetchAshleyService<T>(
  fn: (client: Client<paths>) => Promise<AshleyCallResponse<T>>,
): Promise<AshleyResult<T>> {
  const client = getAshleyServiceClient()
  try {
    const { data, error, response } = await fn(client)
    if (data !== undefined) return { ok: true, data }
    return { ok: false, error: classifyAshleyError(response?.status ?? 0, error) }
  } catch {
    return { ok: false, error: { code: 'unavailable', status: 0 } }
  }
}

type InvokeResult<T> =
  | { ok: true; value: T }
  | { ok: false; status: number; body: unknown }

async function invoke<T>(
  fn: (client: Client<paths>) => Promise<AshleyCallResponse<T>>,
  accessToken: string,
): Promise<InvokeResult<T>> {
  const client = createAshleyUserClient(accessToken)
  try {
    const { data, error, response } = await fn(client)
    if (data !== undefined) return { ok: true, value: data }
    return { ok: false, status: response?.status ?? 0, body: error }
  } catch {
    return { ok: false, status: 0, body: undefined }
  }
}

/**
 * Attempt to refresh the Ashley session.
 *
 * Returns:
 *   - the new access token on success (cookies updated)
 *   - 'cleared' when refresh was rejected as invalid (cookies cleared — re-login)
 *   - 'transient' when the refresh endpoint was unreachable (cookies kept)
 */
async function tryRefreshAshleyTokens(): Promise<string | 'cleared' | 'transient'> {
  const refreshToken = await getAshleyRefreshCookie()
  if (!refreshToken) return 'cleared'

  const service = getAshleyServiceClient()
  try {
    const { data, response } = await service.POST('/api/auth/refresh', {
      body: { refreshToken },
    })
    if (data) {
      // Refresh tokens rotate per spec — overwrite both cookies.
      await setAshleyTokens(data.accessToken, data.refreshToken)
      return data.accessToken
    }
    if (response?.status === 401 || response?.status === 403) {
      await clearAshleyCookies()
      return 'cleared'
    }
    return 'transient'
  } catch {
    return 'transient'
  }
}

function classifyAshleyError(status: number, body: unknown): AshleyError {
  const message = extractMessage(body)
  if (status === 401) return { code: 'unauthorized', status, message }
  if (status === 403) return { code: 'forbidden', status, message }
  if (status === 404) return { code: 'not_found', status, message }
  if (status >= 400 && status < 500) return { code: 'invalid', status, message }
  if (status >= 500 || status === 0) return { code: 'unavailable', status, message }
  return { code: 'unknown', status, message }
}

function extractMessage(body: unknown): string | undefined {
  if (typeof body !== 'object' || body === null) return undefined
  const m = (body as Record<string, unknown>).message
  return typeof m === 'string' ? m : undefined
}
