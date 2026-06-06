'use client'

import dynamic from 'next/dynamic'
import { useEffect, useMemo, useState } from 'react'
import { FormationBlock } from './FormationBlock'
import { FormationDossier } from './FormationDossier'
import { PointCard, type PointCardState } from './PointCard'
import { TierBand } from './TierBand'
import { ProgressStrip } from './ProgressStrip'
import { useFormationStorage } from './useFormationStorage'

// Both are conditionally rendered (BootOverlay: first visit only; RosterModal:
// click-to-open). Splitting them out of the initial bundle reduces leaderboard
// JS for returning visitors without changing render semantics — both are pure
// client components and never SSR.
const BootOverlay = dynamic(() =>
  import('./BootOverlay').then((m) => ({ default: m.BootOverlay })),
)
const RosterModal = dynamic(() =>
  import('./RosterModal').then((m) => ({ default: m.RosterModal })),
)
import { setBootSeenCookieClient } from '@/lib/formation/cookies'
import {
  computeWindowDelta,
  detectOvertake,
  formatDesignatedAgo,
  pickSuggested,
} from '@/lib/formation/derive'
import { getRosterAbove } from '@/app/(frontend)/(with-chrome)/leaderboard/actions'
import type { components } from '@/lib/api/schema'

type LeaderboardEntry = components['schemas']['LeaderboardEntryDto']

interface MyLevelData {
  level: number
  levelLabel: string | null
  progress: number
  xpToNextLevel: number | null
  nextLevel: number | null
  nextLevelLabel: string | null
}

interface FormationPanelProps {
  /** Caller's own leaderboard entry, or null if unranked. */
  myEntry: LeaderboardEntry | null
  /** Caller's level details (label, progress, etc.). Null on fetch fail. */
  myLevelData: MyLevelData | null
  /** Top-3 entries (rank order). Used for fresh-data lookup when POINT is in this slice. */
  topThree: LeaderboardEntry[]
  /** Operatives directly above the caller (up to 3, rank-ordered). Empty for rank 1. */
  closeAbove: LeaderboardEntry[]
  /** Total operative count from board.total — used by BootOverlay. */
  totalOps: number
  /** Cached count of ops above caller, displayed in the "PICK FROM ROSTER · N OPS ABOVE" link. */
  rosterCountAbove: number
  /** Server-decided: should the boot overlay render this visit? */
  showBoot: boolean
  /** Caller's display name for the boot overlay personalization. */
  operativeName: string | null
}

const SEVEN_DAYS_MS = 7 * 86_400_000

/**
 * Client orchestrator for the formation HUD. Sits at the boundary between
 * server-fetched data (passed as props) and client-only state (localStorage
 * via useFormationStorage). Derives the appropriate PointCardState, records
 * the visit snapshot, detects overtake, manages the roster modal's lazy
 * fetch, and writes the boot cookie on overlay completion.
 *
 * Server-rendered HTML defaults to SUGGEST (or TOP, or UNRANKED — all
 * derivable from server data alone). After hydration, designated-POINT
 * states upgrade to STANDARD or RELIEVED.
 */
