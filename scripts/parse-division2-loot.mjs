/**
 * One-time script to parse Division 2 CSV exports into a JSON loot pool.
 *
 * Usage:  node scripts/parse-division2-loot.mjs
 * Output: src/data/division2-loot.json
 */

import { readFileSync, writeFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, '..')
const TEMP = join(root, 'temp')

// ─── CSV Parser (handles multiline quoted fields) ────────────────────────────

function parseCSV(text) {
  const rows = []
  let current = []
  let field = ''
  let inQuotes = false

  for (let i = 0; i < text.length; i++) {
    const ch = text[i]
    if (inQuotes) {
      if (ch === '"' && text[i + 1] === '"') {
        field += '"'
        i++
      } else if (ch === '"') {
        inQuotes = false
      } else {
        field += ch
      }
    } else {
      if (ch === '"') {
        inQuotes = true
      } else if (ch === ',') {
        current.push(field.trim())
        field = ''
      } else if (ch === '\n' || (ch === '\r' && text[i + 1] === '\n')) {
        if (ch === '\r') i++
        current.push(field.trim())
        rows.push(current)
        current = []
        field = ''
      } else if (ch === '\r') {
        current.push(field.trim())
        rows.push(current)
        current = []
        field = ''
      } else {
        field += ch
      }
    }
  }
  if (field || current.length) {
    current.push(field.trim())
    rows.push(current)
  }
  return rows
}

function readCSV(filename) {
  const raw = readFileSync(join(TEMP, filename), 'utf8')
  return parseCSV(raw)
}

function num(v) {
  if (!v || v === 'N/A' || v === '---' || v === '----') return null
  const n = Number(v.replace(/,/g, '').replace(/\s/g, ''))
  return isNaN(n) ? null : n
}

function clean(v) {
  if (!v || v === '----' || v === '---' || v === 'N/A') return null
  return v.replace(/\r/g, '').trim() || null
}

function firstLine(v) {
  if (!v) return null
  return v.split('\n')[0].trim() || null
}

// ─── Normalize weapon category ───────────────────────────────────────────────

const CATEGORY_MAP = {
  'assault rifles': 'Assault Rifle',
  'assault rifle': 'Assault Rifle',
  'light machine guns': 'LMG',
  'light machine gun': 'LMG',
  lmg: 'LMG',
  'submachine guns': 'SMG',
  submachine: 'SMG',
  smg: 'SMG',
  shotguns: 'Shotgun',
  shotgun: 'Shotgun',
  rifles: 'Rifle',
  rifle: 'Rifle',
  'marksman rifles': 'Marksman Rifle',
  'marksman rifle': 'Marksman Rifle',
  pistols: 'Pistol',
  pistol: 'Pistol',
}

function normCategory(raw) {
  if (!raw) return null
  return CATEGORY_MAP[raw.toLowerCase().trim()] || raw.trim()
}

// ─── Canonical Exotic Weapons (verified against wiki) ────────────────────────
// Source: https://blog.lfcarry.com/division-2-exotics-list/

const CANONICAL_EXOTIC_WEAPONS = new Set([
  "st. elmo's engine", "st elmo's engine", 'strega', 'capacitor', 'eagle bearer',
  'chameleon', 'the bighorn',
  'ouroboros', 'oxpecker', 'lady death', 'backfire', 'the chatterbox',
  'pestilence', 'bluescreen', 'bullet king', 'iron lung', 'pakhan',
  'vindicator', 'doctor home', 'the ravenous', 'diamondback', 'merciless',
  'scorpio', 'overlord', 'sweet dreams',
  'mantis', 'nemesis', 'dread edict', 'sacrum imperium',
  'regulus', 'liberty', 'busy little bee', 'mosquito', 'catalyst', 'tempest',
])

// ─── Parse Named + Exotic Weapons (do this FIRST to build exclusion set) ─────

