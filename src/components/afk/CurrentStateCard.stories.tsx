import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { CurrentStateCard } from './CurrentStateCard'
import type { AfkRecord } from './types'

const meta = {
  title: 'Components/AFK/CurrentStateCard',
  component: CurrentStateCard,
  parameters: { layout: 'padded', backgrounds: { default: 'void' } },
} satisfies Meta<typeof CurrentStateCard>

export default meta
type Story = StoryObj<typeof meta>

const minutesAgo = (m: number) => new Date(Date.now() - m * 60_000).toISOString()
const daysAgo = (d: number) => new Date(Date.now() - d * 86_400_000).toISOString()

const baseRecord = (overrides: Partial<AfkRecord> = {}): AfkRecord => ({
  id: 'rec_01',
  discordId: '184920113770528768',
  guildId: 'g_01',
  reason: null,
  isValid: true,
  createdAt: minutesAgo(2),
  updatedAt: minutesAgo(2),
  endedAt: null,
  durationMs: 2 * 60_000,
  ...overrides,
})

export const AfkSleeping: Story = {
  args: {
    afkRecord: baseRecord({ reason: 'sleeping' }),
    latestClosedSession: null,
  },
}

export const AfkNoReason: Story = {
  args: {
    afkRecord: baseRecord({ reason: null }),
    latestClosedSession: null,
  },
}

export const AfkLongReason: Story = {
  args: {
    afkRecord: baseRecord({
      reason:
        'on a 12-hour shift driving an excavator and probably will not be back until late evening',
    }),
    latestClosedSession: null,
  },
}

/** Months-scale AFK: tests MO/D/H ticker + footer date for long absences. */
export const AfkMonthsLong: Story = {
  args: {
    afkRecord: baseRecord({
      reason: 'parental leave',
      createdAt: daysAgo(95),
    }),
    latestClosedSession: null,
  },
}

/** Years-scale AFK: tests Y/MO/D ticker — forgotten / dormant accounts. */
export const AfkYearsLong: Story = {
  args: {
    afkRecord: baseRecord({
      reason: 'military deployment',
      createdAt: daysAgo(580),
    }),
    latestClosedSession: null,
  },
}

export const ActiveWithHistory: Story = {
  args: {
    afkRecord: null,
    latestClosedSession: baseRecord({
      isValid: false,
      createdAt: minutesAgo(180),
      endedAt: minutesAgo(60),
      durationMs: 120 * 60_000,
    }),
  },
}

export const ActiveNoHistory: Story = {
  args: {
    afkRecord: null,
    latestClosedSession: null,
  },
}
