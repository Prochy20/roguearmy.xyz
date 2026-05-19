'use client'

import { Children, isValidElement, type ReactNode } from 'react'
import type { Components } from 'react-markdown'
import { ACCENT_TOKENS, type AccentName } from './accent'

/**
 * Digest-local markdown component overrides.
 *
 * Three elements get reshaped here:
 *  - h2 — wraps the heading in a numbered "section card" lookup. The server
 *    walk pre-stamps each h2 with `id="sec-NN"` and `data-sec-num="NN"`; we
 *    just read the data attribute and render an oversized mono ordinal beside
 *    the display-font title.
 *  - img — every body image becomes a smaller cyber-frame with corner ticks
 *    and an alt-text caption strip. Plays the same beat as the hero frame but
 *    at a quieter scale.
 *  - aside[data-callout] — the existing callout types and the new quote/rule
 *    types render through DigestCalloutBlock, which uses a left-anchored tag
 *    pill instead of the shared Callout's center-floating label.
 *
 * Built via a factory because the accent color is per-page state and Tailwind
 * needs literal class names — both arms of the cyan/mod fork live in
 * `ACCENT_TOKENS`, the factory just picks which row to spread into the JSX.
 */
export function createDigestMarkdownComponents(
  accent: AccentName,
): Partial<Components> {
  const a = ACCENT_TOKENS[accent]

  return {
    // Numbered section heading — server has already injected id + data-sec-num
    // via injectSectionAnchors. We render an oversized mono ordinal beside
    // the title. The whole block is the scroll target (id sits on the h2).
    h2: ({ children, id, ...rest }) => {
      const secNum =
        (rest as { 'data-sec-num'?: string })['data-sec-num'] ?? null
      return (
        <h2
          id={id}
          data-sec-num={secNum ?? undefined}
          className="group/h2 mt-14 mb-6 flex items-start gap-4 scroll-mt-28 first:mt-0 sm:gap-5"
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
        </h2>
      )
    },

    // H3 override — adaptive. When the server promoted H3 to section-level
    // (no H2s in body), each H3 carries a `data-sec-num` and renders with
    // the same numbered display chrome as h2. When data-sec-num is absent,
    // it's a regular sub-heading under an H2 and renders smaller / quieter.
    h3: ({ children, id, ...rest }) => {
      const secNum =
        (rest as { 'data-sec-num'?: string })['data-sec-num'] ?? null
      if (secNum) {
        return (
          <h3
            id={id}
            data-sec-num={secNum}
            className="group/h3sec mt-14 mb-6 flex items-start gap-4 scroll-mt-28 first:mt-0 sm:gap-5"
          >
            <span
              className={`shrink-0 pt-1 font-mono text-[14px] tabular-nums tracking-[0.15em] ${a.text} sm:text-[15px]`}
              style={{ textShadow: a.textGlow }}
            >
              {secNum}
            </span>
            <span
              className="break-words font-display uppercase leading-[0.95] text-text-primary"
              style={{
                fontSize: 'clamp(22px, 3vw, 34px)',
                textShadow: '0 0 24px rgba(255,255,255,0.05)',
              }}
            >
              {children}
            </span>
          </h3>
        )
      }
      // Sub-heading under an H2 section.
      return (
        <h3
          id={id}
          className="mt-10 mb-4 scroll-mt-28 font-display text-lg uppercase tracking-wide text-text-primary sm:text-xl"
        >
          {children}
        </h3>
      )
    },

    // Body images in cyber-frame with corner ticks + alt-text caption strip.
    // Empty alt → frame only, no strip. External hosts are common in Ashley's
    // payloads so we deliberately keep <img> (not next/image) and stay loose.
    img: ({ src, alt }) => {
      if (typeof src !== 'string' || src.length === 0) return null
      const captionText = (alt ?? '').trim()
      return (
        <figure className="my-10">
          <div className={`relative border ${a.borderFaint}`}>
            <CornerTick position="tl" accent={accent} small />
            <CornerTick position="tr" accent={accent} small />
            <CornerTick position="bl" accent={accent} small />
            <CornerTick position="br" accent={accent} small />
            <div
              className={`relative overflow-hidden border ${a.borderSoft}`}
              style={{ background: a.radialGlow }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={src}
                alt={alt ?? ''}
                loading="lazy"
                className="block h-auto w-full object-cover"
              />
              {captionText.length > 0 && (
                <div
                  className={`flex items-center justify-between border-t ${a.borderFaint} bg-void/85 px-3 py-2 font-mono text-[9px] uppercase tracking-[0.32em] backdrop-blur-sm sm:px-4`}
                >
                  <span className={`${a.textSoft} truncate`}>
                    // {captionText}
                  </span>
                </div>
              )}
            </div>
          </div>
        </figure>
      )
    },

    // Anchor override — four flavors, dispatched in this order:
    //   1. citation chips (`data-cite-chip`): the `[N]` superscripts. Always
    //      render in cyan, no underline, no external icon — they're tactical
    //      markers, not prose links. They may point at either an external
    //      source URL or an in-page anchor; styling stays identical either way.
    //   2. hash anchors (`#…`): in-document jumps. Quiet cyan, no icon.
    //   3. external links (http/https): body citation phrases. Render in
    //      rga-green with an external-link icon trailing the text.
    //   4. other internal (e.g. `/path`): fall back to a quiet cyan underline.
    a: ({ href, children, ...props }) => {
      const url = typeof href === 'string' ? href : ''
      const isChip =
        (props as { 'data-cite-chip'?: string | boolean })['data-cite-chip'] !==
        undefined
      if (isChip) {
        const isExternalChip = /^https?:\/\//i.test(url)
        return (
          <a
            href={url || undefined}
            {...(isExternalChip
              ? { target: '_blank', rel: 'noopener noreferrer' }
              : {})}
            className="text-rga-cyan/85 transition-colors hover:text-rga-cyan"
            {...props}
          >
            {children}
          </a>
        )
      }
      if (url.startsWith('#')) {
        return (
          <a
            href={url}
            className="text-rga-cyan/85 transition-colors hover:text-rga-cyan"
            {...props}
          >
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
            {...props}
          >
            {children}
            <ExternalLinkIcon />
          </a>
        )
      }
      return (
        <a
          href={url || undefined}
          className="text-rga-cyan underline decoration-rga-cyan/30 underline-offset-2 transition-colors hover:text-rga-green hover:decoration-rga-green/50"
          {...props}
        >
          {children}
        </a>
      )
    },

    // Callout dispatcher — read data-callout off the aside, route to the
    // digest-local block. Falls back to the shared aside for asides without
    // a callout type (rare; would only happen on raw HTML asides).
    aside: ({ children, ...props }) => {
      const calloutType = (props as { 'data-callout'?: string })['data-callout']
      const title = (props as { 'data-title'?: string })['data-title']
      const author = (props as { 'data-author'?: string })['data-author']
      if (!calloutType) {
        return <aside {...props}>{children}</aside>
      }
      return (
        <DigestCalloutBlock
          type={calloutType as CalloutType}
          accent={accent}
          title={title}
          author={author}
        >
          {children}
        </DigestCalloutBlock>
      )
    },
  }
}

/* ── Callout block ───────────────────────────────────────────────────────── */

type CalloutType =
  | 'info'
  | 'warning'
  | 'tip'
  | 'success'
  | 'danger'
  | 'error'
  | 'note'
  | 'quote'
  | 'rule'

interface CalloutVariant {
  pillBg: string
  pillText: string
  pillGlow: string
  border: string
  bg: string
  label: string
}

/**
 * Variant table — one row per callout type, fully spelled out so Tailwind
 * picks them up. Quote and rule are the two new types added for digest.
 * Quote uses the page accent (it's the in-document "voice of an operative"
 * marker, so it ties to the channel color). Rule is locked to magenta — it
 * encodes a hard constraint, independent of channel.
 */
function calloutVariants(accent: AccentName): Record<CalloutType, CalloutVariant> {
  const a = ACCENT_TOKENS[accent]
  return {
    info: {
      pillBg: 'bg-rga-cyan',
      pillText: 'text-rga-cyan',
      pillGlow: '0 0 14px rgba(0,255,255,0.45)',
      border: 'border-rga-cyan/30',
      bg: 'bg-rga-cyan/5',
      label: 'INFO',
    },
    warning: {
      pillBg: 'bg-amber-500',
      pillText: 'text-amber-500',
      pillGlow: '0 0 14px rgba(245,158,11,0.45)',
      border: 'border-amber-500/30',
      bg: 'bg-amber-500/5',
      label: 'WARNING',
    },
    tip: {
      pillBg: 'bg-rga-green',
      pillText: 'text-rga-green',
      pillGlow: '0 0 14px rgba(0,255,65,0.45)',
      border: 'border-rga-green/30',
      bg: 'bg-rga-green/5',
      label: 'TIP',
    },
    success: {
      pillBg: 'bg-rga-green',
      pillText: 'text-rga-green',
      pillGlow: '0 0 14px rgba(0,255,65,0.45)',
      border: 'border-rga-green/30',
      bg: 'bg-rga-green/5',
      label: 'SUCCESS',
    },
    danger: {
      pillBg: 'bg-rga-magenta',
      pillText: 'text-rga-magenta',
      pillGlow: '0 0 14px rgba(255,0,255,0.45)',
      border: 'border-rga-magenta/30',
      bg: 'bg-rga-magenta/5',
      label: 'DANGER',
    },
    error: {
      pillBg: 'bg-rga-magenta',
      pillText: 'text-rga-magenta',
      pillGlow: '0 0 14px rgba(255,0,255,0.45)',
      border: 'border-rga-magenta/30',
      bg: 'bg-rga-magenta/5',
      label: 'ERROR',
    },
    note: {
      pillBg: 'bg-text-muted',
      pillText: 'text-text-muted',
      pillGlow: 'none',
      border: 'border-text-muted/25',
      bg: 'bg-text-muted/5',
      label: 'NOTE',
    },
    quote: {
      pillBg: a.bg,
      pillText: a.text,
      pillGlow: a.textGlow,
      border: a.borderSoft,
      bg: a.bgWash,
      label: 'QUOTE',
    },
    rule: {
      pillBg: 'bg-rga-magenta',
      pillText: 'text-rga-magenta',
      pillGlow: '0 0 14px rgba(255,0,255,0.5)',
      border: 'border-rga-magenta/35',
      bg: 'bg-rga-magenta/[0.06]',
      label: 'RULE',
    },
  }
}

interface DigestCalloutBlockProps {
  type: CalloutType
  accent: AccentName
  title?: string
  /** Optional pre-parsed author for quote variant. */
  author?: string
  children: ReactNode
}

function DigestCalloutBlock({
  type,
  accent,
  title,
  author,
  children,
}: DigestCalloutBlockProps) {
  const variant = calloutVariants(accent)[type]
  const label = title?.toUpperCase().trim() || variant.label

  // For quote callouts: if no explicit author attribute came in via
  // ::quote{author="..."}, sniff the children for a trailing paragraph that
  // starts with an em-dash and split it out as the attribution row.
  let body: ReactNode = children
  let attribution: string | null = author?.trim() || null

  if (type === 'quote' && !attribution) {
    const sniffed = splitTrailingAttribution(children)
    if (sniffed) {
      body = sniffed.body
      attribution = sniffed.author
    }
  }

  const labelPrefix = type === 'quote' ? '“ ' : '+ '

  return (
    <aside
      className={`my-8 flex flex-col gap-3 border-l-2 ${variant.border} ${variant.bg} px-5 py-4 sm:flex-row sm:gap-5 sm:px-6 sm:py-5`}
      data-callout={type}
    >
      <span
        className={`shrink-0 font-mono text-[10px] uppercase tracking-[0.32em] ${variant.pillText} sm:pt-1`}
        style={{ textShadow: variant.pillGlow }}
      >
        {labelPrefix}
        {label}
      </span>
      <div className="callout-body min-w-0 flex-1 text-text-secondary [&>p:last-child]:mb-0">
        {body}
        {type === 'quote' && attribution && (
          <div className="mt-3 flex items-center gap-2 border-t border-text-muted/15 pt-2 font-mono text-[10px] uppercase tracking-[0.3em]">
            <span aria-hidden className="text-text-muted">
              —
            </span>
            <span className={`${variant.pillText}`} style={{ textShadow: variant.pillGlow }}>
              {attribution}
            </span>
          </div>
        )}
      </div>
    </aside>
  )
}

/**
 * Walk a rendered React subtree, find the final block element whose flattened
 * text begins with `—` (em-dash) or `--`, and split it out as a quote
 * attribution. Anything before is returned as the new body. Returns null when
 * no such trailing line exists.
 */
function splitTrailingAttribution(
  children: ReactNode,
): { body: ReactNode; author: string } | null {
  const arr = Children.toArray(children)
  for (let i = arr.length - 1; i >= 0; i--) {
    const child = arr[i]
    if (!isValidElement(child)) continue
    const text = extractText(child).trim()
    if (!text) continue
    const match = text.match(/^[—\-]+\s+(.+)$/)
    if (!match) return null
    return {
      body: arr.slice(0, i),
      author: match[1].trim(),
    }
  }
  return null
}

function extractText(node: ReactNode): string {
  if (node === null || node === undefined || typeof node === 'boolean') return ''
  if (typeof node === 'string') return node
  if (typeof node === 'number') return String(node)
  if (Array.isArray(node)) return node.map(extractText).join('')
  if (isValidElement(node)) {
    const props = (node as { props: { children?: ReactNode } }).props
    return extractText(props.children)
  }
  return ''
}

/* ── External-link icon ──────────────────────────────────────────────────── */

/**
 * Small "go-away" arrow rendered after external link text. Sized to baseline-
 * align with surrounding prose; uses `currentColor` so it tracks the link's
 * color through hover transitions without a separate state.
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

/* ── Corner ticks shared by img frame ────────────────────────────────────── */

function CornerTick({
  position,
  accent,
  small = false,
}: {
  position: 'tl' | 'tr' | 'bl' | 'br'
  accent: AccentName
  small?: boolean
}) {
  const a = ACCENT_TOKENS[accent]
  const placement = {
    tl: '-top-px -left-px',
    tr: '-top-px -right-px',
    bl: '-bottom-px -left-px',
    br: '-bottom-px -right-px',
  } as const
  const size = small ? 10 : 14
  return (
    <span aria-hidden className={`pointer-events-none absolute z-10 ${placement[position]}`}>
      <span
        className={`absolute ${a.bg}`}
        style={{
          width: size,
          height: 1,
          top: position.startsWith('t') ? 0 : 'auto',
          bottom: position.startsWith('b') ? 0 : 'auto',
          left: position.endsWith('l') ? 0 : 'auto',
          right: position.endsWith('r') ? 0 : 'auto',
        }}
      />
      <span
        className={`absolute ${a.bg}`}
        style={{
          width: 1,
          height: size,
          top: position.startsWith('t') ? 0 : 'auto',
          bottom: position.startsWith('b') ? 0 : 'auto',
          left: position.endsWith('l') ? 0 : 'auto',
          right: position.endsWith('r') ? 0 : 'auto',
        }}
      />
    </span>
  )
}
