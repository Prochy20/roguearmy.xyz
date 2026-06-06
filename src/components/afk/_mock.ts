import type { AfkRecord } from './types'

const minutesAgo = (m: number) => new Date(Date.now() - m * 60_000).toISOString()

const baseClosed = (
  id: string,
  reason: string | null,
  startMinAgo: number,
  endMinAgo: number,
): AfkRecord => ({
  id,
  discordId: '184920113770528768',
  guildId: 'g_01',
  reason,
  isValid: false,
  createdAt: minutesAgo(startMinAgo),
  updatedAt: minutesAgo(endMinAgo),
  endedAt: minutesAgo(endMinAgo),
  durationMs: (startMinAgo - endMinAgo) * 60_000,
})

const MIN_PER_HOUR = 60
const MIN_PER_DAY = 60 * 24

export const mockClosedSessions: AfkRecord[] = [
  baseClosed('1', 'sleeping', MIN_PER_HOUR * 30, MIN_PER_HOUR * 24),
  baseClosed('2', 'work shift', MIN_PER_HOUR * 60, MIN_PER_HOUR * 52),
  baseClosed('3', 'brb 15', MIN_PER_HOUR * 90, MIN_PER_HOUR * 89),
  baseClosed('4', 'in a raid', MIN_PER_HOUR * 100, MIN_PER_HOUR * 96),
  baseClosed('5', 'deployed IRL', MIN_PER_HOUR * 200, MIN_PER_HOUR * 188),
  // ~3 months: tests the months-scale duration formatting
  baseClosed('6', 'parental leave', MIN_PER_DAY * 95, MIN_PER_DAY * 5),
  // ~1.5 years: tests the years-scale duration formatting
  baseClosed('7', 'military deployment', MIN_PER_DAY * 580, MIN_PER_DAY * 35),
  baseClosed('8', null, MIN_PER_HOUR * 300, MIN_PER_HOUR * 290),
]

export const mockActiveSession: AfkRecord = {
  id: 'active',
  discordId: '184920113770528768',
  guildId: 'g_01',
  reason: 'sleeping',
  isValid: true,
  createdAt: minutesAgo(2),
  updatedAt: minutesAgo(2),
  endedAt: null,
  durationMs: 2 * 60_000,
}
