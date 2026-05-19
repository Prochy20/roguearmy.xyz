import type { DigestArticle } from './digest.server'

/**
 * Citation transform for digest Markdown bodies.
 *
 * Ashley emits three flavors of citation:
 *
 *   1. Full inline link — `[link text](https://source-url)(ref:UUID)` — the
 *      URL is already in the link parens; the ref marker just tags the
 *      ordinal. Rendered as a real anchor pointing to the source URL. No
 *      `[N]` chip — the body phrase IS the citation, and the bottom-of-page
 *      sources list is the manifest of everything cited.
 *
 *   2. Index-only inline link — `[link text](ref:UUID)` — Ashley supplied no
 *      URL; we look it up from `articles[]` via the ref UUID. Same anchor
 *      output as case 1, again with no chip.
 *
 *   3. Bare marker — `(ref:UUID)` — there's no inline phrase to hyperlink,
 *      so the chip is the marker. Rendered as `<sup>[N]</sup>` that scrolls
 *      to the matching entry in the sources list.
 *
 * Numbering follows Ashley's relevance-desc ordering of `articles[]` — `[1]`
 * is the most relevant article. Anchors emit as raw HTML (rather than
 * rewritten markdown links) so they don't depend on remark's link parser
 * cleanly handling the substitution adjacent to other inline content.
 */

// Matches, in order: optional `[text]`, optional `(http(s)://url)`, required `(ref:UUID)`.
const CITATION_REGEX =
  /(?:\[([^\]]+)\])?(?:\((https?:\/\/[^\s)]+)\))?\(ref:([0-9a-f-]{36})\)/gi

export interface CitationMeta {
  /** 1-based ordinal that matches the sources-list entry id. */
  ordinal: number
  /** Article URL — null if the article has no external link. */
  url: string | null
}

/** UUID → citation metadata. Order in `articles[]` drives the ordinal. */
export function buildCitationIndex(
  articles: readonly DigestArticle[],
): ReadonlyMap<string, CitationMeta> {
  const index = new Map<string, CitationMeta>()
  articles.forEach((article, i) => {
    index.set(article.id, { ordinal: i + 1, url: article.url })
  })
  return index
}

export interface CitationTransformResult {
  /** Markdown with citation markers replaced by anchors / `<sup>` chips. */
  output: string
  /** UUIDs that appeared in the body but were not in `articles[]`. */
  unresolved: string[]
}

/**
 * Walk the markdown and rewrite every citation marker into either an inline
 * anchor (when there's a link phrase) or a numbered chip (when there isn't).
 *
 * Anchors are emitted as raw HTML so they round-trip through rehype-raw and
 * land in react-markdown's component map — where the digest-local `a`
 * override paints them green with an external-link icon. This sidesteps any
 * brittleness in parsing `[text](url)` as a real markdown link when
 * adjacent content (e.g. `<sup>` raw HTML) follows immediately.
 */
export function transformCitationMarkers(
  markdown: string,
  index: ReadonlyMap<string, CitationMeta>,
): CitationTransformResult {
  const unresolved: string[] = []
  const output = markdown.replace(
    CITATION_REGEX,
    (
      _match,
      linkText: string | undefined,
      providedUrl: string | undefined,
      rawId: string,
    ) => {
      const id = rawId.toLowerCase()
      const meta = index.get(id)
      if (!meta) {
        unresolved.push(id)
        // Strip the citation entirely but keep any link text Ashley meant
        // to surface to the reader. Better a phrase with no link than a
        // dangling marker.
        return linkText ?? ''
      }

      // Bare marker: chip-only. The chip itself is the citation — link it
      // straight to the source URL when one exists, fall back to the
      // in-page anchor when it doesn't.
      if (!linkText) {
        return supChip(meta.ordinal, meta.url)
      }

      // Linked marker: phrase becomes the citation. Chip is dropped — the
      // body link is the cite.
      const url = providedUrl ?? meta.url
      if (url) {
        return anchorTag(url, linkText)
      }
      // No URL anywhere — render the phrase as plain text and fall back to
      // a chip so the reader can still trace the source via the sources list.
      return `${linkText}${supChip(meta.ordinal, null)}`
    },
  )
  return { output, unresolved }
}

/**
 * Citation chip — `[N]` superscript anchor. When the article has an external
 * URL, the chip links directly to the source (opens in a new tab). When it
 * doesn't, it falls back to the in-page anchor that scrolls to the matching
 * sources-list entry. The `data-cite-chip` marker tells the digest-local
 * `a` override to render this as a small cyan chip rather than the green
 * external-link treatment regular body links get.
 */
function supChip(ordinal: number, url: string | null): string {
  if (url) {
    return `<sup class="digest-ref" id="ref-${ordinal}-cite"><a href="${escapeAttr(url)}" target="_blank" rel="noopener noreferrer" data-cite-chip>[${ordinal}]</a></sup>`
  }
  return `<sup class="digest-ref" id="ref-${ordinal}-cite"><a href="#ref-${ordinal}" data-cite-chip>[${ordinal}]</a></sup>`
}

function anchorTag(url: string, text: string): string {
  return `<a href="${escapeAttr(url)}" target="_blank" rel="noopener noreferrer">${escapeText(text)}</a>`
}

function escapeAttr(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

function escapeText(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}
