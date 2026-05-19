import { CyberCorners, CyberTag } from '@/components/ui/CyberCorners'
import { formatDayShort, formatDayWithWeekday } from '@/lib/division2/format'
import type { DigestDetail } from '@/lib/division2/digest.server'

interface DigestSpecimenFrameProps {
  digest: DigestDetail
}

/**
 * Hero block for the digest detail page. Asymmetric layout: thumbnail panel
 * on the left (square cyber-frame at the digest's accent color), spec sheet
 * on the right with kicker + title + perex + highlights bullets.
 */
export function DigestSpecimenFrame({ digest }: DigestSpecimenFrameProps) {
  const isWeekly = digest.frequency === 'weekly'
  const accent = isWeekly ? 'cyan' : 'mod'
  const kicker = isWeekly
    ? `// WEEKLY ROLL-UP · ${formatDayShort(digest.periodStart)} → ${formatDayShort(
        digest.periodEnd,
      )}`
    : `// DAILY BRIEFING · ${formatDayWithWeekday(digest.periodStart)}`
  const accentBorder = isWeekly ? 'border-rga-cyan/20' : 'border-rga-mod/20'

  return (
    <CyberCorners color={accent} size="lg" glow>
      <div
        className={`flex flex-col gap-6 border ${accentBorder} bg-[rgba(0,0,0,0.55)] p-5 sm:flex-row sm:gap-7 sm:p-7`}
      >
        {digest.thumbnailUrl ? (
          <div className="w-full shrink-0 sm:w-[260px] lg:w-[320px]">
            <div className={`relative aspect-3/2 w-full overflow-hidden border ${accentBorder}`}>
              <img
                src={digest.thumbnailUrl}
                alt=""
                aria-hidden
                className="h-full w-full object-cover"
              />
            </div>
          </div>
        ) : null}

        <div className="flex min-w-0 flex-1 flex-col gap-4">
          <div className="flex flex-wrap items-center gap-3">
            <CyberTag color={accent}>{digest.frequency.toUpperCase()}</CyberTag>
            <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-text-muted">
              {kicker}
            </span>
          </div>

          <h1
            className="break-words font-display uppercase leading-[0.9] text-text-primary"
            style={{
              fontSize: 'clamp(28px, 4.5vw, 56px)',
              textShadow: isWeekly
                ? '0 0 24px rgba(0,255,255,0.2)'
                : '0 0 24px rgba(255,128,0,0.2)',
            }}
          >
            {digest.title}
          </h1>

          {digest.perex && (
            <p className="max-w-2xl text-base leading-relaxed text-text-secondary sm:text-lg">
              {digest.perex}
            </p>
          )}

          {digest.highlights.length > 0 && (
            <ul className="flex flex-col gap-2 border-t border-text-muted/15 pt-4">
              {digest.highlights.map((h, i) => (
                <li
                  key={i}
                  className="flex gap-2.5 text-[14px] leading-snug text-text-secondary/95"
                >
                  <span
                    aria-hidden
                    className={`mt-2 inline-block h-1 w-1 shrink-0 rounded-[1px] ${
                      isWeekly ? 'bg-rga-cyan' : 'bg-rga-mod'
                    }`}
                  />
                  <span>{h}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </CyberCorners>
  )
}
