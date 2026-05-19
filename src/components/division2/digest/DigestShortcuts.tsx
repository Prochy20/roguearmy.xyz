import { ACCENT_TOKENS, type AccentName } from './accent'

interface DigestShortcutsProps {
  accent: AccentName
}

/**
 * Visual-only keyboard shortcut panel — pairs with the handlers that live
 * inside `DigestToc`. This component renders nothing interactive; it just
 * reminds the operator which keys do what. The actual handlers are wired up
 * once on mount in `DigestToc` and remain active whether or not this panel
 * is on screen.
 *
 * Styling mirrors the rest of the right-rail chrome: frequency-driven accent
 * (cyan for weekly, mod-orange for daily), corner ticks, mono labels, and
 * kbd-style keycaps with an accent hairline border.
 */
export function DigestShortcuts({ accent }: DigestShortcutsProps) {
  const a = ACCENT_TOKENS[accent]
  return (
    <section
      aria-label="Keyboard shortcuts"
      className={`relative border ${a.borderFaint} bg-void/45 p-5 backdrop-blur-sm`}
    >
      <CornerTick position="tl" accent={accent} />
      <CornerTick position="tr" accent={accent} />
      <CornerTick position="bl" accent={accent} />
      <CornerTick position="br" accent={accent} />

      <header className="mb-4">
        <span
          className={`font-mono text-[10px] uppercase tracking-[0.35em] ${a.text}`}
          style={{ textShadow: a.textGlow }}
        >
          // SHORTCUTS
        </span>
      </header>

      <ul className="flex flex-col gap-3">
        <ShortcutRow accent={accent} keys={['J', 'K']} label="Next / prev section" />
        <ShortcutRow accent={accent} keys={['/']} label="Focus search" />
        <ShortcutRow accent={accent} keys={['P']} label="Print document" />
      </ul>
    </section>
  )
}

function ShortcutRow({
  accent,
  keys,
  label,
}: {
  accent: AccentName
  keys: string[]
  label: string
}) {
  return (
    <li className="flex items-center gap-3">
      <span className="flex items-center gap-1.5">
        {keys.map((k) => (
          <Keycap key={k} accent={accent}>
            {k}
          </Keycap>
        ))}
      </span>
      <span className="font-mono text-[12px] text-text-muted">{label}</span>
    </li>
  )
}

function Keycap({
  accent,
  children,
}: {
  accent: AccentName
  children: React.ReactNode
}) {
  const a = ACCENT_TOKENS[accent]
  return (
    <kbd
      className={`inline-flex h-7 w-7 items-center justify-center border ${a.borderStrong} bg-void/60 font-mono text-[11px] ${a.text}`}
      style={{ textShadow: a.textGlow }}
    >
      {children}
    </kbd>
  )
}

function CornerTick({
  position,
  accent,
}: {
  position: 'tl' | 'tr' | 'bl' | 'br'
  accent: AccentName
}) {
  const a = ACCENT_TOKENS[accent]
  const placement = {
    tl: '-top-px -left-px',
    tr: '-top-px -right-px',
    bl: '-bottom-px -left-px',
    br: '-bottom-px -right-px',
  } as const
  const size = 12
  return (
    <span
      aria-hidden
      className={`pointer-events-none absolute z-10 ${placement[position]}`}
    >
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
