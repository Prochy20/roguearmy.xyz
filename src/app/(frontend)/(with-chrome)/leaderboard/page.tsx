import { redirect } from 'next/navigation'
import { getMemberAuth } from '@/lib/auth/session.server'
import { getAshleyAccessCookie } from '@/lib/auth/cookies'
import { createAshleyUserClient } from '@/lib/api/client'
import type { AshleyResult, AshleyError } from '@/lib/api/server'
import type { components } from '@/lib/api/schema'
import { SectionHeader } from '@/components/community/SectionHeader'
import { LeaderboardHero } from '@/components/community/leaderboard/LeaderboardHero'
import { LeaderboardList } from '@/components/community/leaderboard/LeaderboardList'
import { LeaderboardFailState } from '@/components/community/leaderboard/LeaderboardFailState'
import { LeaderboardEmptyState } from '@/components/community/leaderboard/LeaderboardEmptyState'
import { StickyRankBar } from '@/components/community/leaderboard/StickyRankBar'

type LeaderboardResponse = components['schemas']['LeaderboardResponseDto']
type OwnLevel = components['schemas']['OwnLevelResponseDto']

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
  const [board, myLevel] = await Promise.all([
    fetchLeaderboard(accessToken),
    fetchMyLevel(accessToken),
  ])

  const me = board.ok ? (board.data.me ?? null) : null
  const myRank = me?.rank ?? null
  // Level labels (e.g. "VETERAN") only exist on /api/leveling/me — Ashley
  // doesn't ship them per leaderboard entry. So the caller sees their own
  // label; other operatives show level numbers only.
  const myLevelLabel = myLevel.ok ? normalizeLabel(myLevel.data.levelLabel) : null
  const myNextLevelLabel = myLevel.ok ? normalizeLabel(myLevel.data.nextLevel?.label) : null

  return (
    <>
      <main className="relative z-10 mx-auto w-full max-w-[1480px] px-4 pt-10 pb-32 sm:px-8 sm:pt-16 sm:pb-40 lg:px-16 lg:pt-24 lg:pb-48">
        <SectionHeader
          num="01"
          eyebrow="LEADERBOARD"
          kicker={kickerFor(board)}
          title="OPERATIVES BY XP"
        />

        {renderBoard(board, myRank, myLevelLabel)}
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

function normalizeLabel(value: unknown): string | null {
  if (typeof value === 'string' && value.trim().length > 0) return value.trim()
  return null
}

function renderBoard(
  board: AshleyResult<LeaderboardResponse>,
  myRank: number | null,
  myLevelLabel: string | null,
) {
  if (!board.ok) return <LeaderboardFailState error={board.error} />

  const items = board.data.items
  if (items.length === 0) return <LeaderboardEmptyState />

  const top3 = items.slice(0, 3)
  const rest = items.slice(3)

  return (
    <div className="flex flex-col gap-16 sm:gap-20">
      <LeaderboardHero entries={top3} myRank={myRank} myLevelLabel={myLevelLabel} />
      {rest.length > 0 && (
        <LeaderboardList
          entries={rest}
          startRank={top3.length + 1}
          myRank={myRank}
          myLevelLabel={myLevelLabel}
        />
      )}
    </div>
  )
}

function kickerFor(board: AshleyResult<LeaderboardResponse>): string {
  if (!board.ok) return '// FEED OFFLINE — DATA UNAVAILABLE'
  if (board.data.items.length === 0) return '// BOARD UNINITIALIZED — NO ENTRIES YET'
  const total = board.data.total.toLocaleString()
  return `// ${total} RANKED · LIVE`
}

// One user-context fetch returns both the top-N list AND the caller's own
// rank (`me`) in a single response. Ashley's leveling endpoints require dual
// auth (X-API-Key + Bearer), so service-identity won't work here.
async function fetchLeaderboard(
  accessToken: string | undefined,
): Promise<AshleyResult<LeaderboardResponse>> {
  if (!accessToken) return { ok: false, error: { code: 'unauthenticated' } }
  try {
    const client = createAshleyUserClient(accessToken)
    const { data, response } = await client.GET('/api/leveling/leaderboard', {
      params: { query: { limit: LIST_SIZE } },
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
