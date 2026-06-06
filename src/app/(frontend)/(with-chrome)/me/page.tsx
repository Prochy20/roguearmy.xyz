import { redirect } from 'next/navigation'
import { getMemberAuth } from '@/lib/auth/session.server'
import { getAshleyAccessCookie } from '@/lib/auth/cookies'
import { getDiscordAvatarUrl } from '@/lib/auth/discord'
import {
  fetchAshleyUser,
  fetchAshleyUserNullable,
  type AshleyResult,
} from '@/lib/api/server'
import { isAfk } from '@/lib/auth/badges'
import { IdentityCard } from '@/components/me/IdentityCard'
import { ProgressionBand, type AshleyLevel } from '@/components/me/ProgressionBand'
import { RoleLattice } from '@/components/me/RoleLattice'
import { SectionHeader } from '@/components/me/SectionHeader'
import { normalizeAfkRecord } from '@/components/afk/types'
import { getMemberRoles } from '@/lib/me/getMemberRoles'
import type { components } from '@/lib/api/schema'
import './me.css'

type AshleyMe = {
  user: {
    avatarUrls: { '64': string; '128': string; '256': string; '512': string } | null
    serverAvatarUrls: { '64': string; '128': string; '256': string; '512': string } | null
    joinedAt: string | null
  }
}

type RawAfk = components['schemas']['AfkRecordResponseDto']

export const metadata = {
  title: 'Operative File | Rogue Army',
  description: 'Your personal RGA operative dossier.',
}

export default async function MePage() {
  const auth = await getMemberAuth()
  if (!auth.authenticated || !auth.member) {
    redirect('/auth/login?returnTo=/me')
  }

  const accessToken = await getAshleyAccessCookie()
  const [ashleyMe, ashleyLevel, afkResult, memberRoles] = await Promise.all([
    fetchAshleyUser<AshleyMe>(accessToken, (c) => c.GET('/api/auth/me')),
    fetchAshleyUser<AshleyLevel>(accessToken, (c) => c.GET('/api/leveling/me')),
    fetchAshleyUserNullable<RawAfk>(accessToken, (c) => c.GET('/api/afk/me')),
    getMemberRoles(auth.discordRoleIds),
  ])

  const afkRecord = afkResult.ok ? normalizeAfkRecord(afkResult.data) : null
  // When the /api/afk/me fetch fails but the symbolic-role snapshot says
  // the user is AFK, fall back to a boolean-only display (no reason, no
  // live ticker). Beats lying that the user is active.
  const afkFallbackBoolean = !afkResult.ok && isAfk(auth.symbolicRoles)

  const codename = (auth.member.globalName ?? auth.member.username).toUpperCase()
  const avatarUrl =
    ashleyMe.ok && (ashleyMe.data.user.serverAvatarUrls?.['256'] ?? ashleyMe.data.user.avatarUrls?.['256'])
      ? (ashleyMe.data.user.serverAvatarUrls?.['256'] ?? ashleyMe.data.user.avatarUrls!['256'])
      : getDiscordAvatarUrl(auth.member.discordId, auth.member.avatar)

  const roleLatticeKicker =
    memberRoles.length === 0
      ? '// no assignments'
      : '// resolved from the guild'

  return (
    <main className="relative z-10 mx-auto w-full max-w-[1480px] px-4 py-10 sm:px-8 sm:py-16 lg:px-16 lg:py-28">
      <section className="me-fade me-fade--01">
        <IdentityCard
          codename={codename}
          handle={auth.member.username}
          discordId={auth.member.discordId}
          memberSince={formatJoined(ashleyMe, auth.member)}
          avatarUrl={avatarUrl}
          badge={auth.primaryBadge}
          isBooster={auth.isBooster}
          afkRecord={afkRecord}
          afkFallbackBoolean={afkFallbackBoolean}
        />
      </section>

      <section className="me-fade me-fade--02 mt-14 sm:mt-24 lg:mt-40">
        <SectionHeader
          num="02"
          eyebrow="LEVELING"
          kicker="// activity-earned standing"
          title="PROGRESSION"
        />
        <ProgressionBand level={ashleyLevel} />
      </section>

      <section className="me-fade me-fade--03 mt-14 sm:mt-24 lg:mt-40">
        <SectionHeader
          num="03"
          eyebrow="ROLE LATTICE"
          kicker={roleLatticeKicker}
          title="ASSIGNMENTS"
        />
        <RoleLattice roles={memberRoles} />
      </section>
    </main>
  )
}

// Prefer Ashley's freshly-resolved guild join date when available; fall back
// to the local Payload mirror (already loaded by getMemberAuth) so
// MEMBER_SINCE still shows real data when /api/auth/me 500s.
function formatJoined(
  ashleyMe: AshleyResult<AshleyMe>,
  member: { joinedDiscordAt: string | null; joinedAt: string | null },
): string {
  const iso =
    (ashleyMe.ok ? ashleyMe.data.user.joinedAt : null) ??
    member.joinedDiscordAt ??
    member.joinedAt ??
    null
  if (!iso) return '— · ——'
  const d = new Date(iso)
  if (isNaN(d.getTime())) return '— · ——'
  return d.toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase()
}
