import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, within } from 'storybook/test'
import { LeaderboardList } from './LeaderboardList'
import { MOCK_REST } from './_mock'

const meta = {
  title: 'Components/Community/Leaderboard/LeaderboardList',
  component: LeaderboardList,
  args: {
    entries: MOCK_REST,
    startRank: 4,
    myRank: null,
    myLevelLabel: null,
  },
  parameters: {
    layout: 'padded',
    nextjs: { appDirectory: true },
  },
} satisfies Meta<typeof LeaderboardList>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)
    await step('Renders header columns + first row rank', async () => {
      await expect(canvas.getByText('OPERATIVE')).toBeInTheDocument()
      await expect(canvas.getByText('#004')).toBeInTheDocument()
    })
  },
}

export const WithMeHighlighted: Story = {
  args: { myRank: 7, myLevelLabel: 'OPERATOR', myXp: 64200 },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)
    await step('"// YOU" sub-label marks the caller row', async () => {
      await expect(canvas.getByText(/^\/\/ YOU$/)).toBeInTheDocument()
    })
    await step('DST column header renders when myXp is provided', async () => {
      await expect(canvas.getByText('DST')).toBeInTheDocument()
    })
  },
}
