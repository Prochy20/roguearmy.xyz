'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { ACCENT_TOKENS, type AccentName } from './accent'

interface ReaderActionsProps {
  accent: AccentName
}

/**
 * Two-button action bar — copy link to clipboard, print page.
 *
 * Both interactions are local: COPY LINK calls navigator.clipboard, PRINT
 * fires window.print(). No network, no backend, no auth gating. After a
 * successful copy, the button label morphs to `// COPIED` for ~1.5s before
 * snapping back — confirms the operator without a toast system.
 *
 * Visual posture: mono labels with a leading `+` tick, vertical separator
 * pipe between the two buttons, snap-on-hover (no easing). Hover pushes
 * both label and tick to accent color.
 *
 * This is the briefing's default actions slot. Articles use bookmark + share
 * components instead, passed directly into the title block's `actions` slot
 * rather than via this component.
 */
export function ReaderActions({ accent }: ReaderActionsProps) {
  const a = ACCENT_TOKENS[accent]
  const [copied, setCopied] = useState(false)
  const copiedTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    return () => {
      if (copiedTimerRef.current) clearTimeout(copiedTimerRef.current)
    }
  }, [])

  const handleCopy = useCallback(async () => {
    if (typeof window === 'undefined') return
    try {
      await navigator.clipboard.writeText(window.location.href)
      setCopied(true)
      if (copiedTimerRef.current) clearTimeout(copiedTimerRef.current)
      copiedTimerRef.current = setTimeout(() => setCopied(false), 1500)
    } catch {
      // Clipboard refused (insecure origin, etc.) — silently keep resting
      // state. Browser's own context menu still offers copy-link.
    }
  }, [])

  const handlePrint = useCallback(() => {
    if (typeof window !== 'undefined') window.print()
  }, [])

  const buttonClass = `group/act inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.32em] text-text-muted transition-colors ${a.textHover}`

  return (
    <div className="flex items-center gap-3">
      <button type="button" onClick={handleCopy} className={buttonClass}>
        <span className="tabular-nums">
          {copied ? '// COPIED' : '+ COPY LINK'}
        </span>
      </button>
      <span aria-hidden className="h-3 w-px bg-text-muted/30" />
      <button type="button" onClick={handlePrint} className={buttonClass}>
        <span>+ PRINT</span>
      </button>
    </div>
  )
}
