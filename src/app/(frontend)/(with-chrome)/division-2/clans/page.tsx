import { after } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { cachedFindGlobal } from '@/lib/payload/cached'
import { getMemberAuth } from '@/lib/auth/session.server'
import {
  ClansPage,
  type ClanCardData,
  type ClansPageContent,
  type HowToContent,
  type HowToStep,
  type CalloutContent,
  type ClosingCtaContent,
} from '@/components/division2/clans/ClansPage'
import { clanAccentOr } from '@/components/division2/clans/accent'
import {
  refreshStaleClanLeaderCaches,
  flushClanLeaderWrites,
} from '@/components/division2/clans/refreshStale'
import type { Division2Clan } from '@/payload-types'

// Cookie-based auth read in getMemberAuth() already opts this route out of
// static prerendering. Clan leader cache freshness is governed by the lazy
// TTL refresh in refreshStaleClanLeaderCaches.

export async function generateMetadata() {
  const division2 = await cachedFindGlobal('division2')
  const seo = division2.clansPage?.seo
  return {
    title: seo?.title?.trim() || 'Clans | Division 2 · Rogue Army',
    description:
      seo?.description?.trim() ||
      'Three active Division 2 clans on PC. Pick any — what matters is being on Discord with us.',
  }
}

function toClanCardData(clan: Division2Clan, showLeader: boolean): ClanCardData | null {
  const bannerUrl = clan.banner?.trim()
  if (!bannerUrl) return null

  const leader =
    showLeader && clan.leaderDiscordId && clan.cached_leaderDisplayName
      ? {
          discordId: clan.leaderDiscordId,
          displayName: clan.cached_leaderDisplayName,
          avatarUrl: clan.cached_leaderAvatarUrl ?? null,
        }
      : null

  return {
    id: clan.id,
    name: clan.name,
    tag: clan.tag,
    bannerUrl,
    bannerAlt: `${clan.name} clan banner`,
    accent: clanAccentOr(clan.accent),
    leader,
  }
}

export default async function Division2ClansPage() {
  const payload = await getPayload({ config })

  const [auth, division2, clansResult] = await Promise.all([
    getMemberAuth(),
    cachedFindGlobal('division2'),
    payload.find({
      collection: 'division2-clans',
      sort: 'order',
      where: { isPublished: { equals: true } },
      limit: 20,
    }),
  ])

  const isAuthenticated = auth.authenticated

  // Lazy TTL refresh for leader caches — symmetric with the staff manifest.
  // Only matters when we're actually about to render leader info; for anon
  // viewers we skip the round-trip entirely.
  let docs: Division2Clan[] = clansResult.docs
  if (isAuthenticated) {
    const refreshed = await refreshStaleClanLeaderCaches(docs)
    docs = refreshed.clans
    if (refreshed.pendingWrites.length > 0) {
      after(() => flushClanLeaderWrites(payload, refreshed.pendingWrites))
    }
  }

  const clans = docs
    .map((c) => toClanCardData(c, isAuthenticated))
    .filter((c): c is ClanCardData => c !== null)

  const content = buildContent(division2.clansPage)

  return <ClansPage isAuthenticated={isAuthenticated} clans={clans} content={content} />
}

function buildContent(
  raw: NonNullable<Awaited<ReturnType<typeof cachedFindGlobal<'division2'>>>>['clansPage'],
): ClansPageContent {
  // Trust CMS defaults — every visible string has a defaultValue in the global.
  const r = raw ?? {}

  const howTo: HowToContent = {
    sectionKicker: r.howTo?.sectionKicker ?? '// JOIN PROTOCOL',
    sectionTitle: r.howTo?.sectionTitle ?? 'ENLISTMENT',
    // Payload populates blocks defaultValue on first read; an empty list
    // here just renders an empty `<ol>`, which is a sensible fail-state if
    // an editor ever deletes every step row.
    steps: (r.howTo?.steps ?? []) as HowToStep[],
  }

  const callout: CalloutContent = {
    kicker: r.callout?.kicker ?? '// TRANSMISSION · ALL HANDS',
    headline: r.callout?.headline ?? 'THE BANNER YOU CARRY DOESN’T MATTER.',
    body:
      r.callout?.body ??
      'What matters is who’s next to you in the fireteam — and that happens on Discord. SDC, RGA, RGS — we all friend up, run loot together, and call each other in for raids.',
    bullets:
      r.callout?.bullets
        ?.map((b) => b.text?.trim() ?? '')
        .filter((s): s is string => s.length > 0) ?? [],
    signature: r.callout?.signature ?? 'Rogue Army · where gaming meets friendship',
  }

  const closingCta: ClosingCtaContent = {
    headline: r.closingCta?.headline ?? 'READY TO JOIN A FIRETEAM?',
    ctaLabel: r.closingCta?.ctaLabel ?? 'CONTACT STAFF',
    ctaUrl: r.closingCta?.ctaUrl ?? '/community/staff',
    openInNewTab: r.closingCta?.openInNewTab ?? false,
    signature: r.closingCta?.signature ?? '// ROGUE ARMY · DIV-2 OPS',
  }

  return {
    heroTitle: r.heroTitle ?? 'REGIMENTAL',
    heroAccent: r.heroAccent ?? 'STANDARDS',
    intro: r.intro ?? 'Three banners. One army. Pick any — what matters is being on Discord.',
    rosterSectionLabel: r.rosterSectionLabel ?? '// ACTIVE STANDARDS',
    emptyRoster: r.emptyRoster ?? '// NO STANDARDS ON FILE — ROSTER PENDING',
    howTo,
    callout,
    closingCta,
  }
}
