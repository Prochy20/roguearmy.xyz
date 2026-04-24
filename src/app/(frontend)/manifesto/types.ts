import type { SerializedEditorState } from '@payloadcms/richtext-lexical/lexical'
import type { TOCHeading } from '@/lib/toc'

export type ManifestoDocKey = 'rules' | 'privacy' | 'terms'

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
}

export const DOC_ORDER: ManifestoDocKey[] = ['rules', 'privacy', 'terms']

export const DOC_LABELS: Record<ManifestoDocKey, string> = {
  rules: 'Rules',
  privacy: 'Privacy Policy',
  terms: 'Terms of Use',
}
