'use client'

import type {
  DefaultNodeTypes,
  SerializedBlockNode,
  SerializedLinkNode,
} from '@payloadcms/richtext-lexical'
import type { SerializedEditorState, SerializedLexicalNode } from '@payloadcms/richtext-lexical/lexical'
import type { ReactNode } from 'react'

import {
  type JSXConvertersFunction,
  LinkJSXConverter,
} from '@payloadcms/richtext-lexical/react'

import type { CalloutBlockType, CodeBlockType, MermaidBlockType, SocialEmbedBlockType, VideoEmbedBlockType } from '@/payload-types'
import { Callout } from '@/components/markdown/Callout'
import { LexicalCodeBlock } from './LexicalCodeBlock'
import { MermaidDiagram } from '@/components/markdown/MermaidDiagram'
import { SocialEmbed } from './SocialEmbed'
import { VideoEmbed } from './VideoEmbed'
import { slugify } from '@/lib/toc'

// Extend node types to include our custom blocks
type NodeTypes =
  | DefaultNodeTypes
  | SerializedBlockNode<CalloutBlockType | CodeBlockType | MermaidBlockType | SocialEmbedBlockType | VideoEmbedBlockType>

/**
 * Extracts text from Lexical children nodes
 */
function extractTextFromLexicalChildren(children?: SerializedLexicalNode[]): string {
  if (!children || !Array.isArray(children)) return ''

  return children.map((child) => {
    // Text node
    if ('text' in child && typeof child.text === 'string') {
      return child.text
    }
    // Node with children
    if ('children' in child && Array.isArray(child.children)) {
      return extractTextFromLexicalChildren(child.children as SerializedLexicalNode[])
    }
    return ''
  }).join('')
}

/**
 * Handle internal links for the LinkJSXConverter
 */
const internalDocToHref = ({ linkNode }: { linkNode: SerializedLinkNode }) => {
  const doc = linkNode.fields.doc
  if (!doc) return '#'

  const { relationTo, value } = doc
  if (typeof value !== 'object' || !value) {
    return '#'
  }

  const slug = (value as { slug?: string }).slug

  switch (relationTo) {
    case 'articles': {
      // Extract topic slug from the article's categorization
      const article = value as {
        slug?: string
        categorization?: {
          topic?: { slug?: string } | string
        }
      }
      const topic = article.categorization?.topic
      const topicSlug = typeof topic === 'object' && topic?.slug
        ? topic.slug
        : 'article' // Fallback if topic not populated
      return `/blog/${topicSlug}/${slug}`
    }
    case 'games':
      return `/games/${slug}`
    default:
      return `/${relationTo}/${slug}`
  }
}

/**
 * Corner bracket decoration component
 */
function Corner({
  position,
  colorClass = 'text-rga-cyan/40',
}: {
  position: 'tl' | 'tr' | 'bl' | 'br'
  colorClass?: string
}) {
  const rotations = {
    tl: '',
    tr: 'rotate-90',
    bl: '-rotate-90',
    br: 'rotate-180',
  }
  const positions = {
    tl: 'top-0 left-0',
    tr: 'top-0 right-0',
    bl: 'bottom-0 left-0',
    br: 'bottom-0 right-0',
  }

  return (
    <div className={`absolute ${positions[position]} ${rotations[position]}`}>
      <svg
        width="12"
        height="12"
        viewBox="0 0 12 12"
        fill="none"
        className={colorClass}
      >
        <path d="M0 12V0H12" stroke="currentColor" strokeWidth="1.5" fill="none" />
      </svg>
    </div>
  )
}

/**
 * External link icon component
 */
function ExternalLinkIcon() {
  return (
    <svg
      className="inline-block w-3 h-3 ml-1 -mt-0.5"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
      />
    </svg>
  )
}

/**
 * JSX converters that match markdownComponents.tsx styling
 */
