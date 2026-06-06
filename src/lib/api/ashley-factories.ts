import 'server-only'
import createClient, { type Client } from 'openapi-fetch'
import type { paths } from './schema'

/**
 * Typed clients for the Ashley backend (kreteni-online/DCBOT_V2).
 *
 * Server-only: never import from a client component. The API key and any
 * user JWT must remain on the server — the browser talks only to BFF routes
 * under src/app/api, which read HttpOnly cookies and call Ashley on its behalf.
 *
 * Two auth modes, two factories — call sites are unambiguous about identity.
 *
 * Configuration:
 *   - ASHLEY_API_BASE_URL  (required, both factories) — full API root including
 *     the deployment-specific mount prefix (e.g. ".../api" in dev,
 *     ".../api-ashley" behind the prod reverse proxy). The generated schema
 *     paths bake "/api/..." in; the stripApiPrefix middleware below removes
 *     that so the base URL's prefix is the single source of truth.
 *   - ASHLEY_API_KEY       (required for service factory — X-API-Key header)
 *
 * Regenerate ./schema.d.ts after the upstream contract changes:
 *   pnpm generate:api
 */

function requireBaseUrl(): string {
  const baseUrl = process.env.ASHLEY_API_BASE_URL
  if (!baseUrl) throw new Error('ASHLEY_API_BASE_URL is not set in your environment')
  return baseUrl
}

// Strip the schema's hardcoded "/api/" prefix from outgoing requests. The
// deployment-specific prefix already lives in ASHLEY_API_BASE_URL — without
// this, we'd double up (e.g. ".../api-ashley/api/auth/login").
//
// openapi-fetch builds the final URL by raw string concatenation
// (`${baseUrl}${schemaPath}`), so the pathname we see here is
// `{base-path}/api/{rest}`. We look for "/api/" immediately after the base
// path, not at position 0 — in prod the base path is "/api-ashley".
function buildStripApiPrefix(baseUrl: string) {
  const basePath = new URL(baseUrl).pathname.replace(/\/$/, '')
  const doubled = `${basePath}/api/`
  return {
    async onRequest({ request }: { request: Request }) {
      const url = new URL(request.url)
      if (!url.pathname.startsWith(doubled)) return undefined
      url.pathname = `${basePath}/${url.pathname.slice(doubled.length)}`
      return new Request(url, request)
    },
  }
}

function requireApiKey(): string {
  const apiKey = process.env.ASHLEY_API_KEY
  if (!apiKey) throw new Error('ASHLEY_API_KEY is not set in your environment')
  return apiKey
}

let cachedServiceClient: Client<paths> | null = null

/**
 * Service-identity client (X-API-Key auth).
 *
 * Use for: login, refresh, and any endpoint that operates on behalf of the
 * service itself rather than a logged-in user. Cached as a module singleton.
 */
export function getAshleyServiceClient(): Client<paths> {
  if (cachedServiceClient) return cachedServiceClient

  const baseUrl = requireBaseUrl()
  const client = createClient<paths>({
    baseUrl,
    headers: { 'X-API-Key': requireApiKey() },
  })
  client.use(buildStripApiPrefix(baseUrl))
  cachedServiceClient = client
  return cachedServiceClient
}

/**
 * User-context client factory (Bearer JWT auth + service API key).
 *
 * Sends BOTH headers because Ashley treats X-API-Key as a service trust gate
 * and Bearer as the user identity inside that gate. Despite the spec listing
 * them as alternatives, the implementation requires both for user-context
 * endpoints (e.g. /api/auth/me returns 401 "Missing API key" with bearer alone).
 *
 * Bare — no cookie reading, no refresh handling. For BFF routes, use
 * `safeAshleyCall` from ./server which wraps this with cookie reading +
 * reactive 401-refresh.
 */
export function createAshleyUserClient(accessToken: string): Client<paths> {
  const baseUrl = requireBaseUrl()
  const client = createClient<paths>({
    baseUrl,
    headers: {
      'X-API-Key': requireApiKey(),
      Authorization: `Bearer ${accessToken}`,
    },
  })
  client.use(buildStripApiPrefix(baseUrl))
  return client
}