export function FormationPanel({
  myEntry,
  myLevelData,
  topThree,
  closeAbove,
  totalOps,
  rosterCountAbove,
  showBoot,
  operativeName,
}: FormationPanelProps) {
  const { state, hydrated, designate, recordVisit, updateSeenPoint, dismiss } =
    useFormationStorage()

  const [bootDismissed, setBootDismissed] = useState(false)
  const [rosterOpen, setRosterOpen] = useState(false)
  const [rosterEntries, setRosterEntries] = useState<LeaderboardEntry[]>([])
  const [rosterOffset, setRosterOffset] = useState(0)
  const [rosterTotal, setRosterTotal] = useState(0)
  const [rosterLoading, setRosterLoading] = useState(false)

  // On first hydration: append today's snapshot, and refresh point.lastSeen
  // if the POINT happens to be in the data we have right now.
  useEffect(() => {
    if (!hydrated || !myEntry) return
    recordVisit(myEntry.rank, myEntry.xp)
    if (state.point) {
      const fresh = findEntry(state.point.discordId, topThree, closeAbove)
      if (fresh) updateSeenPoint(fresh.rank, fresh.xp)
    }
    // Run once after hydration — the recordVisit is a per-page-view event.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated])

  // Derive the card state from server data + storage.
  const pointState = useMemo<PointCardState>(
    () => derivePointState({ myEntry, topThree, closeAbove, storage: state, hydrated, rosterCountAbove }),
    [myEntry, topThree, closeAbove, state, hydrated, rosterCountAbove],
  )

  // Self-progress delta — only meaningful after hydration (snapshots come from storage).
  const progress = useMemo(() => {
    if (!myEntry || !hydrated) return null
    return computeWindowDelta(state.snapshots, SEVEN_DAYS_MS)
  }, [state.snapshots, myEntry, hydrated])

  const handleDesignate = (discordId: string) => {
    if (discordId === myEntry?.discordId) return
    const entry = findEntry(discordId, topThree, closeAbove, rosterEntries)
    if (!entry) return
    designate({
      discordId: entry.discordId,
      displayName: entry.displayName,
      level: entry.level,
      avatar: extractAvatar(entry.avatar),
      lastSeenRank: entry.rank,
      lastSeenXp: entry.xp,
      designatedAt: Date.now(),
    })
  }

  const handleConfirmSuggested = () => {
    if (pointState.kind !== 'suggest') return
    handleDesignate(pointState.suggested.discordId)
  }

  const handleDismissSuggested = () => {
    if (pointState.kind !== 'suggest') return
    // Record the dismissal AND surface the roster so the user has somewhere
    // to go. Writing to storage alone leaves the button feeling broken
    // (the same suggestion would just persist on screen).
    dismiss(pointState.suggested.discordId)
    void handleOpenRoster()
  }

  const handleOpenRoster = async () => {
    setRosterOpen(true)
    if (!myEntry || myEntry.rank < 2) return
    if (rosterEntries.length > 0) return // already loaded
    setRosterLoading(true)
    const res = await getRosterAbove(myEntry.rank, 0)
    if (res.ok) {
      setRosterEntries(res.data.items)
      setRosterOffset(res.data.items.length)
      setRosterTotal(res.data.total)
    }
    setRosterLoading(false)
  }

  const handleLoadMoreRoster = async () => {
    if (!myEntry || rosterLoading) return
    setRosterLoading(true)
    const res = await getRosterAbove(myEntry.rank, rosterOffset)
    if (res.ok) {
      setRosterEntries((prev) => [...prev, ...res.data.items])
      setRosterOffset((prev) => prev + res.data.items.length)
      setRosterTotal(res.data.total)
    }
    setRosterLoading(false)
  }

  const handleDesignateFromRoster = (discordId: string) => {
    handleDesignate(discordId)
    setRosterOpen(false)
  }

  const handleBootComplete = () => {
    setBootSeenCookieClient()
    setBootDismissed(true)
  }

  const blockStatus =
    pointState.kind === 'relieved'
      ? 'relieved'
      : pointState.kind === 'unranked'
        ? 'standby'
        : 'live'

  const hasMoreRoster = rosterEntries.length < rosterTotal

  return (
    <>
      <FormationBlock status={blockStatus}>
        <FormationDossier />

        <PointCard
          state={pointState}
          onDesignate={handleDesignate}
          onConfirmSuggested={handleConfirmSuggested}
          onDismissSuggested={handleDismissSuggested}
          onOpenRoster={handleOpenRoster}
        />

        {myLevelData && pointState.kind !== 'unranked' && (
          <TierBand
            level={myLevelData.level}
            levelLabel={myLevelData.levelLabel}
            progress={myLevelData.progress}
            xpToNextLevel={myLevelData.xpToNextLevel}
            nextLevelLabel={myLevelData.nextLevelLabel}
            nextLevel={myLevelData.nextLevel}
          />
        )}

        {progress && pointState.kind !== 'unranked' && (
          <ProgressStrip
            windowLabel={progress.windowLabel}
            xpDelta={progress.xpDelta}
            rankDelta={progress.rankDelta}
            fresh={progress.fresh}
          />
        )}
      </FormationBlock>

      {rosterOpen && (
        <RosterModal
          open={rosterOpen}
          entries={rosterEntries}
          callerXp={myEntry?.xp ?? 0}
          callerRank={myEntry?.rank ?? null}
          hasMore={hasMoreRoster}
          isLoading={rosterLoading}
          onClose={() => setRosterOpen(false)}
          onDesignate={handleDesignateFromRoster}
          onLoadMore={handleLoadMoreRoster}
        />
      )}

      {showBoot && !bootDismissed && (
        <BootOverlay
          operativeName={operativeName}
          cohortSize={totalOps || null}
          onComplete={handleBootComplete}
        />
      )}
    </>
  )
}

/* ──────────────────────────────────────────────────────────────────────── */
/* State derivation                                                           */
/* ──────────────────────────────────────────────────────────────────────── */

interface DeriveInputs {
  myEntry: LeaderboardEntry | null
  topThree: LeaderboardEntry[]
  closeAbove: LeaderboardEntry[]
  storage: ReturnType<typeof useFormationStorage>['state']
  hydrated: boolean
  rosterCountAbove: number
}

function derivePointState({
  myEntry,
  topThree,
  closeAbove,
  storage,
  hydrated,
  rosterCountAbove,
}: DeriveInputs): PointCardState {
  if (!myEntry) return { kind: 'unranked' }

  // Rank 1 — mirrored mechanic. Renders deterministically server-side too.
  if (myEntry.rank === 1) {
    const rear = topThree[1] ?? null
    // Rear guard is BELOW the caller — gap is how much they trail us, so the
    // subtraction is (mine - theirs), not (theirs - mine).
    return {
      kind: 'top',
      rearGuard: rear,
      rearGap: rear ? Math.max(0, myEntry.xp - rear.xp) : null,
      rearGuardLevelLabel: null,
    }
  }

  // Pre-hydration: render the SUGGEST state. This is the safest server-side
  // default because it works whether or not the user has a stored POINT —
  // the client hydration tick will upgrade to STANDARD if appropriate.
  const suggestState = (): PointCardState => {
    const suggested = pickSuggested(closeAbove)
    if (!suggested) return { kind: 'unranked' }
    return {
      kind: 'suggest',
      suggested,
      gap: Math.max(0, suggested.xp - myEntry.xp),
      suggestedLevelLabel: null,
      rosterCountAbove,
    }
  }

  if (!hydrated) return suggestState()

  // Hydrated path — designation may exist.
  if (storage.point) {
    const fresh = findEntry(storage.point.discordId, topThree, closeAbove)
    const overtaken = detectOvertake(storage.point, fresh, myEntry.rank)

    if (overtaken) {
      const rankDelta = Math.max(1, storage.point.lastSeenRank - myEntry.rank)
      return {
        kind: 'relieved',
        relievedOp: synthesizeEntry(storage.point),
        rankDelta,
        relievedAgo: 'RECENT',
        callerXp: myEntry.xp,
        suggestions: closeAbove.slice(0, 3),
        rosterCountAbove,
      }
    }

    // STANDARD: still pacing. Prefer fresh data when available.
    const point = fresh ?? synthesizeEntry(storage.point)
    return {
      kind: 'standard',
      point,
      gap: Math.max(0, point.xp - myEntry.xp),
      designatedAgo: formatDesignatedAgo(storage.point.designatedAt),
      pointLevelLabel: null,
      suggestions: closeAbove.filter((e) => e.discordId !== point.discordId).slice(0, 3),
      rosterCountAbove,
    }
  }

  // No designation yet — SUGGEST.
  return suggestState()
}

/* ──────────────────────────────────────────────────────────────────────── */
/* Helpers                                                                    */
/* ──────────────────────────────────────────────────────────────────────── */

function findEntry(
  discordId: string,
  ...sources: ReadonlyArray<readonly LeaderboardEntry[]>
): LeaderboardEntry | null {
  for (const list of sources) {
    const hit = list.find((e) => e.discordId === discordId)
    if (hit) return hit
  }
  return null
}

function extractAvatar(value: unknown): string | null {
  return typeof value === 'string' && value.length > 0 ? value : null
}

/**
 * Build a LeaderboardEntry-shaped object from a stored PointDesignation so
 * the card components can render uniformly whether the data is fresh or
 * stale-from-localStorage.
 */
function synthesizeEntry(point: {
  discordId: string
  displayName: string
  level: number
  avatar: string | null
  lastSeenRank: number
  lastSeenXp: number
}): LeaderboardEntry {
  // `avatar` is typed as Record<string, never> | null in the schema but the
  // live API returns string-or-null. We mirror what the existing code does
  // and cast through unknown when we need to pass a string back through
  // the LeaderboardEntry shape.
  return {
    rank: point.lastSeenRank,
    discordId: point.discordId,
    displayName: point.displayName,
    avatar: point.avatar as unknown as LeaderboardEntry['avatar'],
    level: point.level,
    xp: point.lastSeenXp,
  }
}
