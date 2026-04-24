'use client'

import { RichTextRenderer } from '@/components/richtext/RichTextRenderer'
import { MarkdownRenderer } from '@/components/markdown/MarkdownRenderer'
import type { ManifestoDocument } from './types'

interface ManifestoContentProps {
  doc: ManifestoDocument
}

export function ManifestoContent({ doc }: ManifestoContentProps) {
  const updatedDate = doc.version ? `v${doc.version}` : ''

  return (
    <div>
      {/* Document meta line */}
      <div className="font-mono text-[11px] tracking-[0.3em] text-text-muted mb-2 pb-5 border-b border-rga-green/[0.12]">
        DOCUMENT {doc.code}
        {updatedDate && <> · VERSION {updatedDate}</>}
      </div>

      {/* Content rendering */}
      {doc.contentSource === 'wiki' && doc.markdownContent ? (
        <div className="manifesto-content mt-8">
          <MarkdownRenderer content={doc.markdownContent} />
        </div>
      ) : doc.content ? (
        <div className="manifesto-content mt-8">
          <RichTextRenderer data={doc.content} />
        </div>
      ) : (
        <div className="py-20 text-center text-text-muted font-mono text-sm tracking-[0.2em]">
          // NO CONTENT CONFIGURED
        </div>
      )}
    </div>
  )
}
