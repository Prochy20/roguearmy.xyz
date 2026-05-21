import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, within } from 'storybook/test'
import { LeaderboardHero } from './LeaderboardHero'
import { MOCK_TOP_3 } from './_mock'

const meta = {
  title: 'Components/Community/Leaderboard/LeaderboardHero',
  component: LeaderboardHero,
  args: {
    entries: MOCK_TOP_3,
    myRank: null,
    myLevelLabel: null,
  },
  parameters: {
    layout: 'padded',
    nextjs: { appDirectory: true },
  },
} satisfies Meta<typeof LeaderboardHero>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)
    await step('Three podium cards render with their #01-#03 ranks', async () => {
      await expect(canvas.getByText('#01')).toBeInTheDocument()
      await expect(canvas.getByText('#02')).toBeInTheDocument()
      await expect(canvas.getByText('#03')).toBeInTheDocument()
    })
  },
}

export const ImInTop3: Story = {
  args: { myRank: 2, myLevelLabel: 'VETERAN' },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)
    await step('"YOU" pill marks the caller\'s podium card', async () => {
      await expect(canvas.getByText('YOU')).toBeInTheDocument()
    })
  },
}
