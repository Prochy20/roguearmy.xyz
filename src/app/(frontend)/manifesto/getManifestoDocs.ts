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
  }
}

export async function getManifestoDocs(): Promise<Record<ManifestoDocKey, ManifestoDocument>> {
  const payload = await getPayload({ config })
  const manifesto = await payload.findGlobal({ slug: 'manifesto' })

  const docs = {} as Record<ManifestoDocKey, ManifestoDocument>
  for (const key of DOC_ORDER) {
    docs[key] = await transformDocument(key, manifesto[key])
  }

  return docs
}
