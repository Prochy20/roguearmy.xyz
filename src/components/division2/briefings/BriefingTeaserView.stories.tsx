import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, within } from 'storybook/test'
import { BriefingTeaserView } from './BriefingTeaserView'
import { MOCK_BRIEFING_DAILY, MOCK_BRIEFING_WEEKLY } from '../_mock'

const baseArgs = {
  briefing: MOCK_BRIEFING_WEEKLY,
  designator: 'WK21_2026',
  periodLabel: 'MAY 19 → MAY 25',
  dateLabel: 'WEEK OF MAY 19',
  readMinutes: 6,
}

const meta = {
  title: 'Components/Division2/Briefings/BriefingTeaserView',
  component: BriefingTeaserView,
  args: baseArgs,
  parameters: {
    layout: 'fullscreen',
    nextjs: {
      appDirectory: true,
      navigation: { pathname: '/division-2/briefings/week-21-escalation-roll-up-a3f2c1b8' },
    },
  },
} satisfies Meta<typeof BriefingTeaserView>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)
    await step('CLASSIFIED INTEL gate renders with Authenticate CTA', async () => {
      await expect(canvas.getByText(/classified intel/i)).toBeInTheDocument()
      await expect(
        canvas.getByRole('button', { name: /authenticate/i }),
      ).toBeInTheDocument()
    })
  },
}

/**
 * Daily briefings use the orange (`game-d2`) reader accent instead of the
 * weekly cyan — the header chrome (StatRibbon, breadcrumb, hero frame)
 * picks up the new tint while the magenta auth card stays constant.
 */
export const Daily: Story = {
  args: {
    briefing: MOCK_BRIEFING_DAILY,
    designator: 'D_2026-05-21',
    periodLabel: 'MAY 21',
    dateLabel: 'MAY 21',
    readMinutes: 3,
  },
}

/**
 * Thumbnail URL is null — `ReaderHeroFrame` swaps the image for the
 * tactical NoSignal placeholder, preserving the corner ticks and
 * film-strip metadata bar.
 */
export const NoSignal: Story = {
  args: { briefing: { ...MOCK_BRIEFING_WEEKLY, thumbnailUrl: null } },
}
