import { resolveLootIcon } from '@/lib/division2/assetMap.server'

interface LootIconProps {
  /** Either field works — both feed the same normalized lookup. */
  slug?: string | null
  name?: string | null
  size?: number
  className?: string
}

/**
 * Renders a Division 2 icon for a loot type (weapon class, gear slot, or
 * brand). Falls back to nothing when the asset map has no match — the
 * adjacent text label is the source of truth, the icon is decoration.
 *
 * Server component — pulls from the static asset map at request time.
 * No Next/Image: these are tiny pre-sized PNGs and Next image optimization
 * would add overhead without saving bytes.
 */
export function LootIcon({ slug, name, size = 24, className = '' }: LootIconProps) {
  const icon = resolveLootIcon(slug ?? name ?? null)
  if (!icon) return null
  return (
    <img
      src={icon.url}
      alt=""
      aria-hidden
      width={size}
      height={size}
      className={`shrink-0 ${className}`}
      style={{ width: size, height: size, imageRendering: 'auto' }}
    />
  )
}
