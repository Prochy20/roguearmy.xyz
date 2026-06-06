import type {
  CollectionAfterReadHook,
  CollectionBeforeChangeHook,
} from 'payload'

const WORDS_PER_MINUTE = 200

/**
 * Extracts plain text from Lexical editor content recursively.
 */
function extractTextFromLexical(node: unknown): string {
  if (!node || typeof node !== 'object') return ''

  const obj = node as Record<string, unknown>

  // If it's a text node, return its text
  if (obj.type === 'text' && typeof obj.text === 'string') {
    return obj.text
  }

  // If it has children, recursively process them
  if (Array.isArray(obj.children)) {
    return obj.children.map(extractTextFromLexical).join(' ')
  }

  // If it's a root node with a children array
  if (obj.root && typeof obj.root === 'object') {
    return extractTextFromLexical(obj.root)
  }

  return ''
}

function computeReadingMinutes(content: unknown): number {
  const text = extractTextFromLexical(content)
  const wordCount = text.trim().split(/\s+/).filter(Boolean).length
  return Math.max(1, Math.ceil(wordCount / WORDS_PER_MINUTE))
}

/**
 * Compute and persist `readingTime` on save for Payload-content articles.
 *
 * Wiki articles (`articleContent.contentSource === 'wiki'`) are skipped —
 * their body lives in Outline, not Payload, so we can't count words here.
 * The afterRead fallback handles that case.
 */
export const calculateReadingTimeBeforeChange: CollectionBeforeChangeHook = ({
  data,
}) => {
  if (!data) return data

  if (data.articleContent?.contentSource === 'wiki') {
    return { ...data, readingTime: null }
  }

  if (!data.articleContent?.content) {
    return { ...data, readingTime: 1 }
  }

  return {
    ...data,
    readingTime: computeReadingMinutes(data.articleContent.content),
  }
}

/**
 * Fallback for documents whose `readingTime` wasn't persisted by the
 * beforeChange hook (legacy rows pre-backfill, or wiki articles where
 * content lives in Outline).
 *
 * Returns the doc unchanged if `readingTime` is already populated — that's
 * what makes list queries cheap once the backfill has run.
 */
export const calculateReadingTime: CollectionAfterReadHook = ({ doc }) => {
  if (doc?.readingTime != null && doc.readingTime > 0) {
    return doc
  }

  // Wiki content not available at this layer; consumers fetch it lazily.
  if (doc?.articleContent?.contentSource === 'wiki') {
    return { ...doc, readingTime: null }
  }

  if (!doc?.articleContent?.content) {
    return { ...doc, readingTime: 1 }
  }

  return {
    ...doc,
    readingTime: computeReadingMinutes(doc.articleContent.content),
  }
}
