import type { Components } from 'react-markdown'
import type { ReactNode } from 'react'
import { CodeBlock } from './CodeBlock'
import { Callout } from './Callout'
import { slugify } from '@/lib/toc'

/**
 * Extracts plain text from React children for generating heading IDs.
 */
function extractTextFromChildren(children: ReactNode): string {
  if (typeof children === 'string') {
    return children
  }

  if (typeof children === 'number') {
    return String(children)
  }

  if (Array.isArray(children)) {
    return children.map(extractTextFromChildren).join('')
  }

  if (children && typeof children === 'object' && 'props' in children) {
    const props = (children as { props: { children?: ReactNode } }).props
    return extractTextFromChildren(props.children)
  }

  return ''
}

/**
 * Custom React components for markdown elements with cyberpunk theme styling.
 * Matches the existing prose styles from ArticleContent.
 */
export const markdownComponents: Partial<Components> = {
  // Headings
  h1: ({ children }) => (
    <div className="mt-16 mb-8 first:mt-0">
      <div className="w-12 h-px bg-rga-green/40 mb-4" />
      <h1 className="font-display text-2xl md:text-3xl lg:text-4xl text-white tracking-wide">
        {children}
      </h1>
    </div>
  ),

  h2: ({ children }) => {
    const text = extractTextFromChildren(children)
    const id = slugify(text)
    return (
      <h2
        id={id}
        className="font-display text-xl md:text-2xl text-rga-cyan mt-12 mb-5 flex items-center gap-3 scroll-mt-28"
      >
        <span className="w-8 h-px bg-rga-cyan/50" />
        {children}
      </h2>
    )
  },

  h3: ({ children }) => {
    const text = extractTextFromChildren(children)
    const id = slugify(text)
    return (
      <h3
        id={id}
        className="font-bold text-lg md:text-xl text-white mt-8 mb-4 tracking-wide scroll-mt-28"
      >
        {children}
      </h3>
    )
  },

  h4: ({ children }) => (
    <h4 className="font-semibold text-base md:text-lg text-rga-cyan/90 mt-6 mb-3">
      {children}
    </h4>
  ),

  // Paragraphs
  p: ({ children }) => (
    <p className="text-text-secondary text-base md:text-lg leading-[1.8] mb-6">
      {children}
    </p>
  ),

  // Lists
  ul: ({ children }) => (
    <ul className="space-y-3 text-text-secondary mb-8 pl-0 list-none">
      {children}
    </ul>
  ),

  ol: ({ children }) => (
    <ol className="space-y-3 text-text-secondary mb-8 pl-0 list-none counter-reset-[list-counter]">
      {children}
    </ol>
  ),

  li: ({ children, node }) => {
    // Check if this is a task list item (contains checkbox)
    const hasCheckbox = node?.children?.some(
      (child) =>
        child.type === 'element' &&
        child.tagName === 'input' &&
        (child.properties as { type?: string })?.type === 'checkbox'
    )

    if (hasCheckbox) {
      return (
        <li className="flex items-start gap-3 text-base md:text-lg leading-relaxed list-none">
          {children}
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

  // Task list checkbox
  input: ({ checked, ...props }) => {
    if (props.type === 'checkbox') {
      return (
        <span
          className={`
            inline-flex items-center justify-center w-5 h-5 mr-2 rounded border-2 flex-shrink-0 mt-0.5
            ${
              checked
                ? 'bg-rga-green/20 border-rga-green text-rga-green'
                : 'bg-transparent border-rga-gray/50'
            }
          `}
        >
          {checked && (
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          )}
        </span>
      )
    }
    return <input {...props} />
  },

  // Tables - with corner brackets
  table: ({ children }) => {
    // Corner bracket component
    const Corner = ({ position }: { position: 'tl' | 'tr' | 'bl' | 'br' }) => {
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
            className="text-rga-cyan/40"
          >
            <path
              d="M0 12V0H12"
              stroke="currentColor"
              strokeWidth="1.5"
              fill="none"
            />
          </svg>
        </div>
      )
    }

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

  thead: ({ children }) => (
    <thead className="border-b border-rga-cyan/20">
      {children}
    </thead>
  ),

  tbody: ({ children }) => <tbody>{children}</tbody>,

  tr: ({ children }) => (
    <tr className="border-b border-rga-green/5 last:border-b-0 hover:bg-rga-green/[0.02] transition-colors">
      {children}
    </tr>
  ),

  th: ({ children }) => (
    <th className="px-4 py-3 text-left font-mono font-medium text-rga-cyan text-xs uppercase tracking-wider">
      {children}
    </th>
  ),

  td: ({ children }) => (
    <td className="px-4 py-3 text-text-secondary text-sm">
      {children}
    </td>
  ),

  // Blockquotes
  blockquote: ({ children }) => (
    <blockquote className="my-6 border-l-4 border-rga-green bg-bg-surface/50 py-3 px-5 text-rga-gray italic rounded-r-lg">
      {children}
    </blockquote>
  ),

  // Links
  a: ({ href, children }) => {
    const isExternal = href?.startsWith('http')
    return (
      <a
        href={href}
        className="text-rga-cyan hover:text-rga-green transition-colors underline underline-offset-2 decoration-rga-cyan/30 hover:decoration-rga-green/50"
        {...(isExternal && {
          target: '_blank',
          rel: 'noopener noreferrer',
        })}
      >
        {children}
        {isExternal && (
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
        )}
      </a>
    )
  },

  // Images
  img: ({ src, alt }) => (
    <figure className="my-8">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
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
  ),

  // Inline code
  code: ({ className, children, ...props }) => {
    // Check if this is a code block (has language class)
    const isCodeBlock = className?.startsWith('language-')

    if (isCodeBlock) {
      return <CodeBlock className={className}>{children}</CodeBlock>
    }

    // Inline code
    return (
      <code
        className="px-2 py-1 bg-bg-surface/80 text-rga-magenta rounded border border-rga-magenta/20 text-sm font-mono"
        {...props}
      >
        {children}
      </code>
    )
  },

  // Pre element (wraps code blocks)
  pre: ({ children }) => {
    // The CodeBlock component handles its own wrapper
    // Just pass through the children (which should be a code element)
    return <>{children}</>
  },

  // Horizontal rule - subtle
  hr: () => (
    <div className="my-14 mx-auto max-w-xs h-px bg-gradient-to-r from-transparent via-rga-gray/20 to-transparent" />
  ),

  // Strong/Bold - slight horizontal margin for breathing room
  strong: ({ children }) => (
    <strong className="text-white font-medium mx-[0.1em]">{children}</strong>
  ),

  // Emphasis/Italic
  em: ({ children }) => <em className="text-rga-gray italic">{children}</em>,

  // Strikethrough (GFM)
  del: ({ children }) => (
    <del className="text-rga-gray/60 line-through decoration-rga-gray/40">{children}</del>
  ),

  // Callouts/Admonitions (:::info, :::warning, etc.)
  aside: ({ children, ...props }) => {
    const calloutType = (props as { 'data-callout'?: string })['data-callout']
    const customTitle = (props as { 'data-title'?: string })['data-title']

    if (calloutType) {
      return (
        <Callout
          type={calloutType as 'info' | 'warning' | 'tip' | 'success' | 'danger' | 'error' | 'note'}
          title={customTitle}
        >
          {children}
        </Callout>
      )
    }

    // Fallback for regular aside elements
    return <aside {...props}>{children}</aside>
  },
}
