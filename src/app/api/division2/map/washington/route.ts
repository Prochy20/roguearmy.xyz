import { NextResponse } from 'next/server'

const MAP = {
  centerLon: -77.0365,
  centerLat: 38.8893,
  zoom: 12.2,
  sizePx: 600,
} as const

function buildUpstreamUrl(token: string): string {
  return (
    `https://api.mapbox.com/styles/v1/mapbox/streets-v12/static/` +
    `${MAP.centerLon},${MAP.centerLat},${MAP.zoom},0/` +
    `${MAP.sizePx}x${MAP.sizePx}?access_token=${token}`
  )
}

export async function GET() {
  const token = process.env.MAPBOX_TOKEN
  if (!token) return new NextResponse(null, { status: 404 })

  let upstream: Response
  try {
    upstream = await fetch(buildUpstreamUrl(token), {
      next: { revalidate: 60 * 60 * 24 },
    })
  } catch (error) {
    console.error('[division2/map/washington] upstream fetch failed', error)
    return new NextResponse(null, { status: 502 })
  }

  if (!upstream.ok) {
    return new NextResponse(null, { status: upstream.status })
  }

  const buffer = await upstream.arrayBuffer()
  return new NextResponse(buffer, {
    status: 200,
    headers: {
      'Content-Type': upstream.headers.get('content-type') ?? 'image/png',
      'Cache-Control': 'public, max-age=86400, s-maxage=604800, immutable',
    },
  })
}