function parseNamedExoticWeapons() {
  const rows = readCSV('Division 2 Gear Spreadsheet - Weapons_ Named + Exotics.csv')
  const named = []
  const exotic = []
  const allNames = new Set() // names + variants for excluding from common pool
  let currentCategory = null
  let inExoticSection = false

  for (let i = 1; i < rows.length; i++) {
    const r = rows[i]
    if (r[0]) currentCategory = normCategory(r[0])

    const variant = clean(r[1])
    const itemName = clean(r[2])
    const talent = clean(r[4])
    const exoticMods = clean(r[5])

    // Once we hit the first row with exotic mods, everything after is in the exotic section
    if (exoticMods) inExoticSection = true

    // Track all names AND variants for exclusion from common pool
    if (itemName) allNames.add(itemName.toLowerCase())
    if (variant) allNames.add(variant.toLowerCase())

    if (!inExoticSection) {
      // ── Named weapon section ──
      const name = itemName || variant
      if (!name) continue

      named.push({
        name,
        category: currentCategory,
        talent: firstLine(talent),
      })
    } else {
      // ── Exotic section ──
      // Exotics come in pairs: BASE row (variant + talent) then NAME row (actual exotic name).
      // Some rows are named variants of exotics (e.g. Lullaby, Ruthless) — those are epic.
      if (exoticMods || variant) {
        // BASE row — has variant (base weapon) and talent description
        const baseTalent = firstLine(talent)

        // Check if this row also has an item name (single-row entry)
        if (itemName) {
          const isExotic = CANONICAL_EXOTIC_WEAPONS.has(itemName.toLowerCase())
          ;(isExotic ? exotic : named).push({
            name: itemName,
            category: currentCategory,
            talent: baseTalent,
          })
        }

        // Peek at next row — if it's a NAME row (no variant, has name), consume it
        const next = rows[i + 1]
        if (next) {
          const nextVariant = clean(next[1])
          const nextName = clean(next[2])
          const nextExoticMods = clean(next[5])
          if (!nextVariant && !nextExoticMods && nextName) {
            allNames.add(nextName.toLowerCase())
            const isExotic = CANONICAL_EXOTIC_WEAPONS.has(nextName.toLowerCase())
            ;(isExotic ? exotic : named).push({
              name: nextName,
              category: currentCategory,
              talent: baseTalent,
            })
            i++ // skip the NAME row, we consumed it
          }
        }
      }
    }
  }
  return { named, exotic, allNames }
}

// ─── Named weapons that only appear in the base Weapons CSV ──────────────────
// These are named variants that the Named+Exotics sheet missed.

const BASE_CSV_NAMED_WEAPONS = new Set([
  'big alejandro',
])

// ─── Parse Base Weapons (excluding named/exotic) ────────────────────────────

function parseBaseWeapons(excludeNames) {
  const rows = readCSV('Division 2 Gear Spreadsheet - Weapons.csv')
  const items = []
  const namedFromBase = [] // named weapons found only in this CSV
  let currentCategory = null
  let currentFamily = null

  for (let i = 1; i < rows.length; i++) {
    const r = rows[i]
    const name = clean(r[2])
    if (!name) continue

    if (r[0]) currentCategory = normCategory(r[0])
    if (r[1]) currentFamily = clean(r[1])

    // Skip named/exotic weapons that appear in the Named+Exotics sheet
    if (excludeNames.has(name.toLowerCase())) continue

    // Skip parenthetical entries like "First Sight (AK-M)"
    if (name.includes('(') && name.includes(')')) continue

    const rpm = num(r[3])
    if (!rpm) continue

    // Check if this is a known named weapon missing from the Named+Exotics CSV
    if (BASE_CSV_NAMED_WEAPONS.has(name.toLowerCase())) {
      namedFromBase.push({
        name,
        category: currentCategory,
        talent: null,
      })
      continue
    }

    items.push({
      name,
      category: currentCategory,
      family: currentFamily,
      rpm,
      baseDamage: num(r[7]),
      optimalRange: num(r[12]),
    })
  }
  return { standard: items, namedFromBase }
}

// ─── Parse Brandsets ─────────────────────────────────────────────────────────

function parseBrandsets() {
  const rows = readCSV('Division 2 Gear Spreadsheet - Brandsets.csv')
  const brands = []

  for (let i = 1; i < rows.length; i++) {
    const r = rows[i]
    const name = clean(r[2])
    if (!name) continue

    brands.push({
      name,
      coreType: clean(r[4]) || 'Armor',
      bonuses: {
        pc1: clean(r[5]),
        pc2: clean(r[6]),
        pc3: clean(r[7]),
      },
    })
  }
  return brands
}

// ─── Parse Named + Exotic Gear ───────────────────────────────────────────────

