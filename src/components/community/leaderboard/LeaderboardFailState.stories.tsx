import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, within } from 'storybook/test'
import { LeaderboardFailState } from './LeaderboardFailState'
import {
  ERR_FORBIDDEN,
  ERR_INVALID,
  ERR_NOT_FOUND,
  ERR_UNAVAILABLE,
  ERR_UNKNOWN,
} from '../_mock'

const meta = {
  title: 'Components/Community/Leaderboard/LeaderboardFailState',
  component: LeaderboardFailState,
  args: { error: ERR_UNAVAILABLE },
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof LeaderboardFailState>

export default meta
type Story = StoryObj<typeof meta>

export const Unavailable: Story = {
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)
    await step('Pattern-matches unavailable → "LEADERBOARD UNREACHABLE"', async () => {
      await expect(canvas.getByText(/leaderboard unreachable/i)).toBeInTheDocument()
      await expect(canvas.getByText(/code 503/i)).toBeInTheDocument()
    })
  },
}

export const Forbidden: Story = {
  args: { error: ERR_FORBIDDEN },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)
    await step('forbidden → "ACCESS DENIED BY UPSTREAM"', async () => {
      await expect(canvas.getByText(/access denied by upstream/i)).toBeInTheDocument()
    })
  },
}

export const NotFound: Story = { args: { error: ERR_NOT_FOUND } }
export const Invalid: Story = { args: { error: ERR_INVALID } }
export const Unknown: Story = { args: { error: ERR_UNKNOWN } }
