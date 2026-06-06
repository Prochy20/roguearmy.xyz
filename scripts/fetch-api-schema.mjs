/**
 * Downloads the Ashley OpenAPI spec from GitHub and regenerates the typed schema.
 *
 * Usage:  node scripts/fetch-api-schema.mjs [--branch <ref>]
 *         node scripts/fetch-api-schema.mjs -b develop
 * Outputs:
 *   src/lib/api/openapi.json   (raw spec from upstream)
 *   src/lib/api/schema.d.ts    (typed paths/components via openapi-typescript)
 *
 * Source: https://github.com/kreteni-online/DCBOT_V2/blob/<ref>/openapi.json
 *
 * Requires the GitHub CLI (`gh`) to be installed and authenticated:
 *   brew install gh && gh auth login
 *
 * Run via:  pnpm generate:api:fetch [--branch <ref>]
 *           pnpm generate:api               (alias)
 */

import { execFileSync } from 'child_process'
import { writeFileSync, mkdirSync } from 'fs'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'
import { parseArgs } from 'node:util'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, '..')

const REPO = 'kreteni-online/DCBOT_V2'
const DEFAULT_REF = 'master'
const SOURCE_PATH = 'openapi.json'
const OUTPUT = join(root, 'src/lib/api/openapi.json')
const SCHEMA_TYPES = join(root, 'src/lib/api/schema.d.ts')

function fail(message, detail) {
  console.error(`✗ ${message}`)
  if (detail) console.error(detail)
  process.exit(1)
}

let parsedArgs
try {
  parsedArgs = parseArgs({
    options: { branch: { type: 'string', short: 'b' } },
    strict: true,
  })
} catch (err) {
  fail('Invalid arguments.', `${err.message}\nUsage: node scripts/fetch-api-schema.mjs [--branch <ref>]`)
}

const REF = parsedArgs.values.branch?.trim() || DEFAULT_REF

try {
  execFileSync('gh', ['--version'], { stdio: 'ignore' })
} catch {
  fail(
    'gh CLI not found.',
    'Install it with: brew install gh   then run: gh auth login',
  )
}

const refLabel = REF === DEFAULT_REF ? REF : `${REF} (override)`
console.log(`→ Fetching ${SOURCE_PATH} from ${REPO}@${refLabel}…`)

let raw
try {
  raw = execFileSync(
    'gh',
    [
      'api',
      '-H',
      'Accept: application/vnd.github.raw',
      `/repos/${REPO}/contents/${SOURCE_PATH}?ref=${REF}`,
    ],
    { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] },
  )
} catch (err) {
  fail(
    'gh api request failed.',
    err.stderr?.toString() ||
      err.message ||
      'Check that you are logged in (`gh auth status`) and have access to the repo.',
  )
}

let parsed
try {
  parsed = JSON.parse(raw)
} catch {
  fail('Response was not valid JSON.', raw.slice(0, 200))
}

mkdirSync(dirname(OUTPUT), { recursive: true })
writeFileSync(OUTPUT, JSON.stringify(parsed, null, 2) + '\n')

const pathCount = Object.keys(parsed.paths ?? {}).length
const version = parsed.info?.version ?? 'unknown'
console.log(`✓ Wrote ${OUTPUT}`)
console.log(`  ${pathCount} paths · spec version ${version}`)

console.log(`→ Generating typed schema → ${SCHEMA_TYPES}…`)
try {
  execFileSync(
    'pnpm',
    ['exec', 'openapi-typescript', OUTPUT, '-o', SCHEMA_TYPES],
    { stdio: ['ignore', 'inherit', 'inherit'] },
  )
} catch (err) {
  fail(
    'openapi-typescript failed.',
    err.stderr?.toString() ||
      err.message ||
      'The spec was downloaded but type generation did not complete.',
  )
}
console.log(`✓ Wrote ${SCHEMA_TYPES}`)
