import 'server-only'

/**
 * Defensive value coercers shared between Division 2 Ashley data layers.
 *
 * Ashley's OpenAPI generator sometimes emits `Record<string, never>` for
 * fields that are actually nullable strings in live data (URLs, perex,
 * authors, etc.). Every fetch helper passes raw DTO fields through these
 * coercers so downstream consumers can rely on well-typed nullable strings,
 * numbers, and string arrays.
 */

/**
 * Coerce a value that *should* be a URL string but may have arrived as a
 * `{ value }` / `{ href }` wrapper, a string, or null. Returns null if no
 * usable URL can be extracted.
 */
export function coerceUrl(value: unknown): string | null {
  if (typeof value === 'string') return value.length > 0 ? value : null
  if (value && typeof value === 'object') {
    const obj = value as Record<string, unknown>
    if (typeof obj.value === 'string') return obj.value || null
    if (typeof obj.href === 'string') return obj.href || null
    if (typeof obj.url === 'string') return obj.url || null
  }
  return null
}

/** Coerce a value that *should* be a plain string. */
export function coerceString(value: unknown): string | null {
  if (typeof value === 'string') return value.length > 0 ? value : null
  if (value && typeof value === 'object') {
    const obj = value as Record<string, unknown>
    if (typeof obj.value === 'string') return obj.value || null
    if (typeof obj.text === 'string') return obj.text || null
  }
  return null
}

/** Coerce a value that *should* be a number (e.g., relevance score). */
export function coerceNumber(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) return value
  if (typeof value === 'string') {
    const n = Number(value)
    return Number.isFinite(n) ? n : null
  }
  return null
}

/** Coerce authors — could be a string, an array of strings, or a `{ name }[]`. */
export function coerceAuthors(value: unknown): string[] {
  if (typeof value === 'string' && value.length > 0) return [value]
  if (!Array.isArray(value)) return []
  return value
    .map((entry) => {
      if (typeof entry === 'string') return entry
      if (entry && typeof entry === 'object') {
        const obj = entry as Record<string, unknown>
        if (typeof obj.name === 'string') return obj.name
        if (typeof obj.username === 'string') return obj.username
      }
      return null
    })
    .filter((n): n is string => typeof n === 'string' && n.length > 0)
}
