import { CyberCorners } from '@/components/ui/CyberCorners'
import type { Division2 } from '@/payload-types'

type DiscordContent = NonNullable<NonNullable<Division2['escalationPage']>['discord']>

interface EscalationDiscordRowProps {
  content: DiscordContent | undefined
}

/**
 * SEC_03 — Discord cross-link card. Mirrors the dossier rhythm of SEC_01 /
 * SEC_02: mono kicker + headline + body, with a CTA pill at the bottom-right
 * deep-linking to the Discord channel that posts the same daily intel.
 *
 * Renders nothing when the section is disabled or the channel URL is missing,
 * so the page collapses cleanly if an editor turns it off in admin.
 */
export function EscalationDiscordRow({ content }: EscalationDiscordRowProps) {
  if (!content || content.enabled === false) return null
  const channelUrl = content.channelUrl?.trim()
  if (!channelUrl) return null

  const sectionLabel = content.sectionLabel?.trim() || '// DISCORD COMMS · DAILY DROPS'
  const heading = content.heading?.trim() || 'ALSO POSTED ON DISCORD'
  const body = content.body?.trim() || ''
  const channelLabel = content.channelLabel?.trim() || '#division-2-escalation'
  const ctaLabel = content.ctaLabel?.trim() || 'OPEN CHANNEL'

  return (
    <section className="space-y-4">
      <header className="flex items-center gap-3">
        <span className="font-mono text-[10px] tracking-[0.4em] text-rga-green">SEC_03</span>
        <span className="font-mono text-[10px] tracking-[0.3em] text-text-muted">
          {sectionLabel}
        </span>
      </header>

      <CyberCorners color="green" size="md">
        <div className="grid grid-cols-1 gap-5 border border-rga-green/15 bg-[rgba(0,0,0,0.5)] p-5 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center sm:gap-8 sm:p-6">
          <div className="flex min-w-0 flex-col gap-2">
            <span
              className="break-words font-display text-2xl uppercase leading-tight text-rga-green sm:text-3xl"
              style={{ textShadow: '0 0 18px rgba(0,255,65,0.3)' }}
            >
              {heading}
            </span>
            {body && (
              <p className="max-w-2xl text-sm leading-relaxed text-text-secondary">
                {body}
              </p>
            )}
            <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-rga-green/70">
              {channelLabel}
            </span>
          </div>

          <a
            href={channelUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-11 items-center justify-center gap-2 self-start border border-rga-green/40 bg-rga-green/10 px-5 font-mono text-[11px] tracking-[0.3em] uppercase text-rga-green transition-colors hover:border-rga-green/80 hover:bg-rga-green/20 sm:self-center"
          >
            {ctaLabel}
            <span aria-hidden>↗</span>
          </a>
        </div>
      </CyberCorners>
    </section>
  )
}