function parseNamedExoticGear() {
  const rows = readCSV('Division 2 Gear Spreadsheet - Gear_ Named + Exotics.csv')
  const named = []
  const exotic = []
  let currentSlot = null

  for (let i = 1; i < rows.length; i++) {
    const r = rows[i]
    if (r[0]) currentSlot = r[0].trim()

    const brand = clean(r[2])
    const itemName = clean(r[4])
    const talent = clean(r[6])
    const talentDesc = clean(r[7])

    const slot = currentSlot === 'Knees' ? 'Kneepads' : currentSlot

    if (brand) {
      // ── Named gear (has a brand) ──
      if (!itemName) continue
      named.push({
        name: itemName,
        slot,
        talent: firstLine(talent),
        brand,
      })
    } else {
      // ── Exotic gear (no brand) — comes in pairs: talent row then name row ──
      if (talent && !itemName) {
        // TALENT row — peek at next row for the actual item name
        const talentName = firstLine(talent)
        const next = rows[i + 1]
        if (next) {
          const nextName = clean(next[4])
          const nextTalent = clean(next[6])
          if (nextName && !nextTalent) {
            // Clean up multiline names (e.g. "NinjaBike\nMessenger Backpack")
            const cleanName = nextName.replace(/\n/g, ' ').replace(/\s+/g, ' ').trim()
            exotic.push({
              name: cleanName,
              slot,
              talent: talentName,
            })
            i++ // skip the name row, we consumed it
            continue
          }
        }
      } else if (itemName) {
        // Standalone exotic row (has name directly)
        exotic.push({
          name: itemName.replace(/\n/g, ' ').trim(),
          slot,
          talent: firstLine(talent),
        })
      }
    }
  }
  return { named, exotic }
}

// ─── Parse Gearsets ──────────────────────────────────────────────────────────

function parseGearsets() {
  const rows = readCSV('Division 2 Gear Spreadsheet - Gearsets.csv')
  const sets = []

  for (let i = 1; i < rows.length; i++) {
    const r = rows[i]
    const name = clean(r[0])
    if (!name) continue
    if (name.startsWith('(')) continue

    const chestTalent = firstLine(clean(r[6]))
    const backpackTalent = firstLine(clean(r[7]))

    sets.push({
      name,
      coreAttribute: clean(r[2]) || 'Weapon Damage',
      chestTalent,
      backpackTalent,
    })
  }
  return sets
}

// ─── Build Loot Pools ────────────────────────────────────────────────────────

const GEAR_SLOTS = ['Mask', 'Backpack', 'Chest', 'Gloves', 'Holster', 'Kneepads']

function buildLootPools() {
  // Parse named+exotic weapons FIRST to get the exclusion set
  const { named: namedWeapons, exotic: exoticWeapons, allNames: namedExoticNames } =
    parseNamedExoticWeapons()
  const { standard: baseWeapons, namedFromBase } = parseBaseWeapons(namedExoticNames)
  const brands = parseBrandsets()
  const { named: namedGear, exotic: exoticGear } = parseNamedExoticGear()
  const gearsets = parseGearsets()

  const items = []

  // ── REGULAR: Base weapons + brand gear (can drop as common/rare/epic) ──
  for (const w of baseWeapons) {
    items.push({
      name: w.name,
      rarity: 'regular',
      category: w.category,
      subtitle: w.family || w.category,
    })
  }
  for (const brand of brands) {
    for (const slot of GEAR_SLOTS) {
      items.push({
        name: `${brand.name} ${slot}`,
        rarity: 'regular',
        category: slot,
        subtitle: brand.name,
      })
    }
  }

  // ── LEGENDARY (orange/High-End): Named items — weapons + gear ──
  for (const w of [...namedWeapons, ...namedFromBase]) {
    items.push({
      name: w.name,
      rarity: 'legendary',
      category: w.category,
      subtitle: w.talent || w.category,
    })
  }
  for (const g of namedGear) {
    items.push({
      name: g.name,
      rarity: 'legendary',
      category: g.slot,
      subtitle: g.talent || g.brand || g.slot,
    })
  }

  // ── GEARSET (teal): Gearset pieces (set × 6 slots) ──
  for (const set of gearsets) {
    for (const slot of GEAR_SLOTS) {
      items.push({
        name: `${set.name} ${slot}`,
        rarity: 'gearset',
        category: slot,
        subtitle: set.name,
      })
    }
  }

  // ── EXOTIC (cyan): Exotic weapons + gear ──
  for (const w of exoticWeapons) {
    items.push({
      name: w.name,
      rarity: 'exotic',
      category: w.category,
      subtitle: w.talent || w.category,
    })
  }
  for (const g of exoticGear) {
    items.push({
      name: g.name,
      rarity: 'exotic',
      category: g.slot,
      subtitle: g.talent || g.slot,
    })
  }

  return items
}

// ─── Main ────────────────────────────────────────────────────────────────────

const items = buildLootPools()

const counts = {}
for (const item of items) counts[item.rarity] = (counts[item.rarity] || 0) + 1

console.log(`Total items: ${items.length}`)
console.log('By rarity:', counts)

const outPath = join(root, 'src', 'data', 'division2-loot.json')
writeFileSync(outPath, JSON.stringify(items, null, 2))
console.log(`\nWritten to ${outPath}`)
