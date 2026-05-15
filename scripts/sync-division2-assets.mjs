/**
 * Sync Division 2 asset images from hi-dep.github.io into public/division2/.
 *
 * Usage:  pnpm sync:division2-assets
 *
 * Behavior:
 *  - Fetches the upstream asset_map.json and downloads every referenced image.
 *  - Mirrors the upstream layout under public/division2/img/<category>/<key>.png.
 *  - Saves the raw upstream map at public/division2/data/source_asset_map.json.
 *  - Writes a rewritten map at public/division2/data/asset_map.json with our
 *    built_at and source_built_at metadata plus a `missing` report.
 *  - For upstream 200: overwrites local if bytes differ; skips otherwise.
 *  - For upstream 404: leaves any existing local file alone, else copies
 *    public/logo.png to public/division2/img/_placeholder.png and to the
 *    expected category path so the URL always resolves.
 *  - Parallel-8 downloads with 100ms jitter, 3x exponential backoff, PNG
 *    signature + non-zero-byte validation.
 */

import { mkdir, readFile, writeFile, copyFile } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { createHash } from 'node:crypto'
import sharp from 'sharp'

const UPSTREAM_BASE = 'https://hi-dep.github.io/division2'
const UPSTREAM_MAP_URL = `${UPSTREAM_BASE}/data/asset_map.json`

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(__dirname, '..')
const PUBLIC_DIR = join(ROOT, 'public')
const DIVISION2_DIR = join(PUBLIC_DIR, 'division2')
const IMG_DIR = join(DIVISION2_DIR, 'img')
const DATA_DIR = join(DIVISION2_DIR, 'data')
const PLACEHOLDER_SRC = join(PUBLIC_DIR, 'logo.png')
const PLACEHOLDER_DEST = join(IMG_DIR, '_placeholder.png')

const CATEGORIES = ['brands', 'gear_slots', 'weapon_types', 'talents', 'weapon_talents']
const CONCURRENCY = 8
const JITTER_MS = 100
const RETRIES = 3
const PNG_SIGNATURE = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])
const ICON_SIZE = 256

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
const jitter = () => sleep(Math.random() * JITTER_MS)

function isValidPng(buf) {
  return buf.length > 0 && buf.length >= 8 && buf.subarray(0, 8).equals(PNG_SIGNATURE)
}

async function bytesEqual(filePath, buf) {
  try {
    const existing = await readFile(filePath)
    return existing.length === buf.length && existing.equals(buf)
  } catch {
    return false
  }
}

async function fileHash(filePath) {
  try {
    const buf = await readFile(filePath)
    return createHash('sha1').update(buf).digest('hex')
  } catch {
    return null
  }
}

async function fetchBuffer(url, attempt = 1) {
  try {
    const res = await fetch(url)
    if (res.status === 404) return { status: 404 }
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const buf = Buffer.from(await res.arrayBuffer())
    return { status: 200, buf }
  } catch (err) {
    if (attempt >= RETRIES) return { status: 'error', error: err }
    await sleep(500 * 2 ** (attempt - 1))
    return fetchBuffer(url, attempt + 1)
  }
}

