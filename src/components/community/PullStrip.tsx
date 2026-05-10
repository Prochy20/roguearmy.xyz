const COPY = {
  quote: 'BEYOND RANDOM LOBBIES.',
  caption: '// QUALITY GAMING · QUALITY PEOPLE · SINCE 2019',
} as const

/**
 * Full-bleed quote band between Hero and Stats. Uses an approved RGA
 * tagline as a visual punctuation mark and pain-point handle.
 */
export function PullStrip() {
  return (
    <section
      className="relative overflow-hidden border-y border-[rgba(255,255,255,0.06)] py-16 sm:py-24"
      aria-label="rogue army tagline"
    >
      <div
        aria-hidden
        className="absolute inset-0 -z-10 opacity-[0.07]"
        style={{
          backgroundImage: `repeating-linear-gradient(
            0deg,
            transparent 0,
            transparent 2px,
            rgba(0,255,65,0.6) 2px,
            rgba(0,255,65,0.6) 3px
          )`,
        }}
      />
      <div
        aria-hidden
        className="absolute inset-0 -z-10"
        style={{
          background:
            'radial-gradient(ellipse 70% 100% at 50% 50%, rgba(0,0,0,0) 0%, rgba(0,0,0,0.85) 100%)',
        }}
      />

      <div className="mx-auto flex max-w-[1480px] flex-col items-center gap-5 px-6 text-center">
        <p
          className="font-display uppercase leading-[0.95] tracking-[0.01em] text-text-primary"
          style={{
            fontSize: 'clamp(36px, 6vw, 96px)',
            textShadow:
              '0 0 32px rgba(0,255,65,0.25), 2px 0 0 rgba(0,255,255,0.15), -2px 0 0 rgba(255,0,255,0.15)',
          }}
        >
          {COPY.quote}
        </p>
        <p className="font-mono text-[10px] tracking-[0.4em] text-text-muted uppercase">
          {COPY.caption}
        </p>
      </div>
    </section>
  )
}
