'use client'

import type {
  DefaultNodeTypes,
  SerializedBlockNode,
  SerializedLinkNode,
} from '@payloadcms/richtext-lexical'
import type { SerializedLexicalNode } from '@payloadcms/richtext-lexical/lexical'
import type { ReactNode } from 'react'

import {
  type JSXConvertersFunction,
  LinkJSXConverter,
  RichText,
} from '@payloadcms/richtext-lexical/react'

import type { CalloutBlockType, CodeBlockType, MermaidBlockType, SocialEmbedBlockType, TrelloCardBlockType, VideoEmbedBlockType } from '@/payload-types'
import { LexicalCodeBlock } from './LexicalCodeBlock'
import { MermaidDiagram } from '@/components/content/markdown/MermaidDiagram'
import { SocialEmbed } from './SocialEmbed'
import { TrelloCard } from './TrelloCard'
import { VideoEmbed } from './VideoEmbed'
import { slugify, getUniqueId } from '@/lib/toc'
import { ACCENT_TOKENS, type AccentName } from '@/components/content/reader/accent'
import {
  ReaderImageFrame,
  ReaderCalloutBlock,
  type CalloutType,
} from '@/components/content/reader/readerMarkdownComponents'

// Extend node types to include our custom blocks
type NodeTypes =
  | DefaultNodeTypes
  | SerializedBlockNode<CalloutBlockType | CodeBlockType | MermaidBlockType | SocialEmbedBlockType | TrelloCardBlockType | VideoEmbedBlockType>

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
      const article = value as {
        slug?: string
        categorization?: {
          topic?: { slug?: string } | string
        }
      }
      const topic = article.categorization?.topic
      const topicSlug = typeof topic === 'object' && topic?.slug
        ? topic.slug
        : 'article'
      return `/blog/${topicSlug}/${slug}`
    }
    case 'games':
      return `/games/${slug}`
    default:
      return `/${relationTo}/${slug}`
  }
}

/**
 * External-link icon — sized to baseline-align with surrounding prose; uses
 * `currentColor` so it tracks the link's color through hover transitions.
 */
function ExternalLinkIcon() {
  return (
    <svg
      aria-hidden
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="ml-0.5 -mt-0.5 inline-block h-[0.8em] w-[0.8em] align-baseline"
    >
      <path d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
    </svg>
  )
}

export interface BuildConvertersOptions {
  /** Page accent — drives heading ordinals, frame ticks, callout quote pill. */
  accent?: AccentName
  /**
   * Slugified-id → ordinal-label map (e.g. "the-new-build-meta" → "01"). When
   * provided, h2 headings (and h3 fallback) get stamped with `data-sec-num`
   * and render with the reader's display ordinal chrome. When omitted,
   * headings render quietly without ordinals.
   */
  sectionMap?: ReadonlyMap<string, string>
}

/**
 * Build the Lexical JSX converters. Threading the page `accent` and the
 * `sectionMap` lets the body match the markdown surface: numbered ordinals,
 * cyber-framed images, accent-driven callout pills, and the four-flavor link
 * dispatcher.
 *
 * The renderer-level visual identity (heading ordinals, framed images,
 * callout block) is shared with `readerMarkdownComponents.tsx` via the
 * `ReaderImageFrame` and `ReaderCalloutBlock` primitives — markdown and
 * Lexical render through one source of truth.
 */