async function fetchJson(url) {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Failed to fetch ${url}: HTTP ${res.status}`)
  return res.json()
}

async function ensureDir(dir) {
  await mkdir(dir, { recursive: true })
}

async function processEntry({ category, key, relPath }, ctx) {
  await jitter()
  const url = `${UPSTREAM_BASE}/${relPath}`
  const localPath = join(DIVISION2_DIR, relPath)
  await ensureDir(dirname(localPath))

  const result = await fetchBuffer(url)

  if (result.status === 200) {
    if (!isValidPng(result.buf)) {
      return { category, key, outcome: 'invalid', url }
    }
    if (await bytesEqual(localPath, result.buf)) {
      return { category, key, outcome: 'unchanged' }
    }
    await writeFile(localPath, result.buf)
    return { category, key, outcome: 'downloaded', size: result.buf.length }
  }

  if (result.status === 404) {
    if (existsSync(localPath)) {
      const localHash = await fileHash(localPath)
      const isStalePlaceholder = ctx.staleHashes.has(localHash) && localHash !== ctx.placeholderHash
      if (!isStalePlaceholder) {
        return { category, key, outcome: 'missing-kept-local' }
      }
      await copyFile(PLACEHOLDER_DEST, localPath)
      return { category, key, outcome: 'missing-placeholder-refreshed' }
    }
    await copyFile(PLACEHOLDER_DEST, localPath)
    return { category, key, outcome: 'missing-placeholder' }
  }

  return { category, key, outcome: 'error', error: String(result.error) }
}

async function runPool(items, worker, ctx) {
  const results = []
  let cursor = 0
  const lanes = Array.from({ length: CONCURRENCY }, async () => {
    while (cursor < items.length) {
      const idx = cursor++
      results[idx] = await worker(items[idx], ctx)
    }
  })
  await Promise.all(lanes)
  return results
}

async function main() {
  console.log(`[sync] fetching upstream map: ${UPSTREAM_MAP_URL}`)
  const upstream = await fetchJson(UPSTREAM_MAP_URL)

  await ensureDir(IMG_DIR)
  await ensureDir(DATA_DIR)

  if (!existsSync(PLACEHOLDER_SRC)) {
    throw new Error(`Placeholder source missing at ${PLACEHOLDER_SRC}`)
  }
  const staleHashes = new Set()
  const prevPlaceholderHash = await fileHash(PLACEHOLDER_DEST)
  if (prevPlaceholderHash) staleHashes.add(prevPlaceholderHash)
  const rawLogoHash = await fileHash(PLACEHOLDER_SRC)
  if (rawLogoHash) staleHashes.add(rawLogoHash)

  await sharp(PLACEHOLDER_SRC)
    .resize(ICON_SIZE, ICON_SIZE, {
      fit: 'contain',
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .png()
    .toFile(PLACEHOLDER_DEST)

  const placeholderHash = await fileHash(PLACEHOLDER_DEST)

  await writeFile(
    join(DATA_DIR, 'source_asset_map.json'),
    JSON.stringify(upstream, null, 2) + '\n',
  )

  const queue = []
  for (const category of CATEGORIES) {
    const entries = upstream[category]
    if (!entries) continue
    for (const [key, relPath] of Object.entries(entries)) {
      queue.push({ category, key, relPath })
    }
  }
  console.log(`[sync] queued ${queue.length} assets across ${CATEGORIES.length} categories`)

  const startedAt = Date.now()
  const results = await runPool(queue, processEntry, { staleHashes, placeholderHash })
  const elapsed = ((Date.now() - startedAt) / 1000).toFixed(1)

  const tally = { downloaded: 0, unchanged: 0, 'missing-placeholder': 0, 'missing-placeholder-refreshed': 0, 'missing-kept-local': 0, invalid: 0, error: 0 }
  const missing = {}
  const errors = []
  for (const r of results) {
    tally[r.outcome] = (tally[r.outcome] ?? 0) + 1
    if (r.outcome === 'missing-placeholder' || r.outcome === 'missing-placeholder-refreshed' || r.outcome === 'missing-kept-local') {
      ;(missing[r.category] ??= []).push(r.key)
    }
    if (r.outcome === 'invalid' || r.outcome === 'error') {
      errors.push(r)
    }
  }
  for (const arr of Object.values(missing)) arr.sort()

  const builtAt = new Date().toISOString()
  const rewritten = {
    version: upstream.version,
    built_at: builtAt,
    source_built_at: upstream.built_at ?? null,
    sanitize: upstream.sanitize ?? null,
  }
  for (const category of CATEGORIES) {
    rewritten[category] = upstream[category] ?? {}
  }
  rewritten.missing = missing

  await writeFile(
    join(DATA_DIR, 'asset_map.json'),
    JSON.stringify(rewritten, null, 2) + '\n',
  )

  await writeFile(
    join(DATA_DIR, 'missing.json'),
    JSON.stringify({ built_at: builtAt, missing }, null, 2) + '\n',
  )

  console.log(`[sync] done in ${elapsed}s`)
  console.log(`[sync] ${JSON.stringify(tally)}`)
  if (errors.length) {
    console.warn(`[sync] ${errors.length} error(s):`)
    for (const e of errors.slice(0, 10)) console.warn(`  - ${e.category}/${e.key}: ${e.outcome} ${e.error ?? ''}`)
  }
  const missingTotal = Object.values(missing).reduce((n, a) => n + a.length, 0)
  if (missingTotal) {
    console.log(`[sync] ${missingTotal} asset(s) missing upstream — see public/division2/data/missing.json`)
  }
}

main().catch((err) => {
  console.error('[sync] fatal:', err)
  process.exit(1)
})
