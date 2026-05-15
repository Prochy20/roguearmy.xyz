import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { NextRequest, NextResponse } from 'next/server'

const CATEGORIES = ['brands', 'gear_slots', 'weapon_types', 'talents', 'weapon_talents'] as const

type Category = (typeof CATEGORIES)[number]

interface StaticAssetMap {
  version: number
  built_at: string
  source_built_at: string | null
  sanitize: unknown
  brands: Record<string, string>
  gear_slots: Record<string, string>
  weapon_types: Record<string, string>
  talents: Record<string, string>
  weapon_talents: Record<string, string>
  missing: Partial<Record<Category, string[]>>
}

const MAP_PATH = join(process.cwd(), 'public', 'division2', 'data', 'asset_map.json')

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
}

const CACHE_HEADER = {
  'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
}

function resolveOrigin(request: NextRequest): string {
  const forwardedHost = request.headers.get('x-forwarded-host')
  const forwardedProto = request.headers.get('x-forwarded-proto')
  if (forwardedHost) {
    return `${forwardedProto ?? 'https'}://${forwardedHost}`
  }
  return new URL(request.url).origin
}

function absolutize(entries: Record<string, string>, origin: string): Record<string, string> {
  const out: Record<string, string> = {}
  for (const [key, relPath] of Object.entries(entries)) {
    out[key] = `${origin}/division2/${relPath}`
  }
  return out
}

export async function GET(request: NextRequest) {
  try {
    const raw = await readFile(MAP_PATH, 'utf8')
    const map = JSON.parse(raw) as StaticAssetMap
    const origin = resolveOrigin(request)

    const body = {
      version: map.version,
      built_at: map.built_at,
      source_built_at: map.source_built_at,
      sanitize: map.sanitize,
      brands: absolutize(map.brands, origin),
      gear_slots: absolutize(map.gear_slots, origin),
      weapon_types: absolutize(map.weapon_types, origin),
      talents: absolutize(map.talents, origin),
      weapon_talents: absolutize(map.weapon_talents, origin),
      missing: map.missing ?? {},
    }

    return NextResponse.json(body, {
      headers: { ...CORS_HEADERS, ...CACHE_HEADER },
    })
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === 'ENOENT') {
      return NextResponse.json(
        { error: 'Asset map not generated yet. Run `pnpm sync:division2-assets`.' },
        { status: 503, headers: CORS_HEADERS },
      )
    }
    console.error('[api/division2/assets] failed:', err)
    return NextResponse.json(
      { error: 'Failed to load asset map' },
      { status: 500, headers: CORS_HEADERS },
    )
  }
}

export function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS })
}