export const jsxConverters: JSXConvertersFunction<NodeTypes> = ({ defaultConverters }) => ({
  ...defaultConverters,
  ...LinkJSXConverter({ internalDocToHref }),

  // ==================== HEADINGS ====================

  heading: ({ node, nodesToJSX }) => {
    const children = nodesToJSX({ nodes: node.children })
    const text = extractTextFromLexicalChildren(node.children as SerializedLexicalNode[])
    const id = slugify(text)

    switch (node.tag) {
      case 'h1':
        return (
          <div className="mt-16 mb-8 first:mt-0">
            <div className="w-12 h-px bg-rga-green/40 mb-4" />
            <h1
              id={id}
              className="font-display text-2xl md:text-3xl lg:text-4xl text-white tracking-wide scroll-mt-28"
            >
              {children}
            </h1>
          </div>
        )
      case 'h2':
        return (
          <h2
            id={id}
            className="font-display text-xl md:text-2xl text-rga-cyan mt-12 mb-5 flex items-center gap-3 scroll-mt-28"
          >
            <span className="w-8 h-px bg-rga-cyan/50" />
            {children}
          </h2>
        )
      case 'h3':
        return (
          <h3
            id={id}
            className="font-bold text-lg md:text-xl text-white mt-8 mb-4 tracking-wide scroll-mt-28"
          >
            {children}
          </h3>
        )
      case 'h4':
        return (
          <h4 className="font-semibold text-base md:text-lg text-rga-cyan/90 mt-6 mb-3">
            {children}
          </h4>
        )
      case 'h5':
        return (
          <h5 className="font-medium text-base text-white/90 mt-4 mb-2">
            {children}
          </h5>
        )
      case 'h6':
        return (
          <h6 className="font-medium text-sm text-rga-gray mt-4 mb-2 uppercase tracking-wider">
            {children}
          </h6>
        )
      default:
        return <>{children}</>
    }
  },

  // ==================== PARAGRAPH ====================

  paragraph: ({ node, nodesToJSX }) => {
    const children = nodesToJSX({ nodes: node.children })
    return (
      <p className="text-text-secondary text-base md:text-lg leading-[1.8] mb-6">
        {children}
      </p>
    )
  },

  // ==================== LISTS ====================

  list: ({ node, nodesToJSX }) => {
    const children = nodesToJSX({ nodes: node.children })

    if (node.listType === 'number') {
      return (
        <ol className="space-y-3 text-text-secondary mb-8 pl-0 list-none counter-reset-[list-counter]">
          {children}
        </ol>
      )
    }

    // Check or bullet list
    return (
      <ul className="space-y-3 text-text-secondary mb-8 pl-0 list-none">
        {children}
      </ul>
    )
  },

  listitem: ({ node, nodesToJSX }) => {
    const children = nodesToJSX({ nodes: node.children })

    // Check if this is a task list item
    if (node.checked !== undefined) {
      return (
        <li className="flex items-start gap-3 text-base md:text-lg leading-relaxed list-none">
          <span
            className={`
              inline-flex items-center justify-center w-5 h-5 mr-2 rounded border-2 flex-shrink-0 mt-0.5
              ${
                node.checked
                  ? 'bg-rga-green/20 border-rga-green text-rga-green'
                  : 'bg-transparent border-rga-gray/50'
              }
            `}
          >
            {node.checked && (
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            )}
          </span>
          <span>{children}</span>
        </li>
      )
    }

    return (
      <li className="flex items-start gap-3 text-base md:text-lg leading-relaxed">
        <span className="text-rga-green mt-2 flex-shrink-0">
          <span className="block w-1.5 h-1.5 bg-rga-green rounded-full" />
        </span>
        <span>{children}</span>
      </li>
    )
  },

  // ==================== LINKS ====================

  link: ({ node, nodesToJSX }) => {
    const children = nodesToJSX({ nodes: node.children })
    const url = node.fields.url || '#'
    const isExternal = url.startsWith('http')
    const newTab = node.fields.newTab

    return (
      <a
        href={url}
        className="text-rga-cyan hover:text-rga-green transition-colors underline underline-offset-2 decoration-rga-cyan/30 hover:decoration-rga-green/50"
        {...((isExternal || newTab) && {
          target: '_blank',
          rel: 'noopener noreferrer',
        })}
      >
        {children}
        {isExternal && <ExternalLinkIcon />}
      </a>
    )
  },

  autolink: ({ node, nodesToJSX }) => {
    const children = nodesToJSX({ nodes: node.children })
    const url = node.fields.url || '#'
    const isExternal = url.startsWith('http')

    return (
      <a
        href={url}
        className="text-rga-cyan hover:text-rga-green transition-colors underline underline-offset-2 decoration-rga-cyan/30 hover:decoration-rga-green/50"
        {...(isExternal && {
          target: '_blank',
          rel: 'noopener noreferrer',
        })}
      >
        {children}
        {isExternal && <ExternalLinkIcon />}
      </a>
    )
  },

  // ==================== QUOTE ====================

  quote: ({ node, nodesToJSX }) => {
    const children = nodesToJSX({ nodes: node.children })
    return (
      <blockquote className="my-6 border-l-4 border-rga-green bg-bg-surface/50 py-3 px-5 text-rga-gray italic rounded-r-lg">
        {children}
      </blockquote>
    )
  },

  // ==================== TABLE ====================

  table: ({ node, nodesToJSX }) => {
    const children = nodesToJSX({ nodes: node.children })

    return (
      <div className="relative my-10 py-5 px-4 group">
        {/* Corner brackets */}
        <Corner position="tl" />
        <Corner position="tr" />
        <Corner position="bl" />
        <Corner position="br" />

        {/* Label */}
        <div className="absolute -top-2 left-1/2 -translate-x-1/2 px-2 bg-bg-primary">
          <span className="text-[9px] font-mono uppercase tracking-[0.15em] text-rga-cyan/30">
            Table
          </span>
        </div>

        {/* Table container */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            {children}
          </table>
        </div>
      </div>
    )
  },

  tablerow: ({ node, nodesToJSX }) => {
    const children = nodesToJSX({ nodes: node.children })
    return (
      <tr className="border-b border-rga-green/5 last:border-b-0 hover:bg-rga-green/[0.02] transition-colors">
        {children}
      </tr>
    )
  },

  tablecell: ({ node, nodesToJSX }) => {
    const children = nodesToJSX({ nodes: node.children })

    if (node.headerState > 0) {
      return (
        <th className="px-4 py-3 text-left font-mono font-medium text-rga-cyan text-xs uppercase tracking-wider border-b border-rga-cyan/20">
          {children}
        </th>
      )
    }

    return (
      <td className="px-4 py-3 text-text-secondary text-sm">
        {children}
      </td>
    )
  },

  // ==================== HORIZONTAL RULE ====================

  horizontalrule: () => (
    <div className="my-14 mx-auto max-w-xs h-px bg-linear-to-r from-transparent via-rga-gray/20 to-transparent" />
  ),

  // ==================== TEXT FORMATTING ====================

  text: ({ node }) => {
    let text: ReactNode = node.text

    // Apply formatting
    if (node.format & 1) {
      // Bold
      text = <strong className="text-white font-medium mx-[0.1em]">{text}</strong>
    }
    if (node.format & 2) {
      // Italic
      text = <em className="text-rga-gray italic">{text}</em>
    }
    if (node.format & 4) {
      // Strikethrough
      text = <del className="text-rga-gray/60 line-through decoration-rga-gray/40">{text}</del>
    }
    if (node.format & 8) {
      // Underline
      text = <u className="underline underline-offset-2 decoration-rga-cyan/30">{text}</u>
    }
    if (node.format & 16) {
      // Code (inline)
      text = (
        <code className="px-2 py-1 bg-bg-surface/80 text-rga-magenta rounded border border-rga-magenta/20 text-sm font-mono">
          {text}
        </code>
      )
    }
    if (node.format & 32) {
      // Subscript
      text = <sub>{text}</sub>
    }
    if (node.format & 64) {
      // Superscript
      text = <sup>{text}</sup>
    }

    return <>{text}</>
  },

  // ==================== UPLOAD (Images) ====================

  upload: ({ node }) => {
    // Handle image uploads
    if (node.relationTo === 'media') {
      const uploadDoc = node.value
      if (typeof uploadDoc !== 'object' || !uploadDoc) {
        return null
      }

      const { alt, url } = uploadDoc as { alt?: string; url?: string }

      return (
        <figure className="my-8">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={url}
            alt={alt || ''}
            loading="lazy"
            className="rounded-lg border border-rga-green/20 w-full shadow-lg shadow-rga-green/5"
          />
          {alt && (
            <figcaption className="mt-3 text-center text-sm text-rga-gray italic">
              {alt}
            </figcaption>
          )}
        </figure>
      )
    }

    return null
  },

  // ==================== CUSTOM BLOCKS ====================

  blocks: {
    callout: ({ node }) => {
      const { type, title, content } = node.fields

      // We need to render the nested richText content
      // For now, extract text from the content for simple rendering
      // In a more complete implementation, you'd recursively render
      return (
        <Callout
          type={type as 'info' | 'warning' | 'tip' | 'success' | 'danger' | 'error' | 'note'}
          title={title || undefined}
        >
          <RichTextContent data={content} />
        </Callout>
      )
    },

    codeBlock: ({ node }) => {
      const { language, code } = node.fields
      return <LexicalCodeBlock code={code} language={language} />
    },

    mermaid: ({ node }) => {
      const { code } = node.fields
      return <MermaidDiagram code={code} />
    },

    socialEmbed: ({ node }) => {
      const { url, caption } = node.fields
      return <SocialEmbed url={url} caption={caption} />
    },

    videoEmbed: ({ node }) => {
      const { url, title } = node.fields
      return <VideoEmbed url={url} title={title} />
    },
  },
})

/**
 * Helper component to render nested RichText content (for callout blocks)
 */
import { RichText } from '@payloadcms/richtext-lexical/react'

function RichTextContent({ data }: { data: SerializedEditorState | null | undefined }) {
  if (!data) return null
  return <RichText data={data} converters={jsxConverters} />
}