export function buildConverters({
  accent = 'green',
  sectionMap,
}: BuildConvertersOptions = {}): JSXConvertersFunction<NodeTypes> {
  const a = ACCENT_TOKENS[accent]
  // Mirror the dedup pass `extractHeadingsFromLexical` runs at section-time so
  // duplicate heading text gets the same `slug`, `slug-1`, `slug-2` sequence
  // in the DOM as in the section manifest. Without this, the ToC anchors for
  // duplicates point at non-existent ids, and the ordinal lookup falls back
  // to the first instance.
  const headingSeenIds = new Set<string>()

  /**
   * Renders an `<a>` based on the link's URL shape. Mirrors the markdown
   * link dispatcher:
   *   1. Hash anchors (`#…`)        — in-document jumps, no icon.
   *   2. External (http/https)      — accent-aware underline + ExternalLinkIcon.
   *   3. Internal / relative        — quiet cyan underline.
   * Citation chips (`data-cite-chip`) only appear in digest markdown content
   * and never in Lexical, so the chip branch isn't reachable here.
   */
  function renderLink({
    url,
    children,
    newTab,
  }: {
    url: string
    children: ReactNode
    newTab: boolean
  }): ReactNode {
    if (url.startsWith('#')) {
      return (
        <a href={url} className="text-rga-cyan/85 transition-colors hover:text-rga-cyan">
          {children}
        </a>
      )
    }
    const isExternal = /^https?:\/\//i.test(url)
    if (isExternal) {
      return (
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-rga-green underline decoration-rga-green/30 underline-offset-2 transition-colors hover:text-rga-green/85 hover:decoration-rga-green/60"
        >
          {children}
          <ExternalLinkIcon />
        </a>
      )
    }
    return (
      <a
        href={url}
        {...(newTab ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
        className="text-rga-cyan underline decoration-rga-cyan/30 underline-offset-2 transition-colors hover:text-rga-green hover:decoration-rga-green/50"
      >
        {children}
      </a>
    )
  }

  return ({ defaultConverters }) => ({
    ...defaultConverters,
    ...LinkJSXConverter({ internalDocToHref }),

    // ==================== HEADINGS ====================

    heading: ({ node, nodesToJSX }) => {
      const children = nodesToJSX({ nodes: node.children })
      const text = extractTextFromLexicalChildren(node.children as SerializedLexicalNode[])
      const id = getUniqueId(slugify(text), headingSeenIds)
      headingSeenIds.add(id)
      const secNum = sectionMap?.get(id) ?? null

      // h1 + h2 (and h3 if it earned a section number) render as
      // section-level — ordinal + display title.
      const isSectionLevel =
        node.tag === 'h1' || node.tag === 'h2' || (node.tag === 'h3' && !!secNum)

      if (isSectionLevel) {
        const Tag = node.tag === 'h1' ? 'h1' : node.tag === 'h2' ? 'h2' : 'h3'
        return (
          <Tag
            id={id}
            data-sec-num={secNum ?? undefined}
            className="mt-14 mb-6 flex items-start gap-4 scroll-mt-28 first:mt-0 sm:gap-5"
          >
            {secNum && (
              <span
                className={`shrink-0 pt-1 font-mono text-[14px] tabular-nums tracking-[0.15em] ${a.text} sm:text-[15px]`}
                style={{ textShadow: a.textGlow }}
              >
                {secNum}
              </span>
            )}
            <span
              className="break-words font-display uppercase leading-[0.95] text-text-primary"
              style={{
                fontSize: 'clamp(22px, 3vw, 34px)',
                textShadow: '0 0 24px rgba(255,255,255,0.05)',
              }}
            >
              {children}
            </span>
          </Tag>
        )
      }

      // h3 without section number — quieter sub-heading under a numbered section.
      if (node.tag === 'h3') {
        return (
          <h3
            id={id}
            className="mt-10 mb-4 scroll-mt-28 font-display text-lg uppercase tracking-wide text-text-primary sm:text-xl"
          >
            {children}
          </h3>
        )
      }
      if (node.tag === 'h4') {
        return (
          <h4 id={id} className="mt-8 mb-3 font-semibold text-base md:text-lg text-text-primary">
            {children}
          </h4>
        )
      }
      if (node.tag === 'h5') {
        return (
          <h5 id={id} className="mt-6 mb-2 font-medium text-base text-text-primary/90">
            {children}
          </h5>
        )
      }
      if (node.tag === 'h6') {
        return (
          <h6
            id={id}
            className="mt-5 mb-2 font-mono text-sm uppercase tracking-wider text-text-muted"
          >
            {children}
          </h6>
        )
      }
      return <>{children}</>
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

      return (
        <ul className="space-y-3 text-text-secondary mb-8 pl-0 list-none">
          {children}
        </ul>
      )
    },

    listitem: ({ node, nodesToJSX }) => {
      const children = nodesToJSX({ nodes: node.children })

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
          <span className={`mt-2 flex-shrink-0 ${a.text}`}>
            <span className={`block h-1.5 w-1.5 rounded-full ${a.bg}`} />
          </span>
          <span>{children}</span>
        </li>
      )
    },

    // ==================== LINKS (4-flavor dispatcher) ====================

    link: ({ node, nodesToJSX }) => {
      const children = nodesToJSX({ nodes: node.children })
      const url = node.fields.url || '#'
      return renderLink({ url, children, newTab: !!node.fields.newTab })
    },

    autolink: ({ node, nodesToJSX }) => {
      const children = nodesToJSX({ nodes: node.children })
      const url = node.fields.url || '#'
      return renderLink({ url, children, newTab: false })
    },

    // ==================== QUOTE ====================

    quote: ({ node, nodesToJSX }) => {
      const children = nodesToJSX({ nodes: node.children })
      return (
        <ReaderCalloutBlock type="quote" accent={accent}>
          {children}
        </ReaderCalloutBlock>
      )
    },

    // ==================== TABLE ====================

    table: ({ node, nodesToJSX }) => {
      const children = nodesToJSX({ nodes: node.children })
      return (
        <div className={`relative my-10 border ${a.borderFaint} bg-void/40 backdrop-blur-sm`}>
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
        <tr className="border-b border-text-muted/10 last:border-b-0 transition-colors">
          {children}
        </tr>
      )
    },

    tablecell: ({ node, nodesToJSX }) => {
      const children = nodesToJSX({ nodes: node.children })
      if (node.headerState > 0) {
        return (
          <th
            className={`border-b ${a.borderSoft} px-4 py-3 text-left font-mono text-xs uppercase tracking-wider ${a.text}`}
            style={{ textShadow: a.textGlow }}
          >
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
      <div className="my-14 mx-auto max-w-xs h-px bg-linear-to-r from-transparent via-text-muted/20 to-transparent" />
    ),

    // ==================== TEXT FORMATTING ====================

    text: ({ node }) => {
      let text: ReactNode = node.text

      if (node.format & 1) {
        text = <strong className="text-white font-medium mx-[0.1em]">{text}</strong>
      }
      if (node.format & 2) {
        text = <em className="text-rga-gray italic">{text}</em>
      }
      if (node.format & 4) {
        text = <del className="text-rga-gray/60 line-through decoration-rga-gray/40">{text}</del>
      }
      if (node.format & 8) {
        text = <u className="underline underline-offset-2 decoration-rga-cyan/30">{text}</u>
      }
      if (node.format & 16) {
        text = (
          <code className="px-2 py-1 bg-bg-surface/80 text-rga-magenta rounded border border-rga-magenta/20 text-sm font-mono">
            {text}
          </code>
        )
      }
      if (node.format & 32) {
        text = <sub>{text}</sub>
      }
      if (node.format & 64) {
        text = <sup>{text}</sup>
      }

      return <>{text}</>
    },

    // ==================== UPLOAD (Images) — uses ReaderImageFrame ====================

    upload: ({ node }) => {
      if (node.relationTo !== 'media') return null
      const uploadDoc = node.value
      if (typeof uploadDoc !== 'object' || !uploadDoc) return null
      const { alt, url } = uploadDoc as { alt?: string; url?: string }
      if (!url) return null
      return <ReaderImageFrame accent={accent} src={url} alt={alt ?? ''} />
    },

    // ==================== CUSTOM BLOCKS ====================

    blocks: {
      callout: ({ node }) => {
        const { type, title, content } = node.fields
        return (
          <ReaderCalloutBlock
            type={type as CalloutType}
            accent={accent}
            title={title || undefined}
          >
            <RichText
              data={content}
              converters={buildConverters({ accent, sectionMap })}
            />
          </ReaderCalloutBlock>
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

      trelloCard: ({ node }) => {
        const { url, caption } = node.fields
        return <TrelloCard url={url} caption={caption} />
      },

      videoEmbed: ({ node }) => {
        const { url, title } = node.fields
        return <VideoEmbed url={url} title={title} />
      },
    },
  })
}

/**
 * Back-compat default — same shape as before this file gained the factory.
 * New callers should use `buildConverters({ accent, sectionMap })` directly.
 */
export const jsxConverters: JSXConvertersFunction<NodeTypes> = buildConverters()
