import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, userEvent, within } from 'storybook/test'
import { StickyRankBar } from './StickyRankBar'
import { ERR_UNAVAILABLE } from '../_mock'
import { MOCK_ME } from './_mock'

const meta = {
  title: 'Components/Community/Leaderboard/StickyRankBar',
  component: StickyRankBar,
  args: {
    me: MOCK_ME,
    levelLabel: 'OPERATOR',
    nextLevelLabel: 'VETERAN',
    fail: null,
  },
  parameters: {
    layout: 'fullscreen',
    nextjs: { appDirectory: true },
  },
  decorators: [
    (Story) => (
      <div style={{ minHeight: '70vh', padding: '1rem' }}>
        <p style={{ color: '#888', fontFamily: 'monospace', fontSize: 12 }}>
          (Sticky bar is fixed to the bottom of the viewport.)
        </p>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof StickyRankBar>

export default meta
type Story = StoryObj<typeof meta>

export const RankedUser: Story = {
  play: async ({ step }) => {
    // StickyRankBar uses `position: fixed` so it can render outside canvasElement; query the body.
    const body = within(document.body)
    await step('Rank + level + xp render on the bar', async () => {
      await expect(body.getByText('#07')).toBeInTheDocument()
      await expect(body.getByText('22')).toBeInTheDocument()
      await expect(body.getByText('64,200')).toBeInTheDocument()
    })
    await step('Clicking the bar toggles aria-expanded', async () => {
      const button = body.getByRole('button', { name: /expand to see your cohort/i })
      await userEvent.click(button)
      await expect(button).toHaveAttribute('aria-expanded', 'true')
    })
  },
}

export const NoXp: Story = {
  args: { me: null },
  play: async ({ step }) => {
    const body = within(document.body)
    await step('"NO XP YET" banner shows for caller with no rank', async () => {
      await expect(body.getByText(/no xp yet/i)).toBeInTheDocument()
    })
  },
}

export const FetchFailed: Story = {
  args: { fail: ERR_UNAVAILABLE },
  play: async ({ step }) => {
    const body = within(document.body)
    await step('Recalculating banner renders for transient fails', async () => {
      await expect(body.getByText(/being recalculated/i)).toBeInTheDocument()
    })
  },
}
