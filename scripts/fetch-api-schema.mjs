/**
 * Downloads the Ashley OpenAPI spec from GitHub and writes it to the codebase.
 *
 * Usage:  node scripts/fetch-api-schema.mjs
 * Output: src/lib/api/openapi.json
 *
 * Source: https://github.com/kreteni-online/DCBOT_V2/blob/master/openapi.json
 *
 * Requires the GitHub CLI (`gh`) to be installed and authenticated:
 *   brew install gh && gh auth login
 *
 * Run via:  pnpm generate:api  (also regenerates src/lib/api/schema.d.ts)
 */

import { execFileSync } from 'child_process'
import { writeFileSync, mkdirSync } from 'fs'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, '..')

const REPO = 'kreteni-online/DCBOT_V2'
const REF = 'master'
const SOURCE_PATH = 'openapi.json'
const OUTPUT = join(root, 'src/lib/api/openapi.json')

function fail(message, detail) {
  console.error(`✗ ${message}`)
  if (detail) console.error(detail)
  process.exit(1)
}

try {
  execFileSync('gh', ['--version'], { stdio: 'ignore' })
} catch {
  fail(
    'gh CLI not found.',
    'Install it with: brew install gh   then run: gh auth login',
  )
}

console.log(`→ Fetching ${SOURCE_PATH} from ${REPO}@${REF}…`)

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
