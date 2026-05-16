import { SectionHeader } from '@/components/community/SectionHeader'
import type { StaffPage } from '@/payload-types'
import { StaffCard } from './StaffCard'
import { StaffRosterBanner } from './StaffRosterBanner'
import { StaffRosterEmpty } from './StaffRosterEmpty'
import type { StaffProfile } from './types'

interface StaffRosterProps {
  content: StaffPage['roster']
  emptyState: StaffPage['emptyState']
  profiles: StaffProfile[]
  showMemberSurface: boolean
}

export function StaffRoster({
  content,
  emptyState,
  profiles,
  showMemberSurface,
}: StaffRosterProps) {
  const kicker = showMemberSurface
    ? content?.kickerMember ?? ''
    : content?.kickerPublic ?? ''

  return (
    <section
      id="sec-01"
      className="relative px-4 py-20 sm:px-8 sm:py-24 lg:px-16 lg:py-28"
      aria-labelledby="staff-roster-heading"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            'radial-gradient(ellipse 45% 30% at 90% 10%, rgba(0,255,65,0.04) 0%, transparent 55%)',
        }}
      />

      <div className="mx-auto w-full max-w-[1480px]">
        <SectionHeader
          num="01"
          eyebrow={content?.sectionEyebrow ?? 'OPERATIVES'}
          kicker={kicker}
          title={content?.sectionTitle ?? 'THE CORE'}
        />

        {profiles.length === 0 ? (
          <StaffRosterEmpty content={emptyState} />
        ) : (
          <>
            <ul
              className="grid grid-cols-1 gap-6 sm:grid-cols-2 sm:gap-7 lg:grid-cols-3 lg:gap-8"
              role="list"
            >
              {profiles.map((profile, index) => (
                <li key={profile.discordId} className="flex">
                  <StaffCard
                    profile={profile}
                    index={index}
                    showMemberSurface={showMemberSurface}
                  />
                </li>
              ))}
            </ul>
            <StaffRosterBanner content={content?.tailBanner} />
          </>
        )}
      </div>
    </section>
  )
}
