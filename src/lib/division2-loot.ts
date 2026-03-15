import lootData from '@/data/division2-loot.json'
import type { Rarity } from './overlay-drop-config'

export interface LootDrop {
  name: string
  rarity: string
  category: string
  subtitle: string
}

const allItems: LootDrop[] = lootData as LootDrop[]

// "regular" items (base weapons + brand gear) can drop at any of the 3 lower tiers
// (common/rare/epic = Standard/Specialized/Superior in Division 2).
// Fixed-rarity items: legendary (named), gearset, exotic.
const regularItems = allItems.filter((i) => i.rarity === 'regular')

const pools: Record<Rarity, LootDrop[]> = {
  common: regularItems,
  rare: regularItems,
  epic: regularItems,
  legendary: allItems.filter((i) => i.rarity === 'legendary'),
  gearset: allItems.filter((i) => i.rarity === 'gearset'),
  exotic: allItems.filter((i) => i.rarity === 'exotic'),
}

export function rollDivision2Loot(rarity: Rarity): LootDrop {
  const pool = pools[rarity]
  return pool[Math.floor(Math.random() * pool.length)]
}
