import type { SerializedEditorState } from '@payloadcms/richtext-lexical/lexical'
import type { TOCHeading } from '@/lib/toc'

export type ManifestoDocKey = 'rules' | 'privacy' | 'terms'

export type DifficultyMode = 'casual' | 'hardcore'

export interface ManifestoDocument {
  key: ManifestoDocKey
  code: string
  kicker: string
  title: string
  subtitle: string
  version: string
  updatedAt?: string
  contentSource: 'payload' | 'wiki'
  content?: SerializedEditorState
  markdownContent?: string
  headings: TOCHeading[]
  /** Simplified content for CASUAL mode (rules only) */
  simplifiedContentSource?: 'payload' | 'wiki'
  simplifiedContent?: SerializedEditorState
  simplifiedMarkdownContent?: string
  simplifiedHeadings?: TOCHeading[]
}

export const DOC_ORDER: ManifestoDocKey[] = ['rules', 'privacy', 'terms']
