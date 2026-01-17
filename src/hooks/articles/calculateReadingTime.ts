import type { CollectionAfterReadHook } from 'payload'

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

/**
 * Calculates reading time based on content length.
 * Uses approximately 200 words per minute as reading speed.
 *
 * For wiki-linked articles (contentSource === 'wiki'), returns null
 * as the reading time will be calculated on the frontend from the
 * fetched wiki content.
 */
export const calculateReadingTime: CollectionAfterReadHook = async ({ doc }) => {
  // Skip calculation for wiki-linked articles
  // Frontend will calculate from fetched wiki content
  if (doc?.articleContent?.contentSource === 'wiki') {
    return {
      ...doc,
      readingTime: null,
    }
  }

  if (!doc?.articleContent?.content) {
    return {
      ...doc,
      readingTime: 1, // Minimum 1 minute
    }
  }

  const text = extractTextFromLexical(doc.articleContent.content)
  const wordCount = text.trim().split(/\s+/).filter(Boolean).length

  // Calculate reading time at 200 words per minute, minimum 1 minute
  const readingTime = Math.max(1, Math.ceil(wordCount / 200))

  return {
    ...doc,
    readingTime,
  }
}
