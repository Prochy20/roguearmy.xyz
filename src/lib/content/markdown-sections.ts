/**
 * Content-agnostic markdown sectioning + word-count helpers used by the
 * reader pipeline. Originally lived in `lib/division2/briefing.server.ts`;
 * extracted here so blog articles (wiki markdown) can use the same
 * promote-H1 → enumerate → inject anchors transform that briefings use.
 *
 * No briefing-specific knowledge in this module. The `ReaderSection` shape is
 * what the ToC and the body share — id + display number + plain text.
 */

export interface ReaderSection {
  /** 1-based section number. */
  num: number
  /** Two-digit zero-padded display ("01", "02"). */
  numLabel: string
  /** Plain heading text from the H2 line. */
  text: string
  /** DOM id used by ToC anchors and the heading element. */
  id: string
}

/** Heading level used to drive section enumeration. */
export type SectionLevel = 2 | 3

export interface EnumeratedSections {
  /** The level that produced these sections (h2 if any present, else h3). */
  level: SectionLevel
  sections: ReaderSection[]
}

/**
 * Promote every ATX `# Heading` in the body to `## Heading`.
 *
 * Rationale: the page chrome (title block) already renders the document title
 * as the document-level H1, so any `# Heading` in the body should read as a
 * top-level section, not a competing document title. By pre-promoting H1 →
 * H2, the existing section enumeration / ToC pipeline picks them up
 * naturally and the body never renders two H1s.
 *
 * Fenced-code blocks are skipped so heading-looking lines inside code samples
 * don't get rewritten.
 */
export function promoteH1ToH2(markdown: string): string {
  if (!markdown) return markdown
  const lines = markdown.split('\n')
  let inFence = false
  return lines
    .map((line) => {
      if (line.startsWith('```')) {
        inFence = !inFence
        return line
      }
      if (inFence) return line
      // `/^#\s/` matches `# Title` but NOT `## Title` (after the first `#` is
      // another `#`, not whitespace). Prepending an extra `#` produces `## …`.
      return /^#\s/.test(line) ? '#' + line : line
    })
    .join('\n')
}

/**
 * Approximate word count from rendered markdown. Strips markdown syntax
 * (heading hashes, list bullets, fences, image/link wrappers) and HTML tags
 * before splitting on whitespace. Good enough to drive a "~N min read" label;
 * a real linguistic counter would be overkill here.
 */
export function countMarkdownWords(markdown: string): number {
  if (!markdown) return 0
  const stripped = markdown
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/`[^`]*`/g, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/^[-*+>]\s+/gm, '')
    .replace(/[*_~]+/g, '')
  return stripped.split(/\s+/).filter(Boolean).length
}

/**
 * Walk the markdown body and emit a section manifest from headings.
 *
 * Tries H2s first — that's the canonical section level for long-form bodies.
 * If none exist, falls back to H3s so documents authored with `#` for title
 * and `###` for sections still get a ToC. When neither level has any
 * headings, returns an empty manifest at the default H2 level.
 *
 * Numbering is positional within the chosen level (first matching heading
 * becomes 01). Fenced-code blocks are skipped so heading-looking lines inside
 * code samples don't get enumerated.
 */
export function enumerateSections(markdown: string): EnumeratedSections {
  const h2 = enumerateHeadingsAtLevel(markdown, 2)
  if (h2.length > 0) return { level: 2, sections: h2 }
  const h3 = enumerateHeadingsAtLevel(markdown, 3)
  return { level: 3, sections: h3 }
}

/**
 * Legacy alias retained for external callers — defers to `enumerateSections`
 * and returns only the H2 set (no H3 fallback). Prefer `enumerateSections`
 * for new code.
 */
export function enumerateH2Sections(markdown: string): ReaderSection[] {
  return enumerateHeadingsAtLevel(markdown, 2)
}

