interface SectionHeaderProps {
  num: string
  eyebrow: string
  kicker: string
  title: string
  align?: 'left' | 'center'
}

const ACCENT = 'text-rga-green'

/**
 * Numbered section header. Mirrors the SectionHeader pattern used on /me
 * for visual consistency, with a slightly looser layout (full-width title
 * line) since community sections are showcase-shaped, not dossier-shaped.
 */
export function SectionHeader({
  num,
  eyebrow,
  kicker,
  title,
  align = 'left',
}: SectionHeaderProps) {
  return (
    <header
      className={
        align === 'center'
          ? 'mb-9 flex flex-col items-center gap-4 border-b border-[rgba(255,255,255,0.08)] pb-8 text-center'
          : 'mb-9 flex flex-col gap-4 border-b border-[rgba(255,255,255,0.08)] pb-8 sm:grid sm:grid-cols-[120px_1fr] sm:items-baseline sm:gap-8'
      }
    >
      <div
        className={
          align === 'center'
            ? 'flex items-baseline justify-center gap-3'
            : 'flex items-baseline gap-3 sm:block'
        }
      >
        <div className={`font-mono text-[11px] tracking-[0.35em] ${ACCENT}`}>SEC_{num}</div>
        <div className="font-mono text-[10px] tracking-[0.25em] text-text-muted sm:mt-2.5">
          {eyebrow}
        </div>
      </div>
      <div className={align === 'center' ? 'min-w-0' : 'min-w-0'}>
        <div className="mb-3 font-mono text-[12px] uppercase tracking-[0.3em] text-text-secondary">
          {kicker}
        </div>
        <h2 className="font-display text-[clamp(34px,4.5vw,72px)] uppercase leading-[0.92] tracking-[0.005em] text-balance break-words">
          {title}
        </h2>
      </div>
    </header>
  )
}
