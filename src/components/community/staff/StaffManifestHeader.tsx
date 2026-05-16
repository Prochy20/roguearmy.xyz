import { StatRibbon } from '@/components/shared/StatRibbon'
import { HeroGlitch } from '@/components/effects/HeroGlitch'
import type { StaffPage } from '@/payload-types'
import { StaffRadar } from './StaffRadar'
import { formatSyncStamp } from './utils'

interface StaffManifestHeaderProps {
  content: StaffPage['manifest']
  rosterCount: number
  lastSyncedAt: string | null
  showMemberSurface: boolean
}

export function StaffManifestHeader({
  content,
  rosterCount,
  lastSyncedAt,
  showMemberSurface,
}: StaffManifestHeaderProps) {
  return (
    <section
      className="relative overflow-hidden border-b border-[rgba(255,255,255,0.06)] px-4 pt-20 pb-16 sm:px-8 sm:pt-24 sm:pb-20 lg:px-16 lg:pt-28 lg:pb-24"
      aria-labelledby="staff-manifest-headline"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background: `
            radial-gradient(ellipse 55% 40% at 80% 20%, rgba(0,255,255,0.08) 0%, transparent 55%),
            radial-gradient(ellipse 50% 35% at 20% 85%, rgba(0,255,65,0.06) 0%, transparent 55%)
          `,
        }}
      />

      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 opacity-[0.04]"
        style={{
          backgroundImage:
            'radial-gradient(circle, rgba(255,255,255,0.5) 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }}
      />

      <StaffRadar
        blipCount={rosterCount}
        className="absolute top-36 -right-[220px] xl:top-40 xl:-right-[280px] 2xl:top-44 2xl:-right-[340px]"
      />

      <div className="relative mx-auto flex w-full max-w-[1480px] flex-col gap-8 sm:gap-10">
        <StatRibbon
          prefix="// MANIFEST"
          fields={[
            { label: 'RECORDS', value: String(rosterCount).padStart(2, '0'), accent: 'green' },
            { label: 'SYNCED', value: formatSyncStamp(lastSyncedAt), accent: 'cyan' },
            {
              label: 'CLEARANCE',
              value: showMemberSurface ? 'MEMBER' : 'OPEN',
              accent: showMemberSurface ? 'cyan' : 'green',
            },
          ]}
          pill={{
            text: showMemberSurface ? 'UNLOCKED' : 'PUBLIC',
            ok: true,
          }}
        />

        <div className="flex min-w-0 flex-col gap-7">
          {content?.kicker && (
            <div className="font-mono text-[11px] tracking-[0.35em] text-rga-cyan uppercase">
              {content.kicker}
            </div>
          )}

          <h1
            id="staff-manifest-headline"
            className="font-display uppercase leading-[0.88] tracking-[0.005em] text-balance break-words"
            style={{ fontSize: 'clamp(44px, 8vw, 128px)' }}
          >
            {content?.preLine && (
              <HeroGlitch
                className="block"
                minInterval={4}
                maxInterval={10}
                intensity={8}
                dataCorruption
                scanlines
              >
                <span className="text-text-primary">{content.preLine}</span>
              </HeroGlitch>
            )}
            {content?.midLine && (
              <HeroGlitch
                className="block"
                minInterval={5}
                maxInterval={12}
                intensity={6}
                dataCorruption={false}
                colors={['#00ffff', '#00ff41']}
              >
                <span
                  className="text-rga-cyan"
                  style={{
                    textShadow:
                      '0 0 36px rgba(0,255,255,0.45), 0 0 80px rgba(0,255,255,0.18)',
                  }}
                >
                  {content.midLine}
                </span>
              </HeroGlitch>
            )}
            {content?.postLine && (
              <HeroGlitch
                className="block"
                minInterval={6}
                maxInterval={14}
                intensity={7}
                dataCorruption
                scanlines
              >
                <span className="text-text-primary">{content.postLine}</span>
              </HeroGlitch>
            )}
          </h1>

          {content?.sublineLead && (
            <p className="max-w-2xl text-base leading-relaxed text-text-secondary sm:text-lg">
              {content.sublineLead}
            </p>
          )}

          {showMemberSurface && content?.sublineMember && (
            <p className="max-w-2xl border-l border-rga-cyan/40 pl-4 font-mono text-xs leading-relaxed text-rga-cyan/90 sm:text-sm">
              {content.sublineMember}
            </p>
          )}
        </div>
      </div>
    </section>
  )
}
