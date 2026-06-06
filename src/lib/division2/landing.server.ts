import 'server-only'

import type { AshleyErrorCode } from '@/lib/api/server'
import {
  fetchContentList,
  DEFAULT_LIMIT,
  type ContentArticle,
} from './content.server'
import {
  fetchRecentDailyBriefings,
  fetchWeeklyBriefings,
  type Briefing,
} from './briefing.server'
import {
  fetchDailyByDay,
  type EscalationLootItem,
  type EscalationMission,
  type EscalationPrototypeCache,
} from './escalation.server'
import { fetchUpcomingRaids, type Raid } from './raids.server'
import {
  formatDayShort,
  formatDayWithWeekday,
  hoursSince,
  normalizeDayIso,
  STALE_HOURS_THRESHOLD,
} from './format'
import {
  freshnessLabel,
  NEW_WINDOW_HOURS,
  tileFreshnessLine,
  tileMessageForError,
} from './landing.format'

/**
 * Aggregator for the /division-2 command-console landing page.
 *
 * Fans out three parallel reads:
 *   - escalation daily for today  (powers ESCALATION tile + targeted-loot peek)
 *   - content list (first page)   (powers CONTENT tile + latest-articles peek)
 *   - weekly briefings (latest)   (powers BRIEFING tile + latest-briefing peek)
 *
 * Each tile renders a discriminated `TileState`. The ribbon aggregates state
 * across the three. PENDING means "Ashley responded but archive is empty"
 * (distinct from OFFLINE, which means the upstream call itself failed).
 *
 * Peek data is null when its source fetch fails — the corresponding section
 * is hidden from the page rather than rendered as an error stub. The
 * matching tile already carries the failure signal via its OFFLINE pill +
 * error string, so the section-level silence is the right read.
 */

export type TilePill =
  | 'SYNCED'
  | 'STALE'
  | 'LIVE'
  | 'PENDING'
  | 'OFFLINE'

export type TileState =
  | {
      mode: 'live'
      pill: 'SYNCED' | 'STALE' | 'LIVE'
      primary: string
      secondary?: string
      fetchedAt?: string
    }
  | { mode: 'pending'; pill: 'PENDING'; primary: string }
  | {
      mode: 'offline'
      pill: 'OFFLINE'
      primary: string
      errorCode: AshleyErrorCode
    }

export type RibbonPill = 'OPERATIONAL' | 'DEGRADED' | 'OFFLINE'

export interface RibbonState {
  toolsLabel: string
  lastSyncLabel: string | null
  pill: RibbonPill
}

export interface EscalationPeek {
  missions: EscalationMission[]
  items: EscalationLootItem[]
  caches: EscalationPrototypeCache | null
  targetDay: string
}

export interface LandingPeeks {
  escalation: EscalationPeek | null
  content: ContentArticle[] | null
  briefing: Briefing | null
  /**
   * Latest daily briefings — only populated when the viewer can see them
   * (booster/staff/dev). Null for plain members so the page can swap in the
   * BoosterPerksWidget under SEC_03 instead.
   */
  dailies: Briefing[] | null
  raids: Raid[]
}

export interface LandingState {
  escalation: TileState
  content: TileState
  briefing: TileState
  ribbon: RibbonState
  peeks: LandingPeeks
}

export async function fetchLandingState(
  today: string,
  opts: { includeDailies?: boolean } = {},
): Promise<LandingState> {
  // Non-boosters never see the dailies row, so skip the fetch entirely for
  // them — saves an Ashley round-trip on the bulk of landing-page traffic.
  const dailiesPromise = opts.includeDailies
    ? fetchRecentDailyBriefings({ limit: 3 })
    : Promise.resolve(null)

  const [daily, content, briefings, raids, dailies] = await Promise.all([
    fetchDailyByDay(today),
    fetchContentList({ offset: 0, limit: DEFAULT_LIMIT }),
    fetchWeeklyBriefings({ limit: 1 }),
    fetchUpcomingRaids(),
    dailiesPromise,
  ])

  const escalation = buildEscalationTile(daily, today)
  const contentTile = buildContentTile(content)
  const briefing = buildBriefingTile(briefings)

  const peeks: LandingPeeks = {
    escalation:
      daily.ok && daily.data.week
        ? {
            missions: daily.data.week.missions ?? [],
            items: daily.data.items ?? [],
            caches: daily.data.prototypeCaches ?? null,
            targetDay: today,
          }
        : null,
    content: content.ok ? content.data.items : null,
    briefing: briefings.ok ? (briefings.data.items[0] ?? null) : null,
    // Failed dailies fetch reads as "no daily peek" rather than a stub —
    // matches per-section graceful degradation everywhere else on this page.
    dailies: dailies && dailies.ok ? dailies.data : null,
    raids,
  }

  return {
    escalation,
    content: contentTile,
    briefing,
    ribbon: buildRibbon([escalation, contentTile, briefing]),
    peeks,
  }
}

