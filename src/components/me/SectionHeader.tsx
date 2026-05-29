interface SectionHeaderProps {
  /** Section number, displayed as "SEC_{num}" (e.g. "01", "02"). */
  num: string
  /** Uppercase short label below the section number. */
  eyebrow: string
  /** Italicized comment-line shown above the title. */
  kicker: string
  /** Big H2 title — typically uppercase. */
  title: string
}

export function SectionHeader({ num, eyebrow, kicker, title }: SectionHeaderProps) {
  return (
    <header className="mb-7 flex flex-col gap-4 border-b border-[rgba(255,255,255,0.08)] pb-6 sm:mb-9 sm:grid sm:grid-cols-[120px_1fr] sm:items-baseline sm:gap-8 sm:pb-7">
      <div className="flex items-baseline gap-3 sm:block">
        <div className="font-mono text-[11px] tracking-[0.35em] text-rga-green">SEC_{num}</div>
        <div className="font-mono text-[10px] tracking-[0.25em] text-text-muted sm:mt-2.5">
          {eyebrow}
        </div>
      </div>
      <div className="min-w-0">
        <div className="mb-3 font-mono text-[12px] uppercase tracking-[0.3em] text-text-secondary">
          {kicker}
        </div>
        <h2 className="font-display text-[clamp(28px,7vw,88px)] uppercase leading-[0.92] tracking-[0.005em] text-balance break-words">
          {title}
        </h2>
      </div>
    </header>
  )
}
