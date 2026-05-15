import { redirect } from 'next/navigation'
import { getMemberAuth } from '@/lib/auth/session.server'
import { getAshleyAccessCookie } from '@/lib/auth/cookies'
import { createAshleyUserClient } from '@/lib/api/client'
import type { AshleyResult, AshleyError } from '@/lib/api/server'
import type { components } from '@/lib/api/schema'
import { SectionHeader } from '@/components/community/SectionHeader'
import { LeaderboardList } from '@/components/community/leaderboard/LeaderboardList'
import { LeaderboardFailState } from '@/components/community/leaderboard/LeaderboardFailState'
import { LeaderboardEmptyState } from '@/components/community/leaderboard/LeaderboardEmptyState'
import { StickyRankBar } from '@/components/community/leaderboard/StickyRankBar'
import { FormationPanel } from '@/components/community/leaderboard/formation/FormationPanel'
import { MiniPodium } from '@/components/community/leaderboard/formation/MiniPodium'
import { shouldShowBoot } from '@/lib/formation/cookies'

type LeaderboardResponse = components['schemas']['LeaderboardResponseDto']
type OwnLevel = components['schemas']['OwnLevelResponseDto']
type LeaderboardEntry = components['schemas']['LeaderboardEntryDto']

const LIST_SIZE = 20

export const metadata = {
  title: 'Leaderboard | Rogue Army',
  description: 'XP standings across the Rogue Army Discord — operatives ranked by activity.',
}

export default async function LeaderboardPage() {
  const auth = await getMemberAuth()
  if (!auth.authenticated || !auth.member) {
    redirect('/auth/login?returnTo=/leaderboard')
  }

  const accessToken = await getAshleyAccessCookie()

  // Top-N board + caller's level + boot-cookie all parallelize cleanly.
  const [board, myLevel, showBoot] = await Promise.all([
    fetchLeaderboard(accessToken, LIST_SIZE, 0),
    fetchMyLevel(accessToken),
    shouldShowBoot(),
  ])

  const me = board.ok ? (board.data.me ?? null) : null
  const myLevelLabel = myLevel.ok ? normalizeLabel(myLevel.data.levelLabel) : null
  const myNextLevelLabel = myLevel.ok ? normalizeLabel(myLevel.data.nextLevel?.label) : null

  // Operatives directly above the caller for the POINT card's "closer
  // targets" strip and for the auto-suggested designation. If the caller
  // is inside the top-LIST_SIZE we derive from the already-fetched items;
  // otherwise we issue a single small follow-up fetch.
  const closeAbove = await resolveCloseAbove(accessToken, board, me)

  const operativeName = auth.member.globalName || auth.member.username || null

  return (
    <>
      <main className="relative z-10 mx-auto w-full max-w-[1480px] px-4 pt-10 pb-32 sm:px-8 sm:pt-16 sm:pb-40 lg:px-16 lg:pt-24 lg:pb-48">
        <SectionHeader
          num="01"
          eyebrow="LEADERBOARD"
          kicker={kickerFor(board)}
          title="OPERATIVES BY XP"
        />

        <FormationPanel
          myEntry={me}
          myLevelData={
            myLevel.ok
              ? {
                  level: myLevel.data.level,
                  levelLabel: myLevelLabel,
                  progress: myLevel.data.progress,
                  xpToNextLevel: extractNumber(myLevel.data.xpToNextLevel),
                  nextLevel: myLevel.data.nextLevel?.level ?? null,
                  nextLevelLabel: myNextLevelLabel,
                }
              : null
          }
          topThree={board.ok ? board.data.items.slice(0, 3) : []}
          closeAbove={closeAbove}
          totalOps={board.ok ? board.data.total : 0}
          rosterCountAbove={me ? Math.max(0, me.rank - 1) : 0}
          showBoot={showBoot}
          operativeName={operativeName}
        />

        {board.ok && board.data.items.length > 0 && (
          <div className="mt-10 sm:mt-12">
            <MiniPodium entries={board.data.items.slice(0, 3)} myRank={me?.rank ?? null} />
          </div>
        )}

        {renderList(board, me, myLevelLabel)}
      </main>

      <StickyRankBar
        me={me}
        levelLabel={myLevelLabel}
        nextLevelLabel={myNextLevelLabel}
        fail={board.ok ? null : board.error}
      />
    </>
  )
}

