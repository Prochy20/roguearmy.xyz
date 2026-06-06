export type LootIconCategory = 'weapon_types' | 'gear_slots' | 'brands'

export function resolveLootIcon(
  slugOrName: string | null | undefined,
): { url: string; category: LootIconCategory } | null {
  if (!slugOrName) return null
  return { url: '/division2/icons/_stub.png', category: 'weapon_types' }
}