function enumerateHeadingsAtLevel(
  markdown: string,
  level: SectionLevel,
): ReaderSection[] {
  if (!markdown) return []
  const pattern =
    level === 2 ? /^##\s+(.+?)\s*#*\s*$/ : /^###\s+(.+?)\s*#*\s*$/
  const sections: ReaderSection[] = []
  const lines = markdown.split('\n')
  let inFence = false
  let counter = 0
  for (const line of lines) {
    if (line.startsWith('```')) {
      inFence = !inFence
      continue
    }
    if (inFence) continue
    const match = line.match(pattern)
    if (!match) continue
    counter++
    const num = counter
    const numLabel = String(num).padStart(2, '0')
    sections.push({
      num,
      numLabel,
      text: match[1].trim(),
      id: `sec-${numLabel}`,
    })
  }
  return sections
}

/**
 * Rewrite each section-level heading into an inline raw HTML element carrying
 * the section id and `data-sec-num` attribute. The shared markdown renderer
 * (which routes raw HTML through rehype-raw) then renders the matching h2/h3
 * component with the numbered prefix chrome.
 *
 * **Blank-line padding is critical.** CommonMark's "HTML block (type 6)"
 * rule says: a line starting with `<h2` (or other block tags) opens an HTML
 * block, and that block only terminates on a *blank line*. Without blank
 * lines around our injection, the body prose on the next line gets absorbed
 * INTO the HTML block and rendered as raw text instead of going through the
 * `p` / `li` / `strong` markdown components. That's why we surround the
 * rewritten heading with empty lines before and after — it isolates the HTML
 * block so following prose is parsed as proper markdown.
 *
 * Fenced-code blocks are skipped so heading-looking lines inside code samples
 * don't get rewritten.
 */
export function injectSectionAnchors(
  markdown: string,
  sections: readonly ReaderSection[],
  level: SectionLevel,
): string {
  if (sections.length === 0) return markdown
  const queue = [...sections]
  const pattern =
    level === 2 ? /^##\s+(.+?)\s*#*\s*$/ : /^###\s+(.+?)\s*#*\s*$/
  const tag = level === 2 ? 'h2' : 'h3'
  const lines = markdown.split('\n')
  let inFence = false
  const out: string[] = []
  for (const line of lines) {
    if (line.startsWith('```')) {
      inFence = !inFence
      out.push(line)
      continue
    }
    if (inFence) {
      out.push(line)
      continue
    }
    const match = line.match(pattern)
    if (!match) {
      out.push(line)
      continue
    }
    const section = queue.shift()
    if (!section) {
      out.push(line)
      continue
    }
    const escaped = escapeHtml(section.text)
    if (out.length > 0 && out[out.length - 1] !== '') {
      out.push('')
    }
    out.push(
      `<${tag} id="${section.id}" data-sec-num="${section.numLabel}">${escaped}</${tag}>`,
    )
    out.push('')
  }
  return out.join('\n')
}

/**
 * Legacy alias for the H2-only path. Prefer `injectSectionAnchors` for new
 * callers — it accepts a `level` argument.
 */
export function injectH2SectionAnchors(
  markdown: string,
  sections: readonly ReaderSection[],
): string {
  return injectSectionAnchors(markdown, sections, 2)
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

/**
 * Convenience: run the full reader-body transform pipeline.
 *
 * Pre-shapes a raw markdown string for the shared reader body renderer:
 *  1. Promote H1 → H2 so the body never competes with the title block.
 *  2. Enumerate sections (H2, fallback to H3).
 *  3. Inject section anchors so the body and ToC share IDs by construction.
 *
 * Returns the transformed markdown alongside the section manifest. Word count
 * is computed off the *promoted* markdown so word-strip helpers don't have to
 * special-case the injected raw HTML blocks.
 */
export function transformReaderBody(markdown: string): {
  transformed: string
  sections: ReaderSection[]
  wordCount: number
} {
  const promoted = promoteH1ToH2(markdown)
  const { level, sections } = enumerateSections(promoted)
  const transformed = injectSectionAnchors(promoted, sections, level)
  const wordCount = countMarkdownWords(promoted)
  return { transformed, sections, wordCount }
}
