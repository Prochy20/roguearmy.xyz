/**
 * Table of Contents utilities for extracting headings from content.
 */

export interface TOCHeading {
  id: string
  text: string
  level: 1 | 2 | 3
}

/**
 * Generates a URL-safe slug from heading text.
 * Handles special characters, emojis, and ensures uniqueness.
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    // Remove emojis and special unicode characters
    .replace(/[\u{1F600}-\u{1F64F}]/gu, '')
    .replace(/[\u{1F300}-\u{1F5FF}]/gu, '')
    .replace(/[\u{1F680}-\u{1F6FF}]/gu, '')
    .replace(/[\u{2600}-\u{26FF}]/gu, '')
    .replace(/[\u{2700}-\u{27BF}]/gu, '')
    // Replace spaces and underscores with hyphens
    .replace(/[\s_]+/g, '-')
    // Remove non-alphanumeric characters except hyphens
    .replace(/[^a-z0-9-]/g, '')
    // Remove multiple consecutive hyphens
    .replace(/-+/g, '-')
    // Remove leading/trailing hyphens
    .replace(/^-|-$/g, '')
    // Ensure we have at least something
    || 'heading'
}

/**
 * Extracts headings (H1, H2, and H3) from markdown content.
 * Parses `#`, `##`, and `###` patterns from the markdown string.
 */
export function extractHeadingsFromMarkdown(content: string): TOCHeading[] {
  const headings: TOCHeading[] = []
  const lines = content.split('\n')
  const seenIds = new Set<string>()

  for (const line of lines) {
    // Match #, ## and ### headings (but not ####)
    const h1Match = line.match(/^#\s+(.+)$/)
    const h2Match = line.match(/^##\s+(.+)$/)
    const h3Match = line.match(/^###\s+(.+)$/)

    if (h1Match) {
      const text = h1Match[1].trim()
      const id = getUniqueId(slugify(text), seenIds)
      seenIds.add(id)
      headings.push({ id, text, level: 1 })
    } else if (h2Match) {
      const text = h2Match[1].trim()
      const id = getUniqueId(slugify(text), seenIds)
      seenIds.add(id)
      headings.push({ id, text, level: 2 })
    } else if (h3Match) {
      const text = h3Match[1].trim()
      const id = getUniqueId(slugify(text), seenIds)
      seenIds.add(id)
      headings.push({ id, text, level: 3 })
    }
  }

  return headings
}

/**
 * Extracts headings from Payload Lexical editor JSON content.
 * Traverses the Lexical AST to find heading nodes.
 */
export function extractHeadingsFromLexical(content: unknown): TOCHeading[] {
  const headings: TOCHeading[] = []
  const seenIds = new Set<string>()

  if (!content || typeof content !== 'object') {
    return headings
  }

  function extractTextFromNode(node: unknown): string {
    if (!node || typeof node !== 'object') return ''

    const n = node as { text?: string; children?: unknown[] }

    if (typeof n.text === 'string') {
      return n.text
    }

    if (Array.isArray(n.children)) {
      return n.children.map(extractTextFromNode).join('')
    }

    return ''
  }

  function traverseNodes(nodes: unknown[]): void {
    for (const node of nodes) {
      if (!node || typeof node !== 'object') continue

      const n = node as {
        type?: string
        tag?: string
        children?: unknown[]
      }

      // Check if this is a heading node
      if (n.type === 'heading' && (n.tag === 'h1' || n.tag === 'h2' || n.tag === 'h3')) {
        const text = extractTextFromNode(n).trim()
        if (text) {
          const level = n.tag === 'h1' ? 1 : n.tag === 'h2' ? 2 : 3
          const id = getUniqueId(slugify(text), seenIds)
          seenIds.add(id)
          headings.push({ id, text, level })
        }
      }

      // Recursively check children
      if (Array.isArray(n.children)) {
        traverseNodes(n.children)
      }
    }
  }

  const rootContent = content as { root?: { children?: unknown[] } }
  if (rootContent.root?.children) {
    traverseNodes(rootContent.root.children)
  }

  return headings
}

/**
 * Ensures ID uniqueness by appending a number if needed.
 */
function getUniqueId(baseId: string, seenIds: Set<string>): string {
  if (!seenIds.has(baseId)) {
    return baseId
  }

  let counter = 1
  let uniqueId = `${baseId}-${counter}`
  while (seenIds.has(uniqueId)) {
    counter++
    uniqueId = `${baseId}-${counter}`
  }

  return uniqueId
}
