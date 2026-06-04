import { getPayload } from 'payload'
import config from '@payload-config'
import type { Manifesto } from '@/payload-types'
import { extractHeadingsFromLexical, extractHeadingsFromMarkdown } from '@/lib/toc'
import { getDocumentContent } from '@/lib/outline'
import type { ManifestoDocument, ManifestoDocKey } from './types'
import { DOC_ORDER } from './types'

type ManifestoTabData = Manifesto['rules']

async function transformDocument(
  key: ManifestoDocKey,
  tab: ManifestoTabData,
): Promise<ManifestoDocument> {
  let markdownContent: string | undefined
  let headings = tab.content
    ? extractHeadingsFromLexical(tab.content)
    : []

  // When wiki is selected, Outline provides defaults for title/updatedAt,
  // but Payload fields always override if filled in.
  let outlineTitle: string | undefined
  let outlineUpdatedAt: string | undefined

  if (tab.contentSource === 'wiki' && tab.outlineDocumentId) {
    try {
      const outlineDoc = await getDocumentContent(tab.outlineDocumentId)
      markdownContent = outlineDoc.text
      headings = extractHeadingsFromMarkdown(markdownContent)
      outlineTitle = outlineDoc.title
      outlineUpdatedAt = outlineDoc.updatedAt
    } catch {
      // Outline unavailable — fall back to Payload fields
    }
  }

  let simplifiedContentSource: 'payload' | 'wiki' | undefined
  let simplifiedContent: ManifestoDocument['simplifiedContent']
  let simplifiedMarkdownContent: string | undefined
  let simplifiedHeadings: ManifestoDocument['simplifiedHeadings']

  if (key === 'rules') {
    const rulesTab = tab as Manifesto['rules']
    simplifiedContentSource = rulesTab.simplifiedContentSource ?? undefined

    if (rulesTab.simplifiedContentSource === 'wiki' && rulesTab.simplifiedOutlineDocumentId) {
      try {
        const simpDoc = await getDocumentContent(rulesTab.simplifiedOutlineDocumentId)
        simplifiedMarkdownContent = simpDoc.text
        simplifiedHeadings = extractHeadingsFromMarkdown(simplifiedMarkdownContent)
      } catch {
        // Outline unavailable — no simplified content
      }
    } else if (rulesTab.simplifiedContent) {
      simplifiedContent = rulesTab.simplifiedContent as ManifestoDocument['simplifiedContent']
      simplifiedHeadings = extractHeadingsFromLexical(rulesTab.simplifiedContent)
    }
  }

  return {
    key,
    code: tab.code,
    kicker: tab.kicker ?? '',
    title: tab.title || outlineTitle || '',
    subtitle: tab.subtitle ?? '',
    version: tab.version ?? '1.0',
    updatedAt: outlineUpdatedAt,
    contentSource: tab.contentSource ?? 'payload',
    content: tab.contentSource !== 'wiki' ? (tab.content ?? undefined) : undefined,
    markdownContent,
    headings,
    simplifiedContentSource,
    simplifiedContent,
    simplifiedMarkdownContent,
    simplifiedHeadings,
  }
}

export async function getManifestoDocs(): Promise<Record<ManifestoDocKey, ManifestoDocument>> {
  const payload = await getPayload({ config })
  const manifesto = await payload.findGlobal({ slug: 'manifesto' })

  const transformed = await Promise.all(
    DOC_ORDER.map((key) => transformDocument(key, manifesto[key])),
  )

  const docs = {} as Record<ManifestoDocKey, ManifestoDocument>
  for (let i = 0; i < DOC_ORDER.length; i++) {
    docs[DOC_ORDER[i]] = transformed[i]
  }

  return docs
}