function buildEscalationTile(
  daily: Awaited<ReturnType<typeof fetchDailyByDay>>,
  today: string,
): TileState {
  if (!daily.ok) {
    // 404 is a known early-Tuesday case (today's daily hasn't ingested yet).
    // Treat as PENDING rather than OFFLINE — the destination page handles it
    // the same way via EmptyDossier AWAITING_FIRST_SYNC.
    if (daily.error.code === 'not_found') {
      return { mode: 'pending', pill: 'PENDING', primary: 'AWAITING FIRST SYNC' }
    }
    return {
      mode: 'offline',
      pill: 'OFFLINE',
      primary: tileMessageForError(daily.error.code, daily.error.status),
      errorCode: daily.error.code,
    }
  }

  const fetchedAt = daily.data.fetchedAt ?? null
  const age = fetchedAt ? hoursSince(fetchedAt) : NaN
  const isStale = Number.isFinite(age) && age > STALE_HOURS_THRESHOLD
  const primary = `TODAY · ${formatDayWithWeekday(today)}`
  const secondary = tileFreshnessLine(fetchedAt) ?? undefined
  return {
    mode: 'live',
    pill: isStale ? 'STALE' : 'SYNCED',
    primary,
    secondary,
    fetchedAt: fetchedAt ?? undefined,
  }
}

function buildContentTile(
  content: Awaited<ReturnType<typeof fetchContentList>>,
): TileState {
  if (!content.ok) {
    return {
      mode: 'offline',
      pill: 'OFFLINE',
      primary: tileMessageForError(content.error.code, content.error.status),
      errorCode: content.error.code,
    }
  }

  const { items, total, limit } = content.data
  if (items.length === 0) {
    return { mode: 'pending', pill: 'PENDING', primary: 'AWAITING FIRST SYNC' }
  }

  const cutoff = Date.now() - NEW_WINDOW_HOURS * 60 * 60 * 1000
  const newCount = items.filter((a) => {
    const t = new Date(a.fetchedAt).getTime()
    return Number.isFinite(t) && t >= cutoff
  }).length
  // First-page count saturates at `limit` — surface that honestly as "N+".
  const newDisplay = newCount >= limit ? `${limit}+` : String(newCount)

  // Freshest article in the first page is our content-tile sync stamp. The
  // overall feed list endpoint has no top-level `fetchedAt`, so we derive it.
  const freshest = items.reduce<string | null>((acc, a) => {
    if (!a.fetchedAt) return acc
    if (!acc) return a.fetchedAt
    return new Date(a.fetchedAt).getTime() > new Date(acc).getTime()
      ? a.fetchedAt
      : acc
  }, null)

  return {
    mode: 'live',
    pill: 'LIVE',
    primary: `${total} ITEMS`,
    secondary: `${newDisplay} NEW ${NEW_WINDOW_HOURS}H`,
    fetchedAt: freshest ?? undefined,
  }
}

function buildBriefingTile(
  briefings: Awaited<ReturnType<typeof fetchWeeklyBriefings>>,
): TileState {
  if (!briefings.ok) {
    return {
      mode: 'offline',
      pill: 'OFFLINE',
      primary: tileMessageForError(briefings.error.code, briefings.error.status),
      errorCode: briefings.error.code,
    }
  }

  const latest = briefings.data.items[0]
  if (!latest) {
    return { mode: 'pending', pill: 'PENDING', primary: 'AWAITING FIRST SYNC' }
  }

  // Briefing periods are retrospective (past week / past day), so we frame the
  // primary line as `PAST WEEK · MAY 5 → MAY 11`. Ashley sometimes ships full
  // ISO datetimes for the period bounds — normalize before formatting.
  const start = normalizeDayIso(latest.periodStart)
  const end = normalizeDayIso(latest.periodEnd)
  const primary = `PAST WEEK · ${formatDayShort(start)} → ${formatDayShort(end)}`
  const secondary =
    typeof latest.articleCount === 'number' && latest.articleCount > 0
      ? `${latest.articleCount} ARTICLES`
      : undefined
  return {
    mode: 'live',
    pill: 'LIVE',
    primary,
    secondary,
    fetchedAt: latest.updatedAt || latest.createdAt || undefined,
  }
}

function buildRibbon(tiles: TileState[]): RibbonState {
  const liveCount = tiles.filter((t) => t.mode === 'live').length
  const offlineCount = tiles.filter((t) => t.mode === 'offline').length
  const total = tiles.length

  let pill: RibbonPill
  if (offlineCount === total) pill = 'OFFLINE'
  else if (offlineCount > 0) pill = 'DEGRADED'
  else pill = 'OPERATIONAL'

  const toolsLabel = `${liveCount}/${total} ONLINE`

  // LAST SYNC is the freshest live-tile fetchedAt across the page.
  let freshest: string | null = null
  for (const t of tiles) {
    if (t.mode !== 'live' || !t.fetchedAt) continue
    if (!freshest || new Date(t.fetchedAt).getTime() > new Date(freshest).getTime()) {
      freshest = t.fetchedAt
    }
  }

  return {
    toolsLabel,
    lastSyncLabel: freshnessLabel(freshest),
    pill,
  }
}