function renderList(
  board: AshleyResult<LeaderboardResponse>,
  me: LeaderboardEntry | null,
  myLevelLabel: string | null,
) {
  if (!board.ok) {
    return (
      <div className="mt-10 sm:mt-12">
        <LeaderboardFailState error={board.error} />
      </div>
    )
  }
  const items = board.data.items
  if (items.length === 0) return <LeaderboardEmptyState />
  const rest = items.slice(3)
  if (rest.length === 0) return null
  return (
    <div className="mt-10 sm:mt-12">
      <LeaderboardList
        entries={rest}
        startRank={4}
        myRank={me?.rank ?? null}
        myLevelLabel={myLevelLabel}
      />
    </div>
  )
}

function kickerFor(board: AshleyResult<LeaderboardResponse>): string {
  if (!board.ok) return '// FEED OFFLINE — DATA UNAVAILABLE'
  if (board.data.items.length === 0) return '// BOARD UNINITIALIZED — NO ENTRIES YET'
  const total = board.data.total.toLocaleString()
  return `// ${total} RANKED · LIVE`
}

function normalizeLabel(value: unknown): string | null {
  if (typeof value === 'string' && value.trim().length > 0) return value.trim()
  return null
}

function extractNumber(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) return value
  return null
}

/**
 * Resolve the closest 3 operatives above the caller. Two paths:
 *
 *   1. Caller is inside the top-LIST_SIZE → already in the main board; just
 *      slice the items strictly above their rank.
 *   2. Caller is below the top-LIST_SIZE → issue a follow-up fetch sized to
 *      exactly the 3 slots directly above their rank.
 *
 * Returns an empty array on rank 1, no-board, or fetch failure.
 */
async function resolveCloseAbove(
  accessToken: string | undefined,
  board: AshleyResult<LeaderboardResponse>,
  me: LeaderboardEntry | null,
): Promise<LeaderboardEntry[]> {
  if (!board.ok || !me || me.rank < 2) return []
  if (me.rank <= LIST_SIZE) {
    return board.data.items
      .filter((e) => e.rank < me.rank)
      .sort((a, b) => b.rank - a.rank)
      .slice(0, 3)
      .reverse()
  }
  const limit = Math.min(3, me.rank - 1)
  const offset = Math.max(0, me.rank - 1 - limit)
  const slice = await fetchLeaderboard(accessToken, limit, offset)
  if (!slice.ok) return []
  return slice.data.items.filter((e) => e.rank < me.rank)
}

// One user-context fetch returns both the top-N list AND the caller's own
// rank (`me`) in a single response. Ashley's leveling endpoints require dual
// auth (X-API-Key + Bearer), so service-identity won't work here.
async function fetchLeaderboard(
  accessToken: string | undefined,
  limit: number,
  offset: number,
): Promise<AshleyResult<LeaderboardResponse>> {
  if (!accessToken) return { ok: false, error: { code: 'unauthenticated' } }
  try {
    const client = createAshleyUserClient(accessToken)
    const { data, response } = await client.GET('/api/leveling/leaderboard', {
      params: { query: { limit, offset } },
    })
    if (data) return { ok: true, data }
    return { ok: false, error: classifyHttpStatus(response?.status ?? 0) }
  } catch {
    return { ok: false, error: { code: 'unavailable', status: 0 } }
  }
}

// Caller's own level details — needed for the level *label* (e.g. "VETERAN")
// which the leaderboard endpoint omits. Failure here is non-fatal; we just
// show the level number without a label.
async function fetchMyLevel(
  accessToken: string | undefined,
): Promise<AshleyResult<OwnLevel>> {
  if (!accessToken) return { ok: false, error: { code: 'unauthenticated' } }
  try {
    const client = createAshleyUserClient(accessToken)
    const { data, response } = await client.GET('/api/leveling/me')
    if (data) return { ok: true, data }
    return { ok: false, error: classifyHttpStatus(response?.status ?? 0) }
  } catch {
    return { ok: false, error: { code: 'unavailable', status: 0 } }
  }
}

function classifyHttpStatus(status: number): AshleyError {
  if (status === 401) return { code: 'unauthorized', status }
  if (status === 403) return { code: 'forbidden', status }
  if (status === 404) return { code: 'not_found', status }
  if (status >= 400 && status < 500) return { code: 'invalid', status }
  if (status >= 500 || status === 0) return { code: 'unavailable', status }
  return { code: 'unknown', status }
}
