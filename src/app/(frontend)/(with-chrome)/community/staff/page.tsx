import { after } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { cachedFindGlobal } from '@/lib/payload/cached'
import { getMemberAuth } from '@/lib/auth/session.server'
import { StaffManifestHeader } from '@/components/community/staff/StaffManifestHeader'
import { StaffRoster } from '@/components/community/staff/StaffRoster'
import { StaffEngagementProtocol } from '@/components/community/staff/StaffEngagementProtocol'
import { StaffEndStrip } from '@/components/community/staff/StaffEndStrip'
import { ACCENT_RGB, accentFor, freshestSync } from '@/components/community/staff/utils'
import {
  refreshStaleStaffCaches,
  flushStaffCacheWrites,
} from '@/components/community/staff/refreshStale'
import type { SerializedEditorState } from '@payloadcms/richtext-lexical/lexical'
import type { StaffProfile as PayloadStaffProfile } from '@/payload-types'
import type { StaffProfile } from '@/components/community/staff/types'

// The cookie-based auth read in getMemberAuth() already opts this route out
// of static rendering, so explicit force-dynamic is redundant. The staff
// cache TTL (refreshStaleStaffCaches) governs data freshness.

const VALID_ACCENTS = new Set<string>(['green', 'cyan', 'magenta', 'dev', 'admin', 'mod'])

function toComponentProfile(p: PayloadStaffProfile): StaffProfile {
  // 'auto' (or any value not in the StaffAccent set) defers to the
  // hash-based default in StaffCard. Explicit picks pass through.
  const a = p.accent
  const accent: StaffProfile['accent'] = a && VALID_ACCENTS.has(a) ? (a as StaffProfile['accent']) : null

  return {
    discordId: p.discordId,
    roleTitle: p.roleTitle,
    bio: (p.bio ?? null) as SerializedEditorState | null,
    isPublic: p.isPublic ?? true,
    order: p.order ?? 100,
    accent,
    cached_username: p.cached_username ?? null,
    cached_displayName: p.cached_displayName ?? p.discordId,
    cached_avatarUrl: p.cached_avatarUrl ?? null,
    cached_joinedAt: p.cached_joinedAt ?? null,
    cached_accountCreatedAt: p.cached_accountCreatedAt ?? null,
    cached_at: p.cached_at ?? new Date().toISOString(),
  }
}

export async function generateMetadata() {
  const page = await cachedFindGlobal('staff-page')
  return {
    title: page.seo?.title ?? 'The Core — Personnel Manifest | Rogue Army',
    description:
      page.seo?.description ??
      'The volunteer-run staff of Rogue Army — the people who answer DMs, write the rules, kill the bots, and keep the lights on.',
  }
}

export default async function StaffPage() {
  const payload = await getPayload({ config })

  const [auth, page, profilesResult] = await Promise.all([
    getMemberAuth(),
    cachedFindGlobal('staff-page'),
    payload.find({
      collection: 'staff-profiles',
      sort: 'order',
      limit: 100,
    }),
  ])

  const showMemberSurface = auth.status === 'active'

  const visibleDocs = profilesResult.docs.filter((p) => showMemberSurface || p.isPublic)
  const { profiles: freshDocs, pendingWrites } = await refreshStaleStaffCaches(visibleDocs)
  // Defer DB write-back until after the response ships. The in-memory
  // `freshDocs` already has the new values, so the render is correct; the
  // write only matters for the *next* request's stale check.
  if (pendingWrites.length > 0) {
    after(() => flushStaffCacheWrites(payload, pendingWrites))
  }
  const profiles = freshDocs.map(toComponentProfile)

  const lastSyncedAt = freshestSync(profiles.map((p) => p.cached_at))

  return (
    <>
      <StaffManifestHeader
        content={page.manifest}
        rosterCount={profiles.length}
        rosterContacts={profiles.map((p) => ({
          name: p.cached_displayName,
          color: ACCENT_RGB[p.accent ?? accentFor(p.discordId)],
        }))}
        lastSyncedAt={lastSyncedAt}
        showMemberSurface={showMemberSurface}
      />
      <StaffRoster
        content={page.roster}
        emptyState={page.emptyState}
        profiles={profiles}
        showMemberSurface={showMemberSurface}
      />
      <StaffEngagementProtocol protocol={page.protocol} faq={page.faq} />
      <StaffEndStrip
        content={page.endStrip}
        recordCount={profiles.length}
        lastSyncedAt={lastSyncedAt}
      />
    </>
  )
}
